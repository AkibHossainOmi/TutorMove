
import os
import subprocess
import json
import random
import time
from django.db.models import Avg
from geopy.exc import GeocoderUnavailable, GeocoderTimedOut
from geopy.geocoders import Nominatim
from rest_framework.views import APIView
from django.db.models import Sum, Q
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework import viewsets, permissions, status, filters, views, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from math import radians, cos, sin, asin, sqrt
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.db import transaction
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from decimal import Decimal, InvalidOperation
import uuid
import requests
from django.http import JsonResponse
from django.core.files.storage import default_storage
from core.modules.auth import ( SendOTPView, ResetPasswordView,
    VerifyOTPView, LoginView, CookieTokenObtainPairView, CookieTokenRefreshView,
)

from urllib.parse import urlencode
from .models import (
    CountryGroup, CountryGroupPoint, UnlockPricingTier, User, Gig, Point, Job, Application, Notification, UserSettings, Review, Subject, EscrowPayment,
    Order, Payment, ContactUnlock, JobUnlock,
)
from .serializers import (
    ContactUnlockSerializer, UserSerializer, GigSerializer, CreditSerializer, JobSerializer,
    ApplicationSerializer, NotificationSerializer, 
    UserSettingsSerializer, ReviewSerializer,
    AbuseReportSerializer, SubjectSerializer, EscrowPaymentSerializer,
    PaymentSerializer, CreditUpdateByUserSerializer,
    JobUnlockSerializer,
)

from .payments import SSLCommerzPayment

__all__ = [
    "SendOTPView",
    "ResetPasswordView",
    "VerifyOTPView",
    "LoginView",
    "CookieTokenObtainPairView",
    "CookieTokenRefreshView",
]


ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

def generate_transaction_id():
    """Generates a unique transaction ID with a 'TRN-' prefix."""
    return 'TRN-' + str(uuid.uuid4().hex[:20]).upper()

class TutorViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(user_type='tutor')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        tutor = self.get_object()
        serializer = self.get_serializer(tutor, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="search", permission_classes=[AllowAny])
    def search(self, request):
        input_location = request.data.get("location", "").strip()
        subject_query = request.data.get("subject", "").strip().lower()

        geolocator = Nominatim(user_agent="your_app_name")
        input_lat, input_lon = None, None

        if input_location:
            try:
                loc = geolocator.geocode(input_location)
                if loc:
                    input_lat, input_lon = loc.latitude, loc.longitude
            except (GeocoderUnavailable, GeocoderTimedOut):
                pass

        # All tutors (no location exclusion!)
        tutors = User.objects.filter(user_type="tutor")
        matched_tutors = []

        for tutor in tutors:
            try:
                # Check if tutor has relevant subject
                gigs_qs = Gig.objects.filter(tutor=tutor)
                if subject_query:
                    gigs_qs = gigs_qs.filter(subject__icontains=subject_query)

                if subject_query and not gigs_qs.exists():
                    continue  # Skip tutor if no relevant subject match

                credit_count = getattr(tutor, "credit_count", 0)

                distance_km = None
                if input_lat is not None and input_lon is not None and tutor.location:
                    try:
                        tutor_loc = geolocator.geocode(tutor.location)
                        if tutor_loc:
                            tutor_lat, tutor_lon = tutor_loc.latitude, tutor_loc.longitude
                            distance_km = haversine(input_lon, input_lat, tutor_lon, tutor_lat)
                    except Exception:
                        pass  # Location geocode failed, skip distance

                matched_tutors.append((tutor, credit_count, distance_km))
            except Exception:
                continue

        # Sort: by points DESC, then distance ASC (None distances go last)
        matched_tutors.sort(
            key=lambda x: (-x[1], x[2] if x[2] is not None else float('inf'))
        )

        combined_tutors = [t[0] for t in matched_tutors]
        serializer = self.get_serializer(combined_tutors, many=True)
        return Response({
            "count": len(combined_tutors),
            "results": serializer.data
        })

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.filter(user_type='student')

    def get_permissions(self):
        # Make list and retrieve public
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        student = self.get_object()
        serializer = self.get_serializer(student, context={'request': request})
        return Response(serializer.data)

class JobCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save()

            student_id = request.data.get('student') or job.student.id
            try:
                student = User.objects.get(id=student_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found"}, status=status.HTTP_400_BAD_REQUEST)

            # 🔻 Deduct 1 point from student
            try:
                point = Point.objects.get(user=student)
                if point.balance >= 1:
                    point.balance -= 1
                    point.save()
                else:
                    return Response({"error": "Insufficient points"}, status=status.HTTP_400_BAD_REQUEST)
            except Point.DoesNotExist:
                return Response({"error": "Point record not found"}, status=status.HTTP_400_BAD_REQUEST)

            tutors = User.objects.filter(user_type='tutor')
            notifications = [
                Notification(
                    from_user=student,
                    to_user=tutor,
                    message=f"New job posted by {student.username}: {job.title}"
                )
                for tutor in tutors
            ]
            Notification.objects.bulk_create(notifications)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileUpdateByIdView(APIView):
    permission_classes = [AllowAny]  # public API, no auth required

    def post(self, request):
        user_id = request.data.get('id')
        if not user_id:
            return Response({'id': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'id': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = ['bio', 'education', 'experience', 'location', 'phone_number']
        data_to_update = {field: request.data.get(field) for field in allowed_fields if field in request.data}

        for key, value in data_to_update.items():
            setattr(user, key, value)

        user.save()

        return Response({
            'bio': user.bio,
            'education': user.education,
            'experience': user.experience,
            'location': user.location,
            'phone_number': str(user.phone_number) if user.phone_number else '',
        }, status=status.HTTP_200_OK)

class SubmitReview(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()

        student_id = data.get('student')
        if not student_id:
            return Response({"error": "student id is required"}, status=400)

        try:
            student = User.objects.get(id=student_id)
        except User.DoesNotExist:
            return Response({"error": "Student not found."}, status=404)

        try:
            teacher = User.objects.get(id=data.get('teacher'), user_type='tutor')
        except User.DoesNotExist:
            return Response({"error": "Tutor not found."}, status=404)

        # Check existing review
        review_qs = Review.objects.filter(student=student, teacher=teacher)
        if review_qs.exists():
            review = review_qs.first()
            serializer = ReviewSerializer(review, data=data, partial=True)
        else:
            serializer = ReviewSerializer(data=data)

        if serializer.is_valid():
            # Set the student explicitly on save
            serializer.save(student=student, teacher=teacher)
            return Response({"message": "Review submitted.", "review": serializer.data})
        else:
            return Response(serializer.errors, status=400)

class UserProfileView(generics.RetrieveAPIView): # Changed base class from generics.RetrieveAPIView to APIView
    """
    API view to retrieve the profile of the currently authenticated user (GET).
    Can also retrieve a user by ID provided in the request body (POST).
    Access is restricted to authenticated users.
    """
    permission_classes = [AllowAny]
    serializer_class = UserSerializer # Still define for clarity and potential usage

    def get(self, request, *args, **kwargs):
        """
        Retrieves the profile of the currently authenticated user.
        GET /api/profile/
        """
        serializer = self.serializer_class(request.user)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Retrieves a user's profile by ID provided in the request body.
        POST /api/profile/
        Body: {"id": 4}
        """
        user_id = request.data.get('id')
        if not user_id:
            return Response(
                {"detail": "User ID not provided in request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            # Attempt to convert ID to integer, handle potential ValueError
            user_id = int(user_id)
            user = get_object_or_404(User, id=user_id)
            serializer = self.serializer_class(user)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"detail": "Invalid User ID format. Must be an integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Catching more general exceptions for robust error handling
            return Response(
                {"detail": f"Error fetching user: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class GigCreateAPIView(generics.CreateAPIView):
    queryset = Gig.objects.all()
    serializer_class = GigSerializer
    permission_classes = [permissions.AllowAny] 

# --- UserViewSet ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['register', 'search']:
            return []
        return super().get_permissions()
    
    @action(detail=False, methods=["delete"], url_path="delete-account")
    @transaction.atomic
    def delete_account(self, request):
        user = request.user

        try:
            # Delete related objects
            if user.user_type == "tutor":
                # Delete tutor gigs
                Gig.objects.filter(tutor=user).delete()
                # Delete any contact unlocks for this tutor
                ContactUnlock.objects.filter(target=user).delete()
            elif user.user_type == "student":
                # Delete contact unlocks made by this student
                ContactUnlock.objects.filter(unlocker=user).delete()

            # Add other related references if needed, e.g., favorites, messages

            # Finally, delete user account
            user.delete()

            return Response({"detail": "Your account and all related data have been deleted."},
                            status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'], permission_classes=[])
    def register(self, request):
        user_type = request.data.get('user_type')
        if user_type not in ['student', 'teacher']:
            return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(user_type=user_type)
            UserSettings.objects.create(user=user)
            Point.objects.create(user=user, balance=100)
            Notification.objects.create(
                user=user,
                message="🎉 Welcome! You have received 100 free points to get started."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def request_verification(self, request):
        user = request.user
        if user.verification_requested:
            return Response({'detail': 'Verification request already submitted.'}, status=400)
        user.verification_requested = True
        user.save(update_fields=['verification_requested'])
        return Response({'detail': 'Verification request submitted.'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        user = request.user

        if not all([old_password, new_password]):
            return Response({"error": "Old and new password required"}, status=status.HTTP_409_CONFLICT)
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_409_CONFLICT)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def unlock_profile(self, request, pk=None):
        user = self.get_object()
        requesting_user = request.user
        if requesting_user.user_type != 'student':
            return Response({'error': 'Only students can unlock profiles'}, status=403)
        point = Point.objects.filter(user=requesting_user).first()
        if not point or point.balance < 1:
            return Response({'error': 'Insufficient points'}, status=403)
        point.balance -= 1
        point.save()
        Notification.objects.create(user=requesting_user, message=f"Unlocked profile for user {user.id}")
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='search', url_name='search', permission_classes=[])
    def search(self, request):
        subject = request.query_params.get('subject', '')
        location = request.query_params.get('location', '')
        qs = self.get_queryset().filter(user_type='teacher')

        if subject:
            qs = qs.filter(Q(gigs__subject__icontains=subject) | Q(gigs__title__icontains=subject))
        if location:
            qs = qs.filter(location__icontains=location)

        qs = qs.distinct()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def become_teacher(self, request):
        user = request.user
        if user.user_type == 'teacher':
            return Response({'detail': 'Already a teacher.'}, status=400)
        user.user_type = 'teacher'
        user.save(update_fields=['user_type'])
        user.verification_requested = True
        user.save(update_fields=['verification_requested'])
        return Response({'detail': 'You are now a teacher!'}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve_verification(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.verification_requested = False
        user.save(update_fields=['is_verified', 'verification_requested'])
        return Response({'detail': 'Teacher has been verified.'})
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def edit_profile(self, request):
        user = request.user
        old_phone = user.phone_number  # store old phone number
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            # If phone_number changed, mark phone_verified as False
            if 'phone_number' in request.data and request.data['phone_number'] != old_phone:
                updated_user.phone_verified = False
                updated_user.save(update_fields=['phone_verified'])
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def purchase_premium(self, request):
        """
        Buy premium subscription
        """
        try:
            amount = Decimal(request.data.get('amount', '0'))
        except (ValueError, InvalidOperation):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        order = Order.objects.create(user=user, total_amount=amount, is_paid=False)
        transaction_id = generate_transaction_id()

        sslcommerz = SSLCommerzPayment()
        payment = Payment.objects.create(
            order=order,
            transaction_id=transaction_id,
            amount=amount,
            status='PENDING',
            currency='BDT',
        )

        payment_data = {
            'total_amount': str(amount),
            'currency': "BDT",
            'tran_id': transaction_id,
            'success_url': request.build_absolute_uri(reverse('payment_success')),
            'fail_url': request.build_absolute_uri(reverse('payment_fail')),
            'cancel_url': request.build_absolute_uri(reverse('payment_cancel')),
            'ipn_url': request.build_absolute_uri(reverse('sslcommerz_ipn')),
            'cus_name': user.get_full_name() or user.username,
            'cus_email': user.email,
            'value_a': str(user.id),
            'value_b': 'premium',
            'value_c': str(order.id),
            'product_name': "Premium Subscription",
            'product_category': 'Digital Goods',
            'product_profile': 'general',
            'shipping_method': 'NO',
            'num_of_item': 1,
        }

        response_data = sslcommerz.initiate_payment(payment_data)

        if response_data.get('status') == 'SUCCESS':
            payment.bank_transaction_id = response_data.get('tran_id')
            payment.save()
            return Response({
                'status': 'SUCCESS',
                'payment_url': response_data.get('GatewayPageURL'),
                'sessionkey': response_data.get('sessionkey'),
                'transaction_id': transaction_id
            })
        else:
            payment.status = 'FAILED'
            payment.error_message = response_data.get('failedreason', 'Unknown error')
            payment.save()
            return Response({'status': 'FAILED', 'error': payment.error_message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_dp(self, request):
        """
        Upload or update user display picture.
        """
        user = request.user

        dp_file = request.FILES.get('profile_picture')
        if not dp_file:
            return Response({'error': 'No file uploaded'}, status=400)

        # Validate file extension
        ext = os.path.splitext(dp_file.name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            return Response({'error': 'Unsupported file type'}, status=400)

        # Delete old profile picture if exists
        if user.profile_picture and default_storage.exists(user.profile_picture.name):
            default_storage.delete(user.profile_picture.name)

        # Generate a unique filename
        new_name = f"{uuid.uuid4().hex}{ext}"
        user.profile_picture.save(new_name, dp_file)
        user.save(update_fields=['profile_picture'])

        return Response({
            'detail': 'Display picture updated successfully',
            'profile_picture_url': request.build_absolute_uri(user.profile_picture.url)
        }, status=200)

# --- Utility ---
import math

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great-circle distance between two points
    on the Earth specified by longitude and latitude in decimal degrees.
    Returns distance in kilometers.
    """
    R = 6371  # Earth radius in km

    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    return R * c

class UserCreditBalanceView(APIView):
    permission_classes = [IsAuthenticated]  # no auth required
    def get(self, request, user_id):
        point = get_object_or_404(Point, user__id=user_id)
        return Response({
            "user_id": user_id,
            "balance": point.balance
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def credit_purchase(request):
    """
    Proxy endpoint that forwards point purchase request to the real internal API.
    """
    purchase_data = {
        'points': request.data.get('points'),
        'amount': request.data.get('amount'),
        'user_id': request.data.get('user_id'),
    }

    try:
        # Construct full URL to actual internal endpoint
        actual_url = f"{settings.INTERNAL_API_BASE_URL}/api/points/purchase/"

        # Include the current user's access token in the request if needed
        headers = {
            'Authorization': f"Bearer {request.auth}",  # assumes JWT auth
            'Content-Type': 'application/json',
        }

        # Make the internal request
        res = requests.post(actual_url, json=purchase_data, headers=headers)

        # Return the response from the actual API
        return Response(res.json(), status=res.status_code)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreditUpdateByUserPostView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = CreditUpdateByUserSerializer(data=request.data)
        if serializer.is_valid():
            point = serializer.validated_data['point']
            point.balance = serializer.validated_data['new_balance']
            point.save()
            return Response({
                "user_id": point.user.id,
                "new_balance": point.balance
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable, GeocoderTimedOut
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Gig
from .serializers import UserSerializer
from math import radians, cos, sin, asin, sqrt

# --- GigViewSet ---
class GigViewSet(viewsets.ModelViewSet):
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Gig.objects.filter(tutor=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user

        # Count existing gigs by this user
        user_gig_count = Gig.objects.filter(tutor=user).count()

        # Deduct point only if user has already created 5 or more gigs
        if user_gig_count >= 5:
            try:
                point = Point.objects.get(user=user)
                if point.balance < 1:
                    raise ValidationError("Insufficient points to create gig.")
                point.balance -= 1
                point.save()
            except Point.DoesNotExist:
                raise ValidationError("Point record not found.")

        # --- Handle Subject insertion ---
        subject_name = serializer.validated_data.get("subject")
        subject, created = Subject.objects.get_or_create(
            name=subject_name,
            defaults={"is_active": False}
        )
        
        serializer.save(tutor=user)

    @action(detail=True, methods=['post'])
    def boost(self, request, pk=None):
        gig = self.get_object()
        user = request.user

        if user != gig.tutor:
            raise PermissionDenied("Only gig owner can boost.")

        try:
            point = Point.objects.get(user=user)
            if point.balance < 2:
                raise ValidationError("Insufficient points to boost gig.")
            point.balance -= 2
            point.save()
        except Point.DoesNotExist:
            raise ValidationError("Point record not found.")

        gig.used_credits += 1
        gig.save()

        return Response({"detail": "Gig boosted successfully."})

    @action(detail=True, methods=['get'])
    def rank(self, request, pk=None):
        gig = self.get_object()

        if request.user != gig.tutor:
            raise PermissionDenied("You can only view rank for your own gig.")

        # Sort gigs by used_credits and created_at
        all_gigs = Gig.objects.filter(title=gig.title).order_by('-used_credits', '-created_at')
        gig_ids = list(all_gigs.values_list('id', flat=True))

        try:
            rank = gig_ids.index(gig.id) + 1
        except ValueError:
            rank = -1

        return Response({
            "rank": rank,
            "total": len(gig_ids),
            "gig_id": gig.id,
            "subject": gig.title,
        })

    @action(detail=True, methods=['get'])
    def predicted_rank(self, request, pk=None):
        gig = self.get_object()

        if request.user != gig.tutor:
            raise PermissionDenied("You can only view rank for your own gig.")

        try:
            credits_to_spend = int(request.query_params.get('points', 0))
            if credits_to_spend < 0:
                credits_to_spend = 0
        except (TypeError, ValueError):
            credits_to_spend = 0

        simulated_used_credits = gig.used_credits + credits_to_spend

        all_gigs = list(Gig.objects.filter(title=gig.title))

        all_gigs_sorted = sorted(
            all_gigs,
            key=lambda g: (-(g.used_credits if g.id != gig.id else simulated_used_credits), -g.created_at.timestamp())
        )

        try:
            new_rank = [g.id for g in all_gigs_sorted].index(gig.id) + 1
        except ValueError:
            new_rank = -1

        return Response({
            "predicted_rank": new_rank,
            "total": len(all_gigs_sorted),
            "gig_id": gig.id,
            "subject": gig.title,
            "simulated_used_credits": simulated_used_credits,
            "credits_spent": credits_to_spend,
        })# core/views.py

# --- CreditViewSet ---

class CreditViewSet(viewsets.ModelViewSet):
    serializer_class = CreditSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Point.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        points = self.get_queryset()
        if not points.exists():
            return Response({}, status=status.HTTP_200_OK)
        point = points.first()
        serializer = self.get_serializer(point)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Secure purchase endpoint: only authenticated users
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def purchase(self, request):
        """
        Buy points
        """
        try:
            credits_to_add = int(request.data.get('points', 0))
            amount = Decimal(request.data.get('amount', '0'))
        except (ValueError, InvalidOperation):
            return Response({'error': 'Invalid points or amount'}, status=status.HTTP_400_BAD_REQUEST)

        if credits_to_add <= 0 or amount <= 0:
            return Response({'error': 'Points and amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        order = Order.objects.create(user=user, total_amount=amount, is_paid=False)
        transaction_id = generate_transaction_id()

        sslcommerz = SSLCommerzPayment()
        payment = Payment.objects.create(
            order=order,
            transaction_id=transaction_id,
            amount=amount,
            status='PENDING',
            currency='BDT',
        )

        payment_data = {
            'total_amount': str(amount),
            'currency': "BDT",
            'tran_id': transaction_id,
            'success_url': request.build_absolute_uri(reverse('payment_success')),
            'fail_url': request.build_absolute_uri(reverse('payment_fail')),
            'cancel_url': request.build_absolute_uri(reverse('payment_cancel')),
            'ipn_url': request.build_absolute_uri(reverse('sslcommerz_ipn')),
            'cus_name': user.get_full_name() or user.username,
            'cus_email': user.email,
            'value_a': str(user.id),
            'value_b': 'points',
            'value_c': str(order.id),
            'value_d': str(credits_to_add),
            'product_name': f"Points Purchase",
            'product_category': 'Digital Goods',
            'product_profile': 'general',
            'shipping_method': 'NO',
            'num_of_item': 1,
        }

        response_data = sslcommerz.initiate_payment(payment_data)

        if response_data.get('status') == 'SUCCESS':
            payment.bank_transaction_id = response_data.get('tran_id')
            payment.save()
            return Response({
                'status': 'SUCCESS',
                'payment_url': response_data.get('GatewayPageURL'),
                'sessionkey': response_data.get('sessionkey'),
                'transaction_id': transaction_id
            })
        else:
            payment.status = 'FAILED'
            payment.error_message = response_data.get('failedreason', 'Unknown error')
            payment.save()
            return Response({'status': 'FAILED', 'error': payment.error_message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        recipient_id = request.data.get('recipient_id')
        amount = request.data.get('amount')

        # Validate amount as Decimal and positive
        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, InvalidOperation):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            with transaction.atomic():
                sender_credit = Point.objects.select_for_update().get(user=request.user)
                recipient_credit, created = Point.objects.select_for_update().get_or_create(user=recipient)

                if sender_credit.balance < amount:
                    return Response({'error': 'Insufficient points'}, status=status.HTTP_400_BAD_REQUEST)

                sender_credit.balance -= amount
                recipient_credit.balance += amount

                sender_credit.save()
                recipient_credit.save()
        except Point.DoesNotExist:
            return Response({'error': 'Sender point account not found'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Points transferred successfully'})

# --- JobViewSet ---
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'subject', 'location']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()
    def get_queryset(self):
        queryset = Job.objects.all()
        subject = self.request.query_params.get('subject', None)
        location = self.request.query_params.get('location', None)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius_km = float(self.request.query_params.get('radius_km', 20))

        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        if location:
            queryset = queryset.filter(location__icontains=location)

        if lat and lng:
            lat, lng = float(lat), float(lng)
            jobs_in_radius = []
            for job in queryset:
                if job.latitude is not None and job.longitude is not None:
                    distance = haversine(lat, lng, job.latitude, job.longitude)
                    if distance <= radius_km:
                        job._distance = distance
                        jobs_in_radius.append(job)
            jobs_in_radius.sort(key=lambda j: getattr(j, '_distance', 0))
            return jobs_in_radius

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.point.balance < 1:
            raise ValidationError({"detail": "You don't have enough points to post a job."})

        job = serializer.save(student=user)
        user.point.balance -= 1
        user.point.save(update_fields=["balance"])

        # -------------------------------
        # Notify tutors with active gigs and active subjects
        # -------------------------------
        active_job_subjects = job.subjects.filter(is_active=True).values_list("name", flat=True)

        # print(f"Active job subjects for job {job.id}: {list(active_job_subjects)}")
        # Tutors who have active gigs with subjects matching the active job subjects
        tutors = User.objects.filter(
            user_type="tutor",
            gigs__subject__in=active_job_subjects
        ).distinct().annotate(
            total_points_spent=Sum(
                'gigs__used_credits',
                filter=Q(gigs__subject__in=active_job_subjects)
            )
        ).order_by('-total_points_spent')

        tutor_data = []
        notifications = []

        for tutor in tutors:
            if tutor.email:
                verify_url = f"{settings.FRONTEND_SITE_URL}/jobs/{job.id}/"
                html_content = f"""
                <html><body style="font-family: Arial, sans-serif; padding: 40px;">
                <h2>New Job Matching Your Gig!</h2>
                <p>{job.description}</p>
                <p>Location: {job.location}, Budget: {job.budget} USD</p>
                <p>Subjects: {', '.join(active_job_subjects)}</p>
                <a href="{verify_url}">View Job & Apply</a>
                </body></html>
                """
                text_content = f"New job posted: {job.description}\nView & apply here: {verify_url}"

                # collect for bulk email
                tutor_data.append({
                    'email': tutor.email,
                    'html_content': html_content,
                    'text_content': text_content
                })

            # create in-app notification
            notifications.append(Notification(
                from_user=user,
                to_user=tutor,
                message=f"New job posted matching your subjects: {', '.join(active_job_subjects)}"
            ))

        # -------------------------------
        # Save all notifications at once
        # -------------------------------
        if notifications:
            Notification.objects.bulk_create(notifications)

        # -------------------------------
        # Send emails in batches
        # -------------------------------
        schedule_job_emails(tutor_data)

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def matched_jobs(self, request):
        user = request.user
        if user.user_type != "tutor":
            return Response(
                {"detail": "Only tutors can access this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Step 1: Get all active Subject names
        active_subjects = Subject.objects.filter(is_active=True).values_list("name", flat=True)

        # Step 2: Collect tutor's gigs whose subject is active
        gig_subject_names = user.gigs.filter(subject__in=active_subjects).values_list("subject", flat=True).distinct()

        if not gig_subject_names:
            return Response([], status=status.HTTP_200_OK)

        # Step 3: Get jobs with those subjects
        jobs = Job.objects.filter(subjects__name__in=gig_subject_names).distinct().order_by("-created_at")

        # Step 4: Paginate & serialize
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ---------------------------
    # Job Unlock
    # ---------------------------
    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def unlock(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
            tutor = request.user
        except Job.DoesNotExist:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get active gig subject names (strings)
        gig_subjects = tutor.gigs.values_list("subject", flat=True).distinct()

        # Check if job has at least one matching subject
        if not job.subjects.filter(name__in=gig_subjects, is_active=True).exists():
            return Response(
                {"detail": "You need an active gig with a matching subject to unlock this job."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if JobUnlock.objects.filter(job=job, tutor=tutor).exists():
            return Response({"detail": "Job already unlocked"}, status=status.HTTP_400_BAD_REQUEST)

        points = self.calculate_unlock_points(job, tutor)

        if tutor.point.balance < points:
            return Response({"detail": "Insufficient points"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Deduct points
            tutor.point.balance -= points
            tutor.point.save(update_fields=["balance"])

            # Save job unlock
            unlock_obj = JobUnlock.objects.create(job=job, tutor=tutor, points_spent=points)

            # Also unlock contact: tutor -> student (job poster)
            ContactUnlock.objects.get_or_create(
                unlocker=tutor,
                target=job.student
            )

        serializer = JobUnlockSerializer(unlock_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ---------------------------
    # Preview unlock points
    # ---------------------------
    @action(detail=True, methods=['GET'])
    def preview(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
            tutor = request.user
        except Job.DoesNotExist:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        unlocked = JobUnlock.objects.filter(job=job, tutor=tutor).exists()
        points_needed = 0
        if not unlocked:
            points_needed = self.calculate_unlock_points(job, tutor)

        return Response({
            "unlocked": unlocked,
            "points_needed": points_needed
        }, status=status.HTTP_200_OK)

    # ---------------------------
    # Helper Methods
    # ---------------------------
    def calculate_unlock_points(self, job: Job, tutor: User) -> int:
        """
        Full calculation pipeline:
        1. Use budget → normalize hourly → tier → base points
        2. If no budget, fallback to country points
        3. Apply bidding (10% increase per unlock, max 10 unlocks)
        4. Apply decay (after 36h idle, -5% per 5h, min 20% of base)
        """
        # Step 1: Base points
        if job.budget and job.total_hours:
            hourly_rate = self.normalize_hourly_rate(job)
            base_points = self.get_base_points_for_hourly(hourly_rate)
        else:
            base_points = self.get_country_group_points(job.country)

        # Step 2 + 3: Dynamic pricing
        final_points = self.calculate_dynamic_price(job, base_points)

        return max(final_points, 1)

    def normalize_hourly_rate(self, job: Job) -> float:
        """
        Convert any job budget type (Per Hour, Per Day, Per Week, etc.) to hourly.
        """
        total_hours = job.total_hours or 1
        budget = float(job.budget or 0)

        if job.budget_type == "Per Hour":
            return budget
        return budget / total_hours

    def get_base_points_for_hourly(self, hourly_rate: float) -> int:
        """
        Find unlock tier based on hourly rate.
        If not in range → clamp to lowest or highest tier.
        """
        tiers = UnlockPricingTier.objects.order_by('min_rate')
        if not tiers.exists():
            return 100  # fallback if no tiers defined

        # Match tier
        tier = tiers.filter(min_rate__lte=hourly_rate).filter(
            Q(max_rate__gte=hourly_rate) | Q(max_rate__isnull=True)
        ).first()
        if tier:
            return tier.points

        lowest_tier = tiers.first()
        highest_tier = tiers.last()

        if hourly_rate < lowest_tier.min_rate:
            return lowest_tier.points
        if highest_tier.max_rate and hourly_rate > highest_tier.max_rate:
            return highest_tier.points

        return lowest_tier.points

    def get_country_group_points(self, country: str) -> int:
        group_obj = CountryGroup.objects.filter(name=country).first()
        if not group_obj:
            return 100
        group_point_obj = CountryGroupPoint.objects.filter(group=group_obj.group).first()
        return group_point_obj.points if group_point_obj else 100

    def calculate_dynamic_price(self, job: Job, base_price: int) -> int:
        """
        Apply bidding increase & decay decrease.
        """
        price = base_price
        unlock_count = job.unlocks.count()

        # 1. Increment per unlock (10% each, cap at 10)
        effective_unlocks = min(unlock_count, 10)
        if effective_unlocks > 0:
            price = int(price * (1.1 ** effective_unlocks))

        # 2. Decay if idle for 36h
        if unlock_count == 0 and job.created_at:
            now = timezone.now()
            idle_time = now - job.created_at

            if idle_time > timedelta(hours=36):
                five_hour_blocks = (idle_time - timedelta(hours=36)) // timedelta(hours=5)
                for _ in range(int(five_hour_blocks)):
                    price = int(price * 0.95)

        # 3. Floor = 20% of base
        min_price = int(base_price * 0.20)
        return max(price, min_price)
    
    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def applicants(self, request, pk=None):
        """
        Returns a list of tutors who have applied for this job (or unlocked it),
        sorted by total points spent on their gigs (descending).
        If the requesting user is a student, email and phone are only
        shown if the contact is unlocked.
        """
        user = request.user

        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        # Tutors who unlocked the job
        unlocked_tutor_ids = JobUnlock.objects.filter(job=job).values_list('tutor_id', flat=True)

        # Tutors who have gigs in the job subjects
        job_subject_names = list(job.subjects.filter(is_active=True).values_list("name", flat=True))
        if not job_subject_names:
            return Response([], status=status.HTTP_200_OK)

        tutors = User.objects.filter(
            user_type="tutor",
            gigs__subject__in=job_subject_names,
            id__in=unlocked_tutor_ids  # Only those who unlocked/applied
        ).distinct().order_by('-gigs__used_credits')

        tutor_list = []
        for tutor in tutors:
            contact_unlocked = ContactUnlock.objects.filter(
                unlocker=user,
                target=tutor
            ).exists() if user.user_type == "student" else True  # tutors see full info

            tutor_list.append({
                "id": tutor.id,
                "username": tutor.username,
                "email": tutor.email if contact_unlocked else None,
                "phone": str(tutor.phone_number) if contact_unlocked and tutor.phone_number else None,
            })

        return Response(tutor_list, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def choose_tutor(self, request, pk=None):
        """
        Student chooses a tutor for this job. Job status is set to 'Assigned'.
        """
        user = request.user
        if user.user_type != 'student':
            return Response({"detail": "Only students can choose a tutor."}, status=status.HTTP_403_FORBIDDEN)

        job = get_object_or_404(Job, pk=pk)
        tutor_id = request.data.get('tutor_id')

        if not tutor_id:
            return Response({"detail": "tutor_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tutor = User.objects.get(id=tutor_id, user_type='tutor')
        except User.DoesNotExist:
            return Response({"detail": "Tutor not found."}, status=status.HTTP_404_NOT_FOUND)

        # Optional: check if tutor applied/unlocked this job
        if not JobUnlock.objects.filter(job=job, tutor=tutor).exists():
            return Response({"detail": "Tutor has not unlocked/applied for this job."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Assign the tutor and update job status
        job.assigned_tutor = tutor
        job.status = 'Assigned'
        job.save()

        return Response({
            "detail": f"Tutor {tutor.username} has been assigned to this job.",
            "job_id": job.id,
            "assigned_tutor": tutor.id,
            "status": job.status
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='complete', permission_classes=[IsAuthenticated])
    def complete_job(self, request, pk=None):
        try:
            job = self.get_object()
        except Job.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Only assigned tutor can mark complete
        if job.assigned_tutor != request.user:
            return Response({"detail": "You are not assigned to this job."}, status=status.HTTP_403_FORBIDDEN)
        
        if job.status == 'Completed':
            return Response({"detail": "Job is already completed."}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = 'Completed'
        job.save()
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['POST'], url_path='review')
    def submit_review(self, request, pk=None):
        job = self.get_object()
        user = request.user

        # Only student can review
        if job.student != user:
            return Response({"detail": "You can only review your own jobs."}, status=status.HTTP_403_FORBIDDEN)

        if not job.assigned_tutor:
            return Response({"detail": "No tutor assigned to this job."}, status=status.HTTP_400_BAD_REQUEST)

        if job.status != "Completed":
            return Response({"detail": "You can review only completed jobs."}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(job, 'review'):
            return Response({"detail": "You have already submitted a review for this job."}, status=status.HTTP_400_BAD_REQUEST)

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or not (1 <= int(rating) <= 5):
            return Response({"detail": "Rating must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            job=job,
            tutor=job.assigned_tutor,
            student=user,
            rating=rating,
            comment=comment
        )

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- ApplicationViewSet ---
class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'teacher':
            return Application.objects.filter(teacher=self.request.user)
        return Application.objects.filter(job__student=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.user_type != 'teacher':
            raise ValidationError("Only teachers can apply to jobs")
        job_id = request.data.get('job')
        is_premium = False
        try:
            user_settings = UserSettings.objects.get(user=user)
            is_premium = user_settings.is_premium
        except UserSettings.DoesNotExist:
            is_premium = False
        if not is_premium:
            days_limit = 30
            max_applications = 10
            since = timezone.now() - timedelta(days=days_limit)
            app_count = Application.objects.filter(
                teacher=user,
                created_at__gte=since
            ).count()
            if app_count >= max_applications:
                return Response(
                    {'error': f'You have reached your monthly application limit ({max_applications}). Upgrade to Premium for unlimited applies.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if Application.objects.filter(job=job, teacher=user).exists():
            return Response(
                {'error': 'You have already applied to this job'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            point = Point.objects.get(user=user)
        except Point.DoesNotExist:
            point = Point.objects.create(user=user)
        if point.balance < 1:
            return Response(
                {'error': 'Insufficient points to apply'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application = Application.objects.create(
            job=job,
            teacher=user,
            is_premium=is_premium
        )
        if not is_premium:
            application.countdown_end = timezone.now() + timedelta(hours=24)
            application.save()
        point.balance -= 1
        point.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        application = self.get_object()
        if application.job.student != request.user:
            return Response({'error': 'Only the job owner can pay'}, status=403)
        if EscrowPayment.objects.filter(job=application.job).exists():
            return Response({'error': 'Escrow already created for this job'}, status=400)
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount required'}, status=400)
        escrow = EscrowPayment.objects.create(
            student=request.user,
            tutor=application.teacher,
            job=application.job,
            amount=amount,
            is_released=False,
        )
        return Response({'message': 'Escrow created', 'escrow_id': escrow.id})

# --- NotificationViewSet ---
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='unread')
    def unread(self, request):
        unread_notifications = self.queryset.filter(to_user=request.user, is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='mark-read')
    def mark_read(self, request):
        updated_count = self.queryset.filter(to_user=request.user, is_read=False).update(is_read=True)
        return Response({'marked_read_count': updated_count})


# --- MessageViewSet ---
# class MessageViewSet(viewsets.ModelViewSet):
#     serializer_class = MessageSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         return Message.objects.filter(Q(sender=user) | Q(receiver=user))

#     def create(self, request, *args, **kwargs):
#         if request.user.user_type == 'student':
#             try:
#                 point = Point.objects.get(user=request.user)
#             except Point.DoesNotExist:
#                 return Response({'error': 'You must buy points to message tutors.'}, status=status.HTTP_403_FORBIDDEN)
#             if point.balance < 1:
#                 return Response({'error': 'Insufficient points. Buy points to unlock messaging.'}, status=status.HTTP_403_FORBIDDEN)
#             point.balance -= 1
#             point.save()
#         receiver_id = request.data.get('receiver')
#         content = request.data.get('content')
#         if not receiver_id or not content:
#             return Response(
#                 {'error': 'Both receiver and content are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         try:
#             receiver = User.objects.get(id=receiver_id)
#         except User.DoesNotExist:
#             return Response(
#                 {'error': 'Receiver not found'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         message = Message.objects.create(
#             sender=request.user,
#             receiver=receiver,
#             content=content
#         )
#         serializer = self.get_serializer(message)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- UserSettingsViewSet ---
class UserSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def update_notification_preferences(self, request):
        settings = self.get_queryset().first()
        settings.email_notifications = request.data.get('email_notifications', settings.email_notifications)
        settings.sms_notifications = request.data.get('sms_notifications', settings.sms_notifications)
        settings.push_notifications = request.data.get('push_notifications', settings.push_notifications)
        settings.save()
        return Response({'status': 'notification preferences updated'})

    @action(detail=False, methods=['post'])
    def update_privacy(self, request):
        settings = self.get_queryset().first()
        settings.profile_visibility = request.data.get('profile_visibility', settings.profile_visibility)
        settings.search_visibility = request.data.get('search_visibility', settings.search_visibility)
        settings.save()
        return Response({'status': 'privacy settings updated'})

# --- ReviewViewSet (with trust_score update hook) ---
from core.utils import schedule_job_emails, schedule_premium_expiry, update_trust_score
class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return Review.objects.filter(student=self.request.user)
        return Review.objects.filter(teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(student=request.user)
        update_trust_score(review.teacher)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- PremiumViewSet ---
class PremiumViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        user_settings = UserSettings.objects.get(user=request.user)
        return Response({
            'is_premium': user_settings.is_premium,
            'premium_expires': user_settings.premium_expires,
            'features': self.get_premium_features()
        })

    # TEMPORARY: Changed permission_classes to AllowAny for testing without authentication
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def upgrade(self, request):
        # IMPORTANT: For unauthenticated testing, you NEED a user object.
        # You could fetch a specific test user or create a temporary one if needed.
        # For now, let's try to get user by ID passed from frontend or default to a mock user.
        # This is a dangerous temporary bypass for testing purposes only!
        user_id = request.data.get('user_id') # Expect user_id from frontend if no token
        try:
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                # Fallback for local testing without user_id or token: use an existing user
                # Replace with a known user ID from your database for testing
                user = User.objects.first() # DANGER: Do not do this in production!
                if not user:
                    return Response({'error': 'No user found for testing. Please create one.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Test user not found.'}, status=status.HTTP_400_BAD_REQUEST)


        user_settings, _ = UserSettings.objects.get_or_create(user=user) # Use the acquired user object
        plan = request.data.get('plan')
        sslcommerz = SSLCommerzPayment()
        
        total_amount = self.get_plan_price(plan)
        if not isinstance(total_amount, Decimal):
            total_amount = Decimal(str(total_amount))
        
        transaction_id = f"PREMIUM_{user.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}" # Use acquired user.id

        order = Order.objects.create(
            user=user, # Use the acquired user object
            total_amount=total_amount,
            is_paid=False,
        )
        payment = Payment.objects.create(
            order=order,
            transaction_id=transaction_id,
            amount=total_amount,
            status='PENDING',
            currency='BDT',
            validation_status=f"PREMIUM_PLAN_{plan}"
        )

        payment_data = {
            'total_amount': str(total_amount),
            'currency': "BDT",
            'tran_id': transaction_id,
            'success_url': request.build_absolute_uri(reverse('payment_success')),
            'fail_url': request.build_absolute_uri(reverse('payment_fail')),
            'cancel_url': request.build_absolute_uri(reverse('payment_cancel')),
            'ipn_url': request.build_absolute_uri(reverse('sslcommerz_ipn')),
            'cus_name': user.get_full_name() or user.username, # Use acquired user object
            'cus_email': user.email, # Use acquired user object
            'value_a': str(user.id),
            'value_b': 'premium_upgrade',
            'value_c': str(order.id),
            'product_name': f"Premium plan ({plan})",
            'product_category': 'Service',
            'product_profile': 'general',
            'shipping_method': 'NO',
            'num_of_item': 1,
        }
        response = sslcommerz.initiate_payment(payment_data)

        if response and response.get('status') == 'SUCCESS':
            payment.bank_transaction_id = response.get('tran_id')
            payment.save()
            return Response({
                'status': 'SUCCESS',
                'payment_url': response.get('GatewayPageURL'),
                'sessionkey': response.get('sessionkey'),
                'transaction_id': transaction_id
            })
        else:
            error_message = response.get('failedreason', 'Unknown error initiating premium payment.')
            payment.status = 'FAILED'
            payment.error_message = error_message
            payment.save()
            return Response({
                'status': 'FAILED',
                'error': error_message
            }, status=status.HTTP_400_BAD_REQUEST)


    def get_premium_features(self):
        return {
            'priority_listing': True,
            'unlimited_gigs': True,
            'instant_apply': True,
            'analytics': True,
            'profile_badge': True
        }

    def get_plan_price(self, plan):
        prices = {
            'monthly': Decimal('1000.00'),
            'yearly': Decimal('10000.00')
        }
        return prices.get(plan, Decimal('1000.00'))

# --- SubjectViewSet ---
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'aliases']

    @api_view(['GET'])
    def suggest_subjects(request):
        query = request.query_params.get('q', '')
        if query:
            subjects = Subject.objects.filter(
                Q(name__icontains=query) | Q(aliases__icontains=query)
            )
        else:
            subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects[:10], many=True)
        return Response(serializer.data)

def build_payment_data(request, user, order, transaction_id, amount, product_type, points=0):
    """
    Returns consistent payment_data dict for SSLCommerz.
    product_type: 'premium' or 'points'
    points: number of points (for points purchase)
    """
    if product_type == 'premium':
        value_b = 'premium'
        product_name = "Premium Subscription"
    else:
        value_b = str(points)
        product_name = f"Points purchase for {points}"

    return {
        'total_amount': str(amount),
        'currency': "BDT",
        'tran_id': transaction_id,
        'success_url': request.build_absolute_uri(reverse('payment_success')),
        'fail_url': request.build_absolute_uri(reverse('payment_fail')),
        'cancel_url': request.build_absolute_uri(reverse('payment_cancel')),
        'ipn_url': request.build_absolute_uri(reverse('sslcommerz_ipn')),
        'cus_name': user.get_full_name() or user.username,
        'cus_email': user.email,
        'value_a': str(user.id),
        'value_b': value_b,
        'value_c': str(order.id),
        'product_name': product_name,
        'product_category': 'Digital Goods',
        'product_profile': 'general',
        'shipping_method': 'NO',
        'num_of_item': 1,
    }

# --- EscrowPaymentViewSet ---
class EscrowPaymentViewSet(viewsets.ModelViewSet):
    queryset = EscrowPayment.objects.all()
    serializer_class = EscrowPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return EscrowPayment.objects.filter(student=user)
        elif user.user_type == 'teacher':
            return EscrowPayment.objects.filter(tutor=user)
        return EscrowPayment.objects.none()

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        escrow = self.get_object()
        if escrow.is_released:
            return Response({'status': 'Already released'})
        if request.user != escrow.student:
            return Response({'error': 'Only the student can release funds.'}, status=status.HTTP_403_FORBIDDEN)
        commission_pct = Decimal('0.10')
        escrow.commission = escrow.amount * commission_pct
        tutor_payout = escrow.amount - escrow.commission
        escrow.is_released = True
        escrow.released_at = timezone.now()
        escrow.save()
        return Response({
            'status': 'Released',
            'tutor_payout': float(tutor_payout),
            'commission': float(escrow.commission)
        })

# --- AbuseReportSerializer not shown for brevity ---

# --- SSLCommerz IPN, Success, Fail, Cancel Views ---
def update_user_credit(user_id: int, credits_to_add: int):
    try:
        user = User.objects.get(id=user_id)
        credit_obj, _ = Point.objects.get_or_create(user=user)
        credit_obj.balance = (credit_obj.balance or 0) + credits_to_add
        credit_obj.save()
        return True, credit_obj.balance
    except User.DoesNotExist:
        return False, "User not found"

@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def payment_success_view(request):
    """
    Handles successful payment callbacks from SSLCommerz.
    Validates the transaction, updates records, and redirects to frontend with payment details.
    """
    data = request.POST if request.method == 'POST' else request.GET

    # Required fields
    tran_id = data.get('tran_id')
    val_id = data.get('val_id')
    user_id_str = data.get('value_a')  # User ID
    payment_type = data.get('value_b')  # 'points' or 'premium'
    order_id_str = data.get('value_c')  # Order ID
    credits_amount_str = data.get('value_d', '0')  # Only for point purchase

    # Basic validation
    if not tran_id or not val_id:
        query = urlencode({'tran_id': tran_id or '', 'reason': 'Missing transaction or validation ID'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    # Safe conversion of numeric fields
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        user_id = None

    try:
        order_id = int(order_id_str)
    except (ValueError, TypeError):
        order_id = None

    try:
        credits_amount = int(credits_amount_str or 0)
    except ValueError:
        credits_amount = 0

    if user_id is None or order_id is None:
        query = urlencode({'tran_id': tran_id, 'reason': 'Invalid User ID or Order ID'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    # Fetch records
    try:
        order = Order.objects.get(id=order_id)
        payment = Payment.objects.get(order=order, transaction_id=tran_id)
        user = order.user
    except (Order.DoesNotExist, Payment.DoesNotExist, User.DoesNotExist):
        query = urlencode({'tran_id': tran_id, 'reason': 'Order or payment not found'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")
    except Exception as e:
        query = urlencode({'tran_id': tran_id, 'reason': f'Unexpected error: {e}'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    # Validate transaction with SSLCommerz
    sslcommerz = SSLCommerzPayment()
    validation_response = sslcommerz.validate_transaction(val_id)

    if not validation_response or validation_response.get('status') != 'VALID':
        error_message = validation_response.get('failedreason', 'Payment validation failed.') if validation_response else 'Payment validation failed.'
        if payment.status == 'PENDING':
            payment.status = 'FAILED'
            payment.validation_status = 'NOT_VALIDATED'
            payment.error_message = error_message
            payment.save()
        query = urlencode({'tran_id': tran_id, 'reason': error_message})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    # Check amount & currency
    validated_amount = Decimal(validation_response.get('amount', '0.00'))
    validated_currency = validation_response.get('currency', '')

    if payment.status in ['PENDING', 'FAILED']:
        if validated_amount == payment.amount and validated_currency == payment.currency:
            # Payment success
            payment.status = 'SUCCESS'
            payment.bank_transaction_id = validation_response.get('bank_tran_id', payment.bank_transaction_id)
            payment.validation_status = 'VALIDATED'
            payment.save()

            order.is_paid = True
            order.save()

            if payment_type == 'points':
                credit_obj, _ = Point.objects.get_or_create(user=user)
                credit_obj.balance += credits_amount
                credit_obj.save()

            elif payment_type == 'premium':
                now = timezone.now()
                if not user.premium_expires or user.premium_expires < now:
                    user.premium_expires = now + timedelta(days=30)
                else:
                    user.premium_expires += timedelta(days=30)

                user.is_premium = True
                user.save()
                # Schedule exact expiry
                schedule_premium_expiry(user)

            query = urlencode({
                'tran_id': tran_id,
                'val_id': val_id,
                'amount': str(validated_amount),
                'status': 'SUCCESS',
                'payment_type': payment_type,
            })
            return redirect(f"{settings.FRONTEND_SITE_URL}/payments/success?{query}")

        else:
            payment.status = 'FAILED'
            payment.validation_status = 'AMOUNT_MISMATCH'
            payment.error_message = 'Amount/currency mismatch'
            payment.save()
            query = urlencode({'tran_id': tran_id, 'reason': 'Amount/currency mismatch'})
            return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    else:
        # Already processed
        query = urlencode({
            'tran_id': tran_id,
            'val_id': val_id,
            'amount': str(payment.amount),
            'status': payment.status,
            'payment_type': payment_type,
        })
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/success?{query}")

@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def payment_fail_view(request):
    """
    Handles failed payment callbacks from SSLCommerz.
    Updates payment status to 'FAILED' and redirects to frontend with error details.
    """
    data = request.POST if request.method == 'POST' else request.GET

    tran_id = data.get('tran_id')
    order_id_str = data.get('value_c')
    fail_reason = data.get('failedreason', 'Payment failed or was cancelled.')

    if tran_id and order_id_str:
        try:
            order = Order.objects.get(id=order_id_str)
            payment = Payment.objects.get(order=order, transaction_id=tran_id)

            if payment.status == 'PENDING':
                payment.status = 'FAILED'
                payment.error_message = fail_reason
                payment.save()

        except (Order.DoesNotExist, Payment.DoesNotExist):
            print(f"[FAIL] Order or Payment not found (tran_id: {tran_id}, order_id: {order_id_str})")
            fail_reason = 'Associated order or payment not found.'

        except Exception as e:
            print(f"[FAIL] Unexpected error for tran_id: {tran_id} → {e}")
            fail_reason = 'An unexpected error occurred.'

    else:
        fail_reason = 'Missing transaction ID or order ID.'

    # Redirect to frontend with query params
    query = urlencode({
        'tran_id': tran_id or '',
        'status': 'FAILED',
        'reason': fail_reason,
    })
    return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def payment_cancel_view(request):
    """
    Handles cancelled payment callbacks from SSLCommerz.
    Updates the payment status to 'CANCELED' and redirects to frontend with details.
    """
    data = request.POST if request.method == 'POST' else request.GET

    tran_id = data.get('tran_id')
    order_id_str = data.get('value_c')
    cancel_reason = 'User cancelled the payment.'

    if tran_id and order_id_str:
        try:
            order = Order.objects.get(id=order_id_str)
            payment = Payment.objects.get(order=order, transaction_id=tran_id)

            if payment.status == 'PENDING':
                payment.status = 'CANCELED'
                payment.error_message = cancel_reason
                payment.save()

        except (Order.DoesNotExist, Payment.DoesNotExist):
            print(f"[CANCEL] Order or Payment not found (tran_id: {tran_id}, order_id: {order_id_str})")
            cancel_reason = 'Associated order or payment not found.'

        except Exception as e:
            print(f"[CANCEL] Unexpected error for tran_id: {tran_id} → {e}")
            cancel_reason = 'An unexpected error occurred during cancellation.'

    else:
        cancel_reason = 'Missing transaction ID or order ID.'

    # Redirect to frontend with query parameters
    query = urlencode({
        'tran_id': tran_id or '',
        'status': 'CANCELED',
        'reason': cancel_reason,
    })
    return redirect(f"{settings.FRONTEND_SITE_URL}/payments/cancel?{query}")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def sslcommerz_ipn(request):
    """
    Handles Instant Payment Notifications (IPN) from SSLCommerz.
    This is a server-to-server communication to confirm payment status.
    It should always validate the transaction with SSLCommerz.
    """
    data = request.POST.dict()

    tran_id = data.get('tran_id')
    val_id = data.get('val_id')
    status_from_ipn = data.get('status')

    user_id_str = data.get('value_a')
    payment_type = data.get('value_b')
    order_id_str = data.get('value_c')

    if not tran_id or not val_id or not user_id_str or not order_id_str:
        print(f"IPN: Missing essential data. Tran_id: {tran_id}, Val_id: {val_id}, User_id: {user_id_str}, Order_id: {order_id_str}")
        return JsonResponse({'status': 'failed', 'message': 'Missing essential data'}, status=400)

    try:
        user = User.objects.get(id=user_id_str)
        order = Order.objects.get(id=order_id_str, user=user)
        payment = Payment.objects.get(order=order, transaction_id=tran_id)
    except (User.DoesNotExist, Order.DoesNotExist, Payment.DoesNotExist) as e:
        print(f"IPN: Object not found. Error: {e}")
        return JsonResponse({'status': 'failed', 'message': 'User, Order or Payment record not found'}, status=404)
    except Exception as e:
        print(f"IPN: Unexpected error retrieving records: {e}")
        return JsonResponse({'status': 'failed', 'message': 'An unexpected error occurred.'}, status=500)


    sslcommerz = SSLCommerzPayment()
    validation_response = sslcommerz.validate_transaction(val_id)

    if validation_response and validation_response.get('status') == 'VALID':
        validated_amount = Decimal(validation_response.get('amount', '0.00'))
        validated_currency = validation_response.get('currency', '')

        if payment.status == 'PENDING' or payment.status == 'FAILED':
            if validated_amount == payment.amount and validated_currency == payment.currency:
                payment.status = 'SUCCESS'
                payment.bank_transaction_id = validation_response.get('bank_tran_id', payment.bank_transaction_id)
                payment.validation_status = 'VALIDATED_BY_IPN'
                payment.save()

                order.is_paid = True
                order.save()

                if payment_type == 'credit_purchase':
                    credits_to_add = int(data.get('value_b', 0))
                    credit_obj, _ = Point.objects.get_or_create(user=user)
                    credit_obj.balance += credits_to_add
                    credit_obj.save()
                    Notification.objects.create(
                        user=user,
                        message=f"💰 Your purchase of {credits_to_add} points was confirmed (IPN)! Your new balance is {credit_obj.balance}."
                    )
                elif payment_type == 'premium_upgrade':
                    user_settings, _ = UserSettings.objects.get_or_create(user=user)
                    now = timezone.now()
                    if not user_settings.premium_expires or user_settings.premium_expires < now:
                        user_settings.premium_expires = now + timedelta(days=30)
                    else:
                        user_settings.premium_expires += timedelta(days=30)
                    user_settings.is_premium = True
                    user_settings.save()
                    Notification.objects.create(
                        user=user,
                        message=f"✨ Your premium upgrade was confirmed (IPN)! Expires on {user_settings.premium_expires.strftime('%Y-%m-%d')}."
                    )
                
                return JsonResponse({'status': 'success', 'message': 'IPN processed successfully'})
            else:
                error_message = "IPN: Payment amount/currency mismatch."
                payment.status = 'FAILED'
                payment.validation_status = 'IPN_AMOUNT_MISMATCH'
                payment.error_message = error_message
                payment.save()
                print(f"IPN: Amount/currency mismatch for tran_id: {tran_id}. Expected {payment.amount} {payment.currency}, Got {validated_amount} {validated_currency}")
                return JsonResponse({'status': 'failed', 'message': error_message}, status=200)
        else:
            print(f"IPN: Payment already processed for tran_id: {tran_id}. Current status: {payment.status}")
            return JsonResponse({'status': 'success', 'message': 'Payment already processed.'}, status=200)
    else:
        error_message = validation_response.get('failedreason', 'IPN validation failed or payment invalid.')
        if payment.status == 'PENDING':
            payment.status = 'FAILED'
            payment.validation_status = f"IPN_VALIDATION_FAILED: {status_from_ipn}"
            payment.error_message = error_message
            payment.save()
        print(f"IPN: Validation API returned non-VALID status for tran_id: {tran_id}. Response: {validation_response}")
        return JsonResponse({'status': 'failed', 'message': error_message}, status=200)


# --- AdminViewSet ---
class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        return Response({
            "users": User.objects.count(),
            "gigs": Gig.objects.count(),
            "pending_gigs": Gig.objects.filter(status='pending').count(),
            "jobs": Job.objects.count(),
            "reviews": Review.objects.count(),
            "total_orders": Order.objects.count(),
            "paid_orders": Order.objects.filter(is_paid=True).count(),
            "total_payments": Payment.objects.count(),
            "successful_payments": Payment.objects.filter(status='SUCCESS').count(),
        })

    @action(detail=False, methods=['get'])
    def pending_gigs(self, request):
        gigs = Gig.objects.filter(status='pending')
        return Response(GigSerializer(gigs, many=True).data)

    @action(detail=True, methods=['post'])
    def approve_gig(self, request, pk=None):
        gig = Gig.objects.get(pk=pk)
        gig.status = 'active'
        gig.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def block_user(self, request, pk=None):
        user = User.objects.get(pk=pk)
        user.is_active = False
        user.save()
        return Response({'status': 'blocked'})

    @action(detail=False, methods=['get'])
    def reports(self, request):
        from .models import AbuseReport
        reports = AbuseReport.objects.all().order_by('-created_at')
        return Response(AbuseReportSerializer(reports, many=True).data)

    @action(detail=True, methods=['post'])
    def delete_review(self, request, pk=None):
        Review.objects.filter(pk=pk).delete()
        return Response({'status': 'deleted'})

# ------------------ AUTH API: Registration, Email Verify, Login, Password Reset -------------------

class ContactUnlockViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='unlock')
    def unlock_contact(self, request):
        target_id = request.data.get('target_id')
        if not target_id:
            return Response({'detail': 'target_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=target_id)
        except User.DoesNotExist:
            return Response({'detail': 'Target user not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent self-unlock
        if request.user.id == target_user.id:
            return Response({'detail': 'You cannot unlock yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already unlocked
        unlock, created = ContactUnlock.objects.get_or_create(
            unlocker=request.user, target=target_user
        )
        if not created:
            return Response({'detail': 'Contact already unlocked.'}, status=status.HTTP_200_OK)

        # 🧾 Deduct 1 point (only if newly unlocking)
        try:
            point = Point.objects.get(user=request.user)
            if point.balance >= 1:
                point.balance -= 1
                point.save()
            else:
                unlock.delete()  # rollback unlock if not enough points
                return Response({'detail': 'Insufficient points'}, status=status.HTTP_402_PAYMENT_REQUIRED)
        except Point.DoesNotExist:
            unlock.delete()
            return Response({'detail': 'Point record not found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ContactUnlockSerializer(unlock, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='status')
    def check_status(self, request):
        target_id = request.query_params.get('target_id')
        if not target_id:
            return Response({'detail': 'target_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        is_unlocked = ContactUnlock.objects.filter(
            unlocker=request.user, target_id=target_id
        ).exists()

        return Response({'unlocked': is_unlocked})

# NEW: Payment ViewSet to list payments
class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A read-only ViewSet for listing payments related to the authenticated user.
    Students can see their own payments, and tutors can potentially see payments
    made to them (if implemented).
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user).order_by('-payment_date')

otp_store = {} 

# Configuration
OTP_EXPIRY_SECONDS = 300  # OTP valid for 5 minutes
OTP_MAX_REQUESTS = 2      # Max OTP requests per user per day
RATE_LIMIT_WINDOW = 86400  # 1 day

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_whatsapp(request):
    """
    Send WhatsApp OTP via Mudslide with expiry and rate limiting.
    Prevent sending new OTP before the current one expires.
    """
    try:
        phone_number = request.data.get("phone_number")
        message = request.data.get("message")  # optional

        if not phone_number:
            return Response({"error": "phone_number is required"}, status=400)

        user_id = request.user.id
        now = time.time()

        # Rate limiting
        user_data = otp_store.get(user_id, {})
        last_requests = user_data.get("requests", [])

        # Filter requests older than RATE_LIMIT_WINDOW
        last_requests = [t for t in last_requests if now - t < RATE_LIMIT_WINDOW]
        if len(last_requests) >= OTP_MAX_REQUESTS:
            return Response({"status": "failed", "message": "OTP request limit reached. Try later."}, status=429)

        # Check if a valid OTP already exists
        existing_otp_data = otp_store.get(user_id)
        if existing_otp_data:
            otp_timestamp = existing_otp_data.get("timestamp", 0)
            if now - otp_timestamp < OTP_EXPIRY_SECONDS:
                remaining = int(OTP_EXPIRY_SECONDS - (now - otp_timestamp))
                return Response({
                    "status": "failed",
                    "message": f"An OTP is already active. Please wait {remaining} seconds before requesting a new one."
                }, status=400)

        # Generate new OTP
        otp = message if message else str(random.randint(100000, 999999))
        otp_message = message if message else f"Your OTP is {otp}"

        # Strip '+' from phone number
        phone_number = phone_number.lstrip("+")

        # Build Mudslide command
        cmd = ["npx", "mudslide", "send", phone_number, otp_message]

        # Run subprocess
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        output = result.stdout if result.stdout else result.stderr

        if result.returncode == 0:
            # Store OTP with timestamp and update request history
            otp_store[user_id] = {
                "otp": otp,
                "timestamp": now,
                "requests": last_requests + [now]
            }
            return Response({"status": "success", "message": "OTP sent successfully"})
        else:
            return Response({"status": "failed", "error": output}, status=500)

    except Exception as e:
        return Response({"status": "failed", "error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request):
    """
    Verify OTP submitted by the authenticated user, with expiry check.
    """
    try:
        user = request.user
        user_id = user.id
        input_otp = request.data.get("otp")

        if not input_otp:
            return Response({"error": "OTP is required"}, status=400)

        user_data = otp_store.get(user_id)
        if not user_data:
            return Response({"status": "failed", "message": "No OTP found for this user"}, status=400)

        otp = user_data.get("otp")
        timestamp = user_data.get("timestamp", 0)
        now = time.time()

        # Check expiry
        if now - timestamp > OTP_EXPIRY_SECONDS:
            otp_store.pop(user_id)
            return Response({"status": "failed", "message": "OTP expired"}, status=400)

        # Verify OTP
        if str(input_otp) == str(otp):
            otp_store.pop(user_id)

            # Update user field
            user.phone_verified = True
            user.save(update_fields=["phone_verified"])

            return Response({"status": "success", "message": "OTP verified successfully"})
        else:
            return Response({"status": "failed", "message": "Invalid OTP"}, status=400)

    except Exception as e:
        return Response({"status": "failed", "error": str(e)}, status=500)
