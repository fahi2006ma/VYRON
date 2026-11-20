from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_view, name='auth-register'),
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('auth/change-password/', views.change_password_view, name='auth-change-password'),
    path('profile/', views.profile_view, name='profile'),

    # Missions
    path('missions/', views.missions_list_create_view, name='missions-list-create'),
    path('missions/<int:pk>/', views.mission_detail_view, name='mission-detail'),
    path('missions/<int:pk>/complete/', views.complete_mission_view, name='mission-complete'),

    # City & Buildings
    path('city/', views.city_overview_view, name='city-overview'),
    path('city/build/', views.construct_building_view, name='city-build'),

    # Analytics
    path('analytics/', views.analytics_view, name='analytics'),

    # Achievements
    path('achievements/', views.achievements_view, name='achievements'),

    # Leaderboard
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),

    # AI Productivity Assistant
    path('ai/suggest/', views.ai_suggest_view, name='ai-suggest'),
    path('ai/coach/', views.ai_coach_view, name='ai-coach'),

    # Data Seed
    path('seed/', views.seed_data_view, name='seed-data'),
]
