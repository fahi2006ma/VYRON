from datetime import date, timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from api.models import User, Mission, Building, UserBuilding, Achievement, UserAchievement, XPLog
from api.gamification import calculate_mission_rewards, calculate_level, update_user_streak

class VyronGamificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='tester',
            email='tester@vyron.app',
            password='Password123!',
            full_name='Test User',
            display_name='Tester',
            level=1,
            total_xp=0,
            coins=0,
            streak=0
        )
        self.building_house = Building.objects.create(name='Residential House', required_level=1, cost=100)
        self.building_library = Building.objects.create(name='Library', required_level=3, cost=600)
        self.ach_first = Achievement.objects.create(name='First Mission Unlocked', condition_type='first_mission', condition_value=1)

    def test_tc01_valid_registration(self):
        res = self.client.post('/api/auth/register/', {
            'username': 'newbie',
            'email': 'newbie@vyron.app',
            'full_name': 'Newbie User',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['user']['level'], 1)
        self.assertEqual(res.data['user']['total_xp'], 0)
        self.assertEqual(res.data['user']['coins'], 0)

    def test_tc02_duplicate_email(self):
        res = self.client.post('/api/auth/register/', {
            'username': 'another',
            'email': 'tester@vyron.app',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 400)

    def test_tc03_valid_login(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'tester@vyron.app',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    def test_tc11_complete_easy_mission_on_time_no_streak(self):
        """TC-11: Easy mission on time, 0 prior streak: XP +55, coins +25 (50 + 10%)"""
        today = timezone.now().date()
        mission = Mission.objects.create(
            user=self.user,
            title='Easy Task',
            difficulty='Easy',
            due_date=today + timedelta(days=1),
            status='Pending'
        )
        self.client.force_authenticate(user=self.user)
        res = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['xp_earned'], 55)
        self.assertEqual(res.data['coins_earned'], 25)
        self.assertEqual(res.data['current_streak'], 1)

    def test_tc12_complete_hard_mission_on_time_3_day_streak(self):
        """TC-12: Hard mission on time, 3-day prior streak: 200 * (1 + 0.10 + 0.15) = 250 XP, 100 coins"""
        today = timezone.now().date()
        self.user.streak = 3
        self.user.last_active_date = today - timedelta(days=1)
        self.user.save()
        
        mission = Mission.objects.create(
            user=self.user,
            title='Hard Task',
            difficulty='Hard',
            due_date=today + timedelta(days=1),
            status='Pending'
        )
        self.client.force_authenticate(user=self.user)
        res = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['xp_earned'], 250)
        self.assertEqual(res.data['coins_earned'], 100)

    def test_tc13_prevent_double_completion(self):
        """TC-13: Send complete request again -> Rejected"""
        today = timezone.now().date()
        mission = Mission.objects.create(
            user=self.user,
            title='Test Task',
            difficulty='Easy',
            due_date=today,
            status='Pending'
        )
        self.client.force_authenticate(user=self.user)
        res1 = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(res1.status_code, 200)
        res2 = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(res2.status_code, 400)

    def test_tc14_level_up(self):
        """TC-14: Total XP goes over 1000 threshold -> Level up"""
        self.user.total_xp = 950
        self.user.level = 1
        self.user.save()
        today = timezone.now().date()
        mission = Mission.objects.create(
            user=self.user,
            title='Level Up Mission',
            difficulty='Medium',  # 100 base + 10% on-time = 110 XP -> 950 + 110 = 1060 XP
            due_date=today + timedelta(days=1),
            status='Pending'
        )
        self.client.force_authenticate(user=self.user)
        res = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['level_up'])
        self.assertEqual(res.data['new_level'], 2)

    def test_tc17_and_tc18_building_construction(self):
        """TC-17 & TC-18: Build with enough coins vs insufficient coins"""
        self.client.force_authenticate(user=self.user)
        # 1. Too few coins
        res_fail = self.client.post('/api/city/build/', {'building_id': self.building_house.id})
        self.assertEqual(res_fail.status_code, 400)
        self.assertIn('Insufficient coins', res_fail.data['detail'])

        # 2. Enough coins
        self.user.coins = 200
        self.user.save()
        res_ok = self.client.post('/api/city/build/', {'building_id': self.building_house.id})
        self.assertEqual(res_ok.status_code, 201)
        self.assertEqual(res_ok.data['remaining_coins'], 100)
        self.assertEqual(UserBuilding.objects.filter(user=self.user).count(), 1)
