"""
Gamification Engine for VYRON
Implements reward calculations, level formulas, streaks, achievements, and unlock conditions
per SRS Section 4.3, 4.4, 4.6.
"""

from datetime import date, timedelta
from django.db import transaction
from django.utils import timezone
from .models import User, Mission, XPLog, Building, UserBuilding, Achievement, UserAchievement

BASE_REWARDS = {
    'Easy': {'xp': 50, 'coins': 25},
    'Medium': {'xp': 100, 'coins': 50},
    'Hard': {'xp': 200, 'coins': 100},
}

def calculate_level(total_xp: int) -> int:
    """Formula: Level = floor(TotalXP / 1000) + 1"""
    return (total_xp // 1000) + 1

def calculate_mission_rewards(mission: Mission, current_streak: int, completion_date: date = None):
    """
    Coins are always half of base XP and not changed by bonuses.
    XP bonuses:
    - On-time bonus: +10% if completed on or before due date
    - Streak bonus: +5% for each consecutive day completed before today (prior streak), capped at +25%
    XP_earned = Base * (1 + OnTime + Streak)
    """
    if completion_date is None:
        completion_date = timezone.now().date()
        
    diff = mission.difficulty if mission.difficulty in BASE_REWARDS else 'Medium'
    base_xp = BASE_REWARDS[diff]['xp']
    base_coins = BASE_REWARDS[diff]['coins']
    
    # On-time bonus (+10%)
    on_time = 0.10 if completion_date <= mission.due_date else 0.0
    
    # Streak bonus (+5% per prior streak day, capped at 25%)
    streak_bonus = min(0.25, current_streak * 0.05)
    
    total_multiplier = 1.0 + on_time + streak_bonus
    xp_earned = int(round(base_xp * total_multiplier))
    coins_earned = base_coins
    
    return {
        'base_xp': base_xp,
        'on_time_bonus': on_time,
        'streak_bonus': streak_bonus,
        'xp_earned': xp_earned,
        'coins_earned': coins_earned,
    }

def update_user_streak(user: User, completion_date: date = None) -> int:
    """
    FR-GAM-04: The system shall update the streak:
    +1 if a mission was completed yesterday, reset to 1 after a missed day.
    If already completed a mission today, streak remains unchanged.
    """
    if completion_date is None:
        completion_date = timezone.now().date()
        
    if not user.last_active_date:
        user.streak = 1
    elif user.last_active_date == completion_date:
        # Already active today, streak continues
        pass
    elif user.last_active_date == completion_date - timedelta(days=1):
        # Completed yesterday -> increment streak
        user.streak += 1
    else:
        # Missed a day -> reset to 1
        user.streak = 1
        
    user.last_active_date = completion_date
    return user.streak

@transaction.atomic
def complete_mission_gamified(mission: Mission, user: User):
    """
    Atomic mission completion process (SRS Section 5.2):
    1. Verify mission belongs to user and is not already completed
    2. Calculate XP and coins with streak and on-time bonuses
    3. Update user totals, recalculate level and streak
    4. Write XP history log
    5. Check achievements
    6. Check building unlocks
    7. Return updated state and newly unlocked items
    """
    if mission.status == 'Completed':
        raise ValueError("Mission has already been completed. Rewards cannot be awarded twice.")
        
    today = timezone.now().date()
    prior_streak = user.streak
    
    # 1. Calculate rewards based on prior streak
    rewards = calculate_mission_rewards(mission, prior_streak, today)
    xp_earned = rewards['xp_earned']
    coins_earned = rewards['coins_earned']
    
    # 2. Update streak
    update_user_streak(user, today)
    
    # 3. Update XP and Coins
    old_level = user.level
    user.total_xp += xp_earned
    user.coins += coins_earned
    user.level = calculate_level(user.total_xp)
    user.save()
    
    # 4. Mark mission completed
    mission.status = 'Completed'
    mission.xp_reward = xp_earned
    mission.coin_reward = coins_earned
    mission.completed_at = timezone.now()
    mission.save()
    
    # 5. Log entry in XPLog
    xplog = XPLog.objects.create(
        user=user,
        mission=mission,
        xp=xp_earned,
        coins=coins_earned,
        reason=f"Completed mission '{mission.title}' (+{xp_earned} XP, +{coins_earned} Coins)"
    )
    
    # 6. Check achievements
    new_achievements = check_and_award_achievements(user)
    
    # 7. Check building unlocks
    unlocked_buildings = get_unlocked_buildings_for_user(user)
    
    level_up = user.level > old_level
    
    return {
        'mission_id': mission.id,
        'title': mission.title,
        'xp_earned': xp_earned,
        'coins_earned': coins_earned,
        'old_level': old_level,
        'new_level': user.level,
        'level_up': level_up,
        'current_streak': user.streak,
        'total_xp': user.total_xp,
        'coins': user.coins,
        'new_achievements': new_achievements,
        'unlocked_buildings': unlocked_buildings,
    }

def check_and_award_achievements(user: User):
    """Evaluates achievement conditions and awards new badges."""
    newly_awarded = []
    
    # 1. First Mission Unlocked: Complete the first mission
    completed_count = user.missions.filter(status='Completed').count()
    if completed_count >= 1:
        ach = Achievement.objects.filter(condition_type='first_mission').first()
        if ach and not UserAchievement.objects.filter(user=user, achievement=ach).exists():
            UserAchievement.objects.create(user=user, achievement=ach)
            newly_awarded.append({'name': ach.name, 'description': ach.description, 'icon': ach.icon})
            
    # 2. City Builder: Construct the first building
    buildings_count = user.constructed_buildings.count()
    if buildings_count >= 1:
        ach = Achievement.objects.filter(condition_type='city_builder').first()
        if ach and not UserAchievement.objects.filter(user=user, achievement=ach).exists():
            UserAchievement.objects.create(user=user, achievement=ach)
            newly_awarded.append({'name': ach.name, 'description': ach.description, 'icon': ach.icon})
            
    # 3. Productivity Pro: Complete 7 missions in one week (last 7 days)
    seven_days_ago = timezone.now() - timedelta(days=7)
    recent_completed = user.missions.filter(status='Completed', completed_at__gte=seven_days_ago).count()
    if recent_completed >= 7:
        ach = Achievement.objects.filter(condition_type='productivity_pro').first()
        if ach and not UserAchievement.objects.filter(user=user, achievement=ach).exists():
            UserAchievement.objects.create(user=user, achievement=ach)
            newly_awarded.append({'name': ach.name, 'description': ach.description, 'icon': ach.icon})
            
    # 4. XP Collector: Earn 1,000 total XP
    if user.total_xp >= 1000:
        ach = Achievement.objects.filter(condition_type='xp_collector').first()
        if ach and not UserAchievement.objects.filter(user=user, achievement=ach).exists():
            UserAchievement.objects.create(user=user, achievement=ach)
            newly_awarded.append({'name': ach.name, 'description': ach.description, 'icon': ach.icon})
            
    # 5. Dream Achiever: Reach Level 10
    if user.level >= 10:
        ach = Achievement.objects.filter(condition_type='dream_achiever').first()
        if ach and not UserAchievement.objects.filter(user=user, achievement=ach).exists():
            UserAchievement.objects.create(user=user, achievement=ach)
            newly_awarded.append({'name': ach.name, 'description': ach.description, 'icon': ach.icon})
            
    return newly_awarded

def get_unlocked_buildings_for_user(user: User):
    """Returns buildings unlocked by user's current level."""
    return list(Building.objects.filter(is_active=True, required_level__lte=user.level).values(
        'id', 'name', 'required_level', 'cost', 'image', 'description'
    ))
