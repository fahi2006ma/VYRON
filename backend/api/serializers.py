from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, Mission, XPLog, Building, UserBuilding, Achievement, UserAchievement
from .gamification import calculate_mission_rewards

class UserSerializer(serializers.ModelSerializer):
    xp_within_level = serializers.SerializerMethodField()
    xp_for_next_level = serializers.SerializerMethodField()
    constructed_buildings_count = serializers.SerializerMethodField()
    city_level = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'display_name', 'avatar', 'bio',
            'role', 'total_xp', 'coins', 'level', 'streak', 'last_active_date',
            'notifications_enabled', 'created_at', 'xp_within_level', 'xp_for_next_level',
            'constructed_buildings_count', 'city_level'
        ]
        read_only_fields = ['id', 'total_xp', 'coins', 'level', 'streak', 'last_active_date', 'role', 'created_at']

    def get_xp_within_level(self, obj):
        return obj.total_xp % 1000

    def get_xp_for_next_level(self, obj):
        return 1000

    def get_constructed_buildings_count(self, obj):
        return obj.constructed_buildings.count()

    def get_city_level(self, obj):
        # 1 city level per 5 constructed buildings, minimum 1
        count = obj.constructed_buildings.count()
        return (count // 5) + 1


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        full_name = validated_data.get('full_name', '')
        display_name = full_name or validated_data.get('username')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=full_name,
            display_name=display_name,
            total_xp=0,
            coins=0,
            level=1,
            streak=0,
            avatar='/assets/avatar_fahima.jpg'
        )
        user.set_password(password)
        user.save()
        return user


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = [
            'id', 'title', 'description', 'category', 'difficulty', 'due_date',
            'status', 'xp_reward', 'coin_reward', 'focus_minutes', 'completed_at',
            'created_at'
        ]
        read_only_fields = ['id', 'status', 'completed_at', 'created_at']

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3 or len(value) > 100:
            raise serializers.ValidationError("Title must be 3 to 100 characters")
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description is too long (max 500 characters)")
        return value

    def validate_due_date(self, value):
        # FR-VAL: not earlier than today when creating
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value

    def create(self, validated_data):
        # Calculate base preview reward
        diff = validated_data.get('difficulty', 'Medium')
        user = self.context['request'].user
        rewards = calculate_mission_rewards(
            Mission(difficulty=diff, due_date=validated_data['due_date']),
            user.streak,
            validated_data['due_date']
        )
        validated_data['xp_reward'] = rewards['base_xp']
        validated_data['coin_reward'] = rewards['coins_earned']
        validated_data['user'] = user
        return super().create(validated_data)


class BuildingSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    can_construct = serializers.SerializerMethodField()
    missing_level = serializers.SerializerMethodField()
    missing_coins = serializers.SerializerMethodField()
    times_constructed = serializers.SerializerMethodField()

    class Meta:
        model = Building
        fields = [
            'id', 'name', 'required_level', 'cost', 'image', 'description',
            'category', 'is_active', 'is_unlocked', 'can_construct',
            'missing_level', 'missing_coins', 'times_constructed'
        ]

    def get_is_unlocked(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return False
        return user.level >= obj.required_level

    def get_can_construct(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return False
        return (user.level >= obj.required_level) and (user.coins >= obj.cost)

    def get_missing_level(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return obj.required_level
        return max(0, obj.required_level - user.level)

    def get_missing_coins(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return obj.cost
        return max(0, obj.cost - user.coins)

    def get_times_constructed(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return 0
        return user.constructed_buildings.filter(building=obj).count()


class UserBuildingSerializer(serializers.ModelSerializer):
    building = BuildingSerializer(read_only=True)

    class Meta:
        model = UserBuilding
        fields = ['id', 'building', 'pos_x', 'pos_y', 'built_at']


class AchievementSerializer(serializers.ModelSerializer):
    is_earned = serializers.SerializerMethodField()
    earned_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'condition_type', 'condition_value', 'icon', 'is_earned', 'earned_at']

    def get_is_earned(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return False
        return UserAchievement.objects.filter(user=user, achievement=obj).exists()

    def get_earned_at(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return None
        ua = UserAchievement.objects.filter(user=user, achievement=obj).first()
        return ua.earned_at if ua else None


class XPLogSerializer(serializers.ModelSerializer):
    mission_title = serializers.CharField(source='mission.title', read_only=True, default='Bonus')

    class Meta:
        model = XPLog
        fields = ['id', 'xp', 'coins', 'reason', 'mission_title', 'created_at']


class LeaderboardSerializer(serializers.ModelSerializer):
    is_current_user = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'display_name', 'username', 'avatar', 'level', 'total_xp', 'coins', 'is_current_user']

    def get_is_current_user(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        return user is not None and user.is_authenticated and user.id == obj.id
