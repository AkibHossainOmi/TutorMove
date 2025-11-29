from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from .models import Gig, Credit, Job, Application, Message, Subject, Question, Answer

User = get_user_model()

# Mocking Cache globally for this file or use override_settings to use LocMemCache
@override_settings(CACHES={
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
})
class UserTests(APITestCase):
    def setUp(self):
        # Clear cache before each test
        from django.core.cache import cache
        cache.clear()

        self.client = APIClient()
        self.register_url = reverse('register') # SendOTPView
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@gmail.com', # Trusted domain
            'user_type': 'tutor',
            'phone_number': '+1234567890'
        }

    @patch('core.modules.auth.send_otp_email')
    def test_user_registration_otp_flow(self, mock_send_email):
        # Test SendOTPView
        request_data = {
            "email": self.user_data['email'],
            "purpose": "register",
            "user_data": self.user_data
        }

        response = self.client.post(self.register_url, request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User NOT created yet
        self.assertEqual(User.objects.count(), 0)

    @patch('core.modules.auth.send_otp_email')
    def test_verify_otp_creates_user(self, mock_send_email):
        # 1. Send OTP
        email = "test@gmail.com"
        request_data = {
            "email": email,
            "purpose": "register",
            "user_data": self.user_data
        }
        self.client.post(self.register_url, request_data, format='json')

        # 2. Get OTP from cache (LocMemCache)
        from django.core.cache import cache
        key = f"otp:register:{email}"
        cached_data = cache.get(key)
        self.assertIsNotNone(cached_data)
        otp = cached_data['otp']

        # 3. Verify OTP
        verify_url = reverse('verify-otp')
        response = self.client.post(verify_url, {"email": email, "otp": otp, "purpose": "register"}, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Verify OTP failed. Response: {response.content}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, email)

    def test_admin_registration_blocked(self):
        # Admin trying to register via OTP flow
        data = self.user_data.copy()
        data['user_type'] = 'admin'
        request_data = {
            "email": "test@gmail.com",
            "purpose": "register",
            "user_data": data
        }

        # SendOTP might succeed because it doesn't check user_type deep inside
        # But let's check if we blocked it in Verify
        self.client.post(self.register_url, request_data, format='json')

        from django.core.cache import cache
        key = "otp:register:test@gmail.com"
        cached_data = cache.get(key)
        # If SendOTP succeeded, cache should be there.
        # If we want to block at SendOTP, we need to modify SendOTPView.
        # Assuming we block at Verify:

        if cached_data:
            otp = cached_data['otp']
            verify_url = reverse('verify-otp')
            response = self.client.post(verify_url, {"email": "test@gmail.com", "otp": otp, "purpose": "register"}, format='json')
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.assertEqual(User.objects.count(), 0)

@override_settings(CACHES={
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake-admin',
    }
})
class AdminDashboardTests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()

        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass',
            user_type='admin'
        )
        self.client.force_authenticate(user=self.admin)
        self.url = reverse('admin-dashboard-stats')

    def test_admin_dashboard_stats(self):
        # Create some dummy data
        User.objects.create_user(username='student', user_type='student', password='pass')
        Job.objects.create(
            student=User.objects.get(username='student'),
            description='Test Job Description',
            service_type='Tutoring'
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('active_jobs', response.data)
        self.assertIn('total_revenue', response.data)

    def test_non_admin_access_denied(self):
        user = User.objects.create_user(username='user', user_type='student', password='pass')
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_list(self):
        User.objects.create_user(username='student1', user_type='student', password='pass')
        response = self.client.get(reverse('admin-users-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should contain admin + student1 + maybe others
        # Handle response being list or dict (pagination)
        results = response.data.get('results') if isinstance(response.data, dict) else response.data
        self.assertTrue(len(results) >= 2)

    def test_admin_block_user(self):
        user = User.objects.create_user(username='baduser', user_type='student', password='pass')
        url = reverse('admin-users-block', kwargs={'pk': user.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertFalse(user.is_active)

    def test_admin_job_close(self):
        user = User.objects.create_user(username='student2', user_type='student', password='pass')
        job = Job.objects.create(
            student=user,
            description='Test Job',
            service_type='Tutoring'
        )
        url = reverse('admin-jobs-close', kwargs={'pk': job.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, 'Cancelled')
