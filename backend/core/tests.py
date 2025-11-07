from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Gig, Credit, Job, Application, Message
from django.utils import timezone

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('user-register')
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com',
            'user_type': 'teacher'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(get_user_model().objects.count(), 1)
        self.assertEqual(get_user_model().objects.get().username, 'testuser')

class GigTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='teacher1',
            user_type='teacher',
            email='teacher1@example.com',
            password='pass123'
        )
        self.client.force_authenticate(user=self.user)
        self.gig_data = {
            'title': 'Math Tutoring',
            'description': 'Advanced calculus tutoring',
            'subject': 'Mathematics',
            'contact_info': 'email@example.com 1234567890'
        }

    def test_create_gig(self):
        response = self.client.post(reverse('gig-list'), self.gig_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Gig.objects.count(), 1)
        self.assertEqual(Gig.objects.get().title, 'Math Tutoring')
        # Check if contact info is masked
        self.assertNotIn('email@example.com', Gig.objects.get().contact_info)
        self.assertNotIn('1234567890', Gig.objects.get().contact_info)

class CreditTests(APITestCase):
    def setUp(self):
        self.user1 = get_user_model().objects.create_user(
            username='user1',
            password='pass123',
            user_type='teacher'
        )
        self.user2 = get_user_model().objects.create_user(
            username='user2',
            password='pass123',
            user_type='teacher'
        )
        Credit.objects.create(user=self.user1, balance=100)
        Credit.objects.create(user=self.user2, balance=0)
        self.client.force_authenticate(user=self.user1)

    def test_credit_transfer(self):
        response = self.client.post(
            reverse('credit-transfer'),
            {'recipient_id': self.user2.id, 'amount': 50},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Credit.objects.get(user=self.user1).balance, 50)
        self.assertEqual(Credit.objects.get(user=self.user2).balance, 50)

class JobApplicationTests(APITestCase):
    def setUp(self):
        self.student = get_user_model().objects.create_user(
            username='student1',
            password='pass123',
            user_type='student'
        )
        self.teacher = get_user_model().objects.create_user(
            username='teacher1',
            password='pass123',
            user_type='teacher'
        )
        Credit.objects.create(user=self.teacher, balance=10)
        self.job = Job.objects.create(
            student=self.student,
            title='Need Math Tutor',
            description='Help with calculus',
            subject='Mathematics'
        )
        self.client.force_authenticate(user=self.teacher)

    def test_apply_to_job(self):
        response = self.client.post(
            reverse('application-list'),
            {'job': self.job.id, 'is_premium': False},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.count(), 1)
        self.assertEqual(Credit.objects.get(user=self.teacher).balance, 9)
        application = Application.objects.get()
        self.assertIsNotNone(application.countdown_end)

class MessageTests(APITestCase):
    def setUp(self):
        self.user1 = get_user_model().objects.create_user(
            username='user1',
            password='pass123'
        )
        self.user2 = get_user_model().objects.create_user(
            username='user2',
            password='pass123'
        )
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        response = self.client.post(
            reverse('message-list'),
            {
                'receiver': self.user2.id,
                'content': 'Hello, this is a test message'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        message = Message.objects.get()
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.content, 'Hello, this is a test message')
