from datetime import timedelta, date
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.contrib.auth import authenticate
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Mission, XPLog, Building, UserBuilding, Achievement, UserAchievement
from .serializers import (
    UserSerializer, RegisterSerializer, MissionSerializer,
    BuildingSerializer, UserBuildingSerializer, AchievementSerializer,
    XPLogSerializer, LeaderboardSerializer
)
from .gamification import complete_mission_gamified
from .ai_service import suggest_missions_ai, get_coaching_advice_ai

# ================= AUTHENTICATION =================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """FR-AUTH-01 & FR-AUTH-02: Register user, starting level 1, 0 XP, 0 coins."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Registration successful! Welcome to VYRON.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    FR-AUTH-03, FR-AUTH-04, FR-AUTH-05:
    Login with email or username + password.
    Lock for 15 minutes after 5 consecutive failed attempts.
    """
    credential = request.data.get('email') or request.data.get('username') or ''
    password = request.data.get('password', '')
    
    if not credential or not password:
        return Response({'detail': 'Please provide email/username and password.'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.filter(Q(email__iexact=credential) | Q(username__iexact=credential)).first()
    
    if user:
        if user.is_locked():
            remaining_mins = int((user.lock_until - timezone.now()).total_seconds() // 60) + 1
            return Response({
                'detail': f'Account locked due to 5 failed attempts. Please retry in {remaining_mins} minutes.'
            }, status=status.HTTP_403_FORBIDDEN)
            
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user:
            # Reset failed attempts
            user.failed_login_attempts = 0
            user.lock_until = None
            user.save(update_fields=['failed_login_attempts', 'lock_until'])
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        else:
            # Failed attempt
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.lock_until = timezone.now() + timedelta(minutes=15)
                user.save(update_fields=['failed_login_attempts', 'lock_until'])
                return Response({
                    'detail': 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                user.save(update_fields=['failed_login_attempts'])
                attempts_left = 5 - user.failed_login_attempts
                return Response({
                    'detail': f'Invalid credentials. {attempts_left} attempts remaining before temporary lock.'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
    return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """FR-AUTH-06: Log out user, blacklist token if refresh token provided."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """FR-SET-01 & FR-SET-03: View or update user profile, avatar, display name, notifications."""
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
        
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """FR-SET-02: Change password after entering current password."""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'detail': 'Please provide current and new password.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if len(new_password) < 8:
        return Response({'detail': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
        
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password updated successfully.'})


# ================= MISSIONS (CRUD + GAMIFICATION) =================

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def missions_list_create_view(request):
    """
    FR-MIS-01 & FR-MIS-02:
    List user missions with filters (status, category, difficulty, search).
    Create mission with title, difficulty, category, and due date.
    """
    user = request.user
    
    if request.method == 'GET':
        missions = Mission.objects.filter(user=user)
        
        status_filter = request.query_params.get('status')
        if status_filter and status_filter.lower() != 'all':
            missions = missions.filter(status__iexact=status_filter)
            
        category_filter = request.query_params.get('category')
        if category_filter and category_filter.lower() != 'all':
            missions = missions.filter(category__iexact=category_filter)
            
        difficulty_filter = request.query_params.get('difficulty')
        if difficulty_filter and difficulty_filter.lower() != 'all':
            missions = missions.filter(difficulty__iexact=difficulty_filter)
            
        search_query = request.query_params.get('search')
        if search_query:
            missions = missions.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))
            
        sort_by = request.query_params.get('sort', 'due_date')
        if sort_by == 'due_date':
            missions = missions.order_by('due_date', '-created_at')
        else:
            missions = missions.order_by('-created_at')
            
        serializer = MissionSerializer(missions, many=True, context={'request': request})
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = MissionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            mission = serializer.save()
            return Response(MissionSerializer(mission).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def mission_detail_view(request, pk):
    """
    FR-MIS-03 & FR-MIS-04:
    Update non-completed mission. Delete mission with verification.
    """
    try:
        mission = Mission.objects.get(pk=pk, user=request.user)
    except Mission.DoesNotExist:
        return Response({'detail': 'Mission not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'GET':
        return Response(MissionSerializer(mission).data)
        
    elif request.method == 'PUT':
        if mission.status == 'Completed':
            return Response({'detail': 'Completed missions cannot be edited.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MissionSerializer(mission, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            mission = serializer.save()
            return Response(MissionSerializer(mission).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        # Deleting a completed mission does not remove XP already earned (FR-MIS-04)
        mission.delete()
        return Response({'message': 'Mission deleted successfully.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_mission_view(request, pk):
    """
    FR-MIS-06, FR-MIS-07, FR-GAM-01 through FR-GAM-05:
    Mark as complete, calculate XP, coins, streak bonus, on-time bonus.
    Check unlocks and achievements.
    """
    try:
        mission = Mission.objects.get(pk=pk, user=request.user)
    except Mission.DoesNotExist:
        return Response({'detail': 'Mission not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    if mission.status == 'Completed':
        return Response({'detail': 'Mission is already completed. No duplicate rewards.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        result = complete_mission_gamified(mission, request.user)
        # Return updated user object for instantaneous dashboard card sync
        result['user'] = UserSerializer(request.user, context={'request': request}).data
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ================= CITY & BUILDINGS =================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def city_overview_view(request):
    """
    FR-CTY-01 through FR-CTY-05 & Section 4.5:
    Returns constructed buildings, full building catalogue, next unlock, and city level.
    """
    user = request.user
    constructed = UserBuilding.objects.filter(user=user).select_related('building').order_by('built_at')
    catalogue = Building.objects.filter(is_active=True).order_by('required_level', 'cost')
    
    # Next unlock: building with lowest required_level > user.level
    next_unlock = catalogue.filter(required_level__gt=user.level).first()
    
    return Response({
        'city_level': (constructed.count() // 5) + 1,
        'constructed_count': constructed.count(),
        'constructed_buildings': UserBuildingSerializer(constructed, many=True).data,
        'catalogue': BuildingSerializer(catalogue, many=True, context={'request': request}).data,
        'next_unlock': BuildingSerializer(next_unlock, context={'request': request}).data if next_unlock else None,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def construct_building_view(request):
    """
    FR-CTY-02 & FR-CTY-03:
    Construct an unlocked building if user has sufficient coins.
    Deduct cost, create UserBuilding, check achievements.
    """
    building_id = request.data.get('building_id')
    pos_x = request.data.get('pos_x', 0)
    pos_y = request.data.get('pos_y', 0)
    
    try:
        building = Building.objects.get(id=building_id, is_active=True)
    except Building.DoesNotExist:
        return Response({'detail': 'Building not found in catalogue.'}, status=status.HTTP_404_NOT_FOUND)
        
    user = request.user
    
    # Check level unlock
    if user.level < building.required_level:
        return Response({
            'detail': f'Building locked! Requires Level {building.required_level}. Current level: {user.level}.'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    # Check coins
    if user.coins < building.cost:
        missing = building.cost - user.coins
        return Response({
            'detail': f'Insufficient coins! Need {missing} more coins to construct {building.name}.'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    # Deduct coins and construct
    user.coins -= building.cost
    user.save(update_fields=['coins'])
    
    user_building = UserBuilding.objects.create(
        user=user,
        building=building,
        pos_x=pos_x,
        pos_y=pos_y
    )
    
    # Check achievements (e.g. City Builder)
    new_achievements = []
    builder_ach = Achievement.objects.filter(condition_type='city_builder').first()
    if builder_ach and not UserAchievement.objects.filter(user=user, achievement=builder_ach).exists():
        UserAchievement.objects.create(user=user, achievement=builder_ach)
        new_achievements.append({'name': builder_ach.name, 'description': builder_ach.description, 'icon': builder_ach.icon})
        
    return Response({
        'message': f'Successfully constructed {building.name}!',
        'user_building': UserBuildingSerializer(user_building).data,
        'remaining_coins': user.coins,
        'city_level': (user.constructed_buildings.count() // 5) + 1,
        'new_achievements': new_achievements,
        'user': UserSerializer(user, context={'request': request}).data,
    }, status=status.HTTP_201_CREATED)


# ================= ANALYTICS =================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_view(request):
    """
    SRS Section 6: Data Reporting and Analytics
    - Productivity percentage = (completed / planned) * 100
    - Weekly XP trend (Mon to Sun)
    - Focus time in hours
    - Current streak in days
    - Category split
    - XP history log
    """
    user = request.user
    range_param = request.query_params.get('range', 'week').lower()
    today = timezone.now().date()
    
    if range_param == 'month':
        start_date = today.replace(day=1)
        end_date = today
    else:  # week: Monday to Sunday of current week
        start_date = today - timedelta(days=today.weekday())  # Monday
        end_date = start_date + timedelta(days=6)             # Sunday
        
    # Planned missions: due_date in period
    planned_missions = Mission.objects.filter(user=user, due_date__range=[start_date, end_date])
    planned_count = planned_missions.count()
    
    # Completed missions: completed in period or status Completed with due_date in period
    completed_missions = planned_missions.filter(status='Completed')
    completed_count = completed_missions.count()
    
    # Productivity percentage
    if planned_count > 0:
        productivity_pct = int(round((completed_count / planned_count) * 100))
    else:
        productivity_pct = 0
        
    # Total focus time in hours (from all completed missions in this period)
    focus_minutes = completed_missions.aggregate(total_min=Sum('focus_minutes'))['total_min'] or 0
    focus_hours = round(focus_minutes / 60.0, 1)
    
    # Daily XP for the week (Monday through Sunday)
    week_start = today - timedelta(days=today.weekday())
    daily_xp_data = []
    day_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for i in range(7):
        day_date = week_start + timedelta(days=i)
        xp_sum = XPLog.objects.filter(
            user=user,
            created_at__date=day_date
        ).aggregate(day_xp=Sum('xp'))['day_xp'] or 0
        
        daily_xp_data.append({
            'day': day_labels[i],
            'date': str(day_date),
            'xp': xp_sum
        })
        
    weekly_xp_gain = sum(item['xp'] for item in daily_xp_data)
    
    # Category split
    category_counts = Mission.objects.filter(user=user, status='Completed').values('category').annotate(count=Count('id')).order_by('-count')
    category_split = {item['category']: item['count'] for item in category_counts}
    
    # Recent XP history logs (latest 15)
    recent_logs = XPLog.objects.filter(user=user).select_related('mission')[:15]
    
    return Response({
        'range': range_param,
        'planned_count': planned_count,
        'completed_count': completed_count,
        'productivity_percentage': productivity_pct,
        'focus_hours': focus_hours,
        'current_streak': user.streak,
        'weekly_xp_gain': weekly_xp_gain,
        'daily_xp': daily_xp_data,
        'category_split': category_split,
        'recent_logs': XPLogSerializer(recent_logs, many=True).data,
    })


# ================= ACHIEVEMENTS =================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def achievements_view(request):
    """FR-ACH-01 through FR-ACH-03: List all achievements with earned status and dates."""
    achievements = Achievement.objects.all().order_by('id')
    serializer = AchievementSerializer(achievements, many=True, context={'request': request})
    
    earned_count = UserAchievement.objects.filter(user=request.user).count()
    total_count = achievements.count()
    
    return Response({
        'total_count': total_count,
        'earned_count': earned_count,
        'achievements': serializer.data,
    })


# ================= LEADERBOARD =================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard_view(request):
    """
    FR-LDR-01 through FR-LDR-03:
    Ranks users by total XP descending. Logged-in user highlighted.
    Only shows display name, level, total XP, and coins (no private data).
    """
    users = User.objects.all().order_by('-total_xp', '-level', '-coins')[:50]
    serializer = LeaderboardSerializer(users, many=True, context={'request': request})
    
    # Find user's own rank
    all_user_ids = list(User.objects.order_by('-total_xp', '-level', '-coins').values_list('id', flat=True))
    user_rank = all_user_ids.index(request.user.id) + 1 if request.user.id in all_user_ids else 1
    
    return Response({
        'current_user_rank': user_rank,
        'leaderboard': serializer.data,
    })


# ================= AI ASSISTANT =================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_suggest_view(request):
    """AI task breakdown and mission suggestions using API key in .env."""
    goal = request.data.get('goal', 'Complete semester project')
    category = request.data.get('category', 'Coding')
    suggestions = suggest_missions_ai(goal, category)
    return Response({'suggestions': suggestions})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_coach_view(request):
    """AI coaching advice based on user stats."""
    user = request.user
    today = timezone.now().date()
    start_date = today - timedelta(days=today.weekday())
    end_date = start_date + timedelta(days=6)
    
    planned = Mission.objects.filter(user=user, due_date__range=[start_date, end_date]).count()
    completed = Mission.objects.filter(user=user, due_date__range=[start_date, end_date], status='Completed').count()
    rate = int(round((completed / planned) * 100)) if planned > 0 else 78
    
    advice = get_coaching_advice_ai(user.display_name or user.username, user.level, user.streak, rate)
    return Response(advice)


# ================= SEED DATA ENDPOINT =================

@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
def seed_data_view(request):
    """
    Seeds default buildings from SRS Section 4.4, default achievements,
    sample rivals for leaderboard, and initializes the Fahima account
    matching the UI design image.
    """
    # 1. Buildings Catalogue
    buildings_data = [
        {'name': 'Residential House', 'required_level': 1, 'cost': 100, 'image': 'house', 'description': 'Comfortable citizen apartments that increase city vitality.'},
        {'name': 'Park', 'required_level': 2, 'cost': 300, 'image': 'park', 'description': 'Lush eco-domes and green spaces that inspire focused thinking.'},
        {'name': 'Library', 'required_level': 3, 'cost': 600, 'image': 'library', 'description': 'High-tech digital repository holding galactic knowledge.'},
        {'name': 'Business Tower', 'required_level': 4, 'cost': 1200, 'image': 'tower', 'description': 'Futuristic commerce hub generating commerce and opportunities.'},
        {'name': 'Research Center', 'required_level': 5, 'cost': 2500, 'image': 'research', 'description': 'Quantum laboratories dedicated to breakthrough innovations.'},
        {'name': 'Central Tower', 'required_level': 8, 'cost': 5000, 'image': 'central', 'description': 'Grand skyscraper landmark dominating the neon skyline.'},
    ]
    for b in buildings_data:
        Building.objects.update_or_create(name=b['name'], defaults=b)

    # 2. Achievements Catalogue
    achievements_data = [
        {'name': 'First Mission Unlocked', 'description': 'Complete the first mission', 'condition_type': 'first_mission', 'condition_value': 1, 'icon': 'flag'},
        {'name': 'City Builder', 'description': 'Construct the first building', 'condition_type': 'city_builder', 'condition_value': 1, 'icon': 'building'},
        {'name': 'Productivity Pro', 'description': 'Complete 7 missions in one week', 'condition_type': 'productivity_pro', 'condition_value': 7, 'icon': 'star'},
        {'name': 'XP Collector', 'description': 'Earn 1,000 total XP', 'condition_type': 'xp_collector', 'condition_value': 1000, 'icon': 'award'},
        {'name': 'Dream Achiever', 'description': 'Reach Level 10', 'condition_type': 'dream_achiever', 'condition_value': 10, 'icon': 'crown'},
    ]
    for a in achievements_data:
        Achievement.objects.update_or_create(name=a['name'], defaults=a)

    # 3. Create or Update Fahima Account matching UI Screenshot
    fahima, created = User.objects.get_or_create(
        username='fahima',
        defaults={
            'email': 'fahima@vyron.app',
            'full_name': 'Fahima F',
            'display_name': 'Fahima F',
            'level': 5,
            'total_xp': 4780,  # Level 5 with 780/1000 XP (4000 + 780 = 4780)
            'coins': 3250,
            'streak': 5,
            'avatar': '/assets/avatar_fahima.jpg',
            'last_active_date': timezone.now().date(),
        }
    )
    if created:
        fahima.set_password('password123!')
        fahima.save()
    else:
        fahima.level = 5
        fahima.total_xp = 4780
        fahima.coins = 3250
        fahima.streak = 5
        fahima.save()

    # 4. Construct sample buildings for Fahima (Residential House, Park, Library, Business Tower)
    house = Building.objects.filter(name='Residential House').first()
    park = Building.objects.filter(name='Park').first()
    library = Building.objects.filter(name='Library').first()
    tower = Building.objects.filter(name='Business Tower').first()
    
    if house and not UserBuilding.objects.filter(user=fahima, building=house).exists():
        UserBuilding.objects.create(user=fahima, building=house, pos_x=1, pos_y=1)
    if park and not UserBuilding.objects.filter(user=fahima, building=park).exists():
        UserBuilding.objects.create(user=fahima, building=park, pos_x=2, pos_y=1)
    if library and not UserBuilding.objects.filter(user=fahima, building=library).exists():
        UserBuilding.objects.create(user=fahima, building=library, pos_x=1, pos_y=2)
    if tower and not UserBuilding.objects.filter(user=fahima, building=tower).exists():
        UserBuilding.objects.create(user=fahima, building=tower, pos_x=2, pos_y=2)

    # 5. Award achievements to Fahima
    first_ach = Achievement.objects.filter(name='First Mission Unlocked').first()
    city_ach = Achievement.objects.filter(name='City Builder').first()
    xp_ach = Achievement.objects.filter(name='XP Collector').first()
    if first_ach:
        UserAchievement.objects.get_or_create(user=fahima, achievement=first_ach)
    if city_ach:
        UserAchievement.objects.get_or_create(user=fahima, achievement=city_ach)
    if xp_ach:
        UserAchievement.objects.get_or_create(user=fahima, achievement=xp_ach)

    # 6. Create Current Mission and sample missions for Fahima
    today = timezone.now().date()
    py_mission, _ = Mission.objects.get_or_create(
        user=fahima,
        title='Complete Python Assignment',
        defaults={
            'description': 'Finish your Python assignment and submit it.',
            'category': 'Coding',
            'difficulty': 'Hard',
            'due_date': today + timedelta(days=1),
            'status': 'Pending',
            'xp_reward': 200,
            'coin_reward': 100,
            'focus_minutes': 45
        }
    )

    # Completed sample missions for this week
    sample_completed = [
        ('Database Schema Design', 'Study', 'Medium', 100, 50, 45, today - timedelta(days=4)),
        ('React Component Hierarchy', 'Coding', 'Medium', 100, 50, 60, today - timedelta(days=3)),
        ('Algorithm Analysis Review', 'Study', 'Hard', 200, 100, 50, today - timedelta(days=2)),
        ('Morning Workout & Cardio', 'Health', 'Easy', 50, 25, 30, today - timedelta(days=2)),
        ('Django REST API Endpoints', 'Coding', 'Hard', 200, 100, 90, today - timedelta(days=1)),
        ('Gamification Logic Unit Tests', 'Coding', 'Medium', 100, 50, 45, today - timedelta(days=1)),
        ('Weekly Progress Self-Audit', 'Work', 'Easy', 50, 25, 20, today),
    ]
    for title, cat, diff, xp, coins, focus, c_date in sample_completed:
        m, was_created = Mission.objects.get_or_create(
            user=fahima,
            title=title,
            defaults={
                'category': cat,
                'difficulty': diff,
                'due_date': c_date,
                'status': 'Completed',
                'xp_reward': xp,
                'coin_reward': coins,
                'focus_minutes': focus,
                'completed_at': timezone.now() - (today - c_date)
            }
        )
        if was_created:
            XPLog.objects.create(
                user=fahima,
                mission=m,
                xp=xp,
                coins=coins,
                reason=f"Completed {title}",
                created_at=timezone.now() - (today - c_date)
            )

    # 7. Add sample Leaderboard rivals (NovaDreamer and CodeQueen)
    nova, created_nova = User.objects.get_or_create(
        username='novadreamer',
        defaults={
            'email': 'nova@vyron.app',
            'full_name': 'Nova Dreamer',
            'display_name': 'NovaDreamer',
            'level': 12,
            'total_xp': 11850,
            'coins': 8500,
            'streak': 14,
            'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
    )
    if created_nova:
        nova.set_password('password123!')
        nova.save()

    queen, created_queen = User.objects.get_or_create(
        username='codequeen',
        defaults={
            'email': 'queen@vyron.app',
            'full_name': 'Code Queen',
            'display_name': 'CodeQueen',
            'level': 11,
            'total_xp': 10420,
            'coins': 7200,
            'streak': 9,
            'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        }
    )
    if created_queen:
        queen.set_password('password123!')
        queen.save()

    return Response({'message': 'Sample data successfully seeded for VYRON!'})
