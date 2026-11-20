from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    full_name = models.CharField(max_length=150, blank=True, default='')
    display_name = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(unique=True)
    avatar = models.CharField(max_length=255, default='/assets/avatar_fahima.jpg')
    bio = models.TextField(blank=True, default='Mastering productivity one mission at a time.')
    role = models.CharField(max_length=20, default='user')
    
    total_xp = models.PositiveIntegerField(default=0)
    coins = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    
    # Security: 5 failed attempts -> 15 min lock (SRS FR-AUTH-05)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    lock_until = models.DateTimeField(null=True, blank=True)
    
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_locked(self):
        if self.lock_until and self.lock_until > timezone.now():
            return True
        return False

    def __str__(self):
        return self.username or self.email


class Mission(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    CATEGORY_CHOICES = [
        ('Study', 'Study'),
        ('Coding', 'Coding'),
        ('Health', 'Health'),
        ('Work', 'Work'),
        ('Personal', 'Personal'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='missions')
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Coding')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Medium')
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    xp_reward = models.PositiveIntegerField(default=100)
    coin_reward = models.PositiveIntegerField(default=50)
    focus_minutes = models.PositiveIntegerField(default=25)
    
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.difficulty}) - {self.status}"


class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_logs')
    mission = models.ForeignKey(Mission, on_delete=models.SET_NULL, null=True, blank=True)
    xp = models.PositiveIntegerField()
    coins = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, default='Mission Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"+{self.xp} XP, +{self.coins} Coins for {self.user.username}"


class Building(models.Model):
    name = models.CharField(max_length=100, unique=True)
    required_level = models.PositiveIntegerField(default=1)
    cost = models.PositiveIntegerField(default=100)
    image = models.CharField(max_length=255, default='house')
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, default='infrastructure')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (Lv. {self.required_level}, {self.cost} coins)"


class UserBuilding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='constructed_buildings')
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    pos_x = models.IntegerField(default=0)
    pos_y = models.IntegerField(default=0)
    built_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} built {self.building.name} at ({self.pos_x}, {self.pos_y})"


class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    condition_type = models.CharField(max_length=50)  # first_mission, city_builder, productivity_pro, xp_collector, dream_achiever
    condition_value = models.IntegerField(default=1)
    icon = models.CharField(max_length=50, default='trophy')

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"
