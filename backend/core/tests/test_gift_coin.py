from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from core.models import Credit, CoinGift

User = get_user_model()

class CoinGiftTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='password123',
            user_type='student'
        )
        self.tutor = User.objects.create_user(
            username='tutor',
            email='tutor@example.com',
            password='password123',
            user_type='tutor'
        )
        # Ensure credits exist
        Credit.objects.create(user=self.student, balance=100)
        Credit.objects.create(user=self.tutor, balance=0)

        self.client.force_authenticate(user=self.student)
        self.url = '/api/gifts/'

    def test_gift_coins_success(self):
        data = {
            'recipient': self.tutor.id,
            'amount': 50
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check balances
        self.student.credit.refresh_from_db()
        self.tutor.credit.refresh_from_db()
        self.assertEqual(self.student.credit.balance, 50)
        self.assertEqual(self.tutor.credit.balance, 50)

        # Check Gift Record
        self.assertEqual(CoinGift.objects.count(), 1)
        gift = CoinGift.objects.first()
        self.assertEqual(gift.sender, self.student)
        self.assertEqual(gift.recipient, self.tutor)
        self.assertEqual(gift.amount, 50)

    def test_insufficient_balance(self):
        data = {
            'recipient': self.tutor.id,
            'amount': 150
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient coin balance', str(response.data))

    def test_gift_to_self(self):
        data = {
            'recipient': self.student.id,
            'amount': 10
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot gift coins to yourself', str(response.data))

    def test_invalid_amount(self):
        data = {
            'recipient': self.tutor.id,
            'amount': -10
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data['amount'] = 0
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recipient_not_found(self):
        data = {
            'recipient': 9999,
            'amount': 10
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_credit_on_fly(self):
        # Create a new tutor without credit object
        new_tutor = User.objects.create_user(username='newtutor', password='pw', user_type='tutor')
        # Ensure no credit object (it might be created by signal if one exists, but let's assume not or delete it)
        if hasattr(new_tutor, 'credit'):
            new_tutor.credit.delete()

        data = {
            'recipient': new_tutor.id,
            'amount': 10
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if credit created
        new_credit = Credit.objects.get(user=new_tutor)
        self.assertEqual(new_credit.balance, 10)
