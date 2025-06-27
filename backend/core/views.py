
from django.db.models import Avg
from geopy.exc import GeocoderUnavailable, GeocoderTimedOut
from geopy.geocoders import Nominatim
from rest_framework.views import APIView
from django.db.models import Q
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status, filters, views, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from math import radians, cos, sin, asin, sqrt
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from decimal import Decimal
import uuid
from django.http import JsonResponse

from urllib.parse import urlencode
from .models import (
    User, Gig, Credit, Job, Application, Notification, Message, UserSettings, Review, Subject, EscrowPayment,
    Order, Payment, Conversation, Chat, ContactUnlock,
)
from .serializers import (
    UserSerializer, GigSerializer, CreditSerializer, JobSerializer,
    ApplicationSerializer, NotificationSerializer, MessageSerializer, UserSettingsSerializer, ReviewSerializer,
    AbuseReportSerializer, SubjectSerializer, EscrowPaymentSerializer,
    RegisterSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, TutorSerializer, JobListSerializer,
    OrderSerializer, PaymentSerializer, CreditUpdateByUserSerializer,
    ConversationSerializer, ChatSerializer, TeacherProfileSerializer
)

from .payments import SSLCommerzPayment


def generate_transaction_id():
    """Generates a unique transaction ID with a 'TRN-' prefix."""
    return 'TRN-' + str(uuid.uuid4().hex[:20]).upper()

class TeacherProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, tutor_id):
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'detail': 'student_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        tutor = get_object_or_404(User, id=tutor_id, user_type='tutor')
        student = get_object_or_404(User, id=student_id, user_type='student')

        contact_unlocked = ContactUnlock.objects.filter(student=student, tutor=tutor).exists()

        serializer = TeacherProfileSerializer(tutor, context={'contact_unlocked': contact_unlocked})
        return Response(serializer.data)


class MarkNotificationsReadView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, user_id):
        # Mark all unread notifications for this user as read
        updated_count = Notification.objects.filter(to_user_id=user_id, is_read=False).update(is_read=True)
        
        return Response({
            "message": f"{updated_count} notifications marked as read.",
            "read_count": updated_count
        }, status=status.HTTP_200_OK)

class UnreadNotificationsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, user_id):
        unread_notifications = Notification.objects.filter(to_user_id=user_id, is_read=False).order_by('-created_at')
        serializer = NotificationSerializer(unread_notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class NotificationCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSearchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        keyword = request.data.get('keyword', '').strip()
        if not keyword:
            return Response({'error': 'keyword is required'}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(username__icontains=keyword)[:20]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class ConversationListView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        conversations = Conversation.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        serializer = ConversationSerializer(conversations, many=True, context={'current_user_id': int(user_id)})
        return Response(serializer.data)

class ConversationMessagesView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        conversation_id = request.data.get('conversation_id')
        user_id = request.data.get('user_id')  # pass user_id as well

        if not conversation_id or not user_id:
            return Response({'error': 'conversation_id and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        # Mark unread messages as read where sender is NOT the current user
        conversation.chats.filter(is_read=False).exclude(sender_id=user_id).update(is_read=True)

        chats = conversation.chats.all()
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)


class SendMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        sender_id = request.data.get('sender_id')
        receiver_id = request.data.get('receiver_id')
        content = request.data.get('content', '').strip()

        if not all([sender_id, receiver_id, content]):
            return Response({'error': 'sender_id, receiver_id and content are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing conversation or create new one
        conversation = Conversation.objects.filter(
            (Q(user1_id=sender_id) & Q(user2_id=receiver_id)) |
            (Q(user1_id=receiver_id) & Q(user2_id=sender_id))
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(user1_id=sender_id, user2_id=receiver_id)

        chat = Chat.objects.create(conversation=conversation, sender_id=sender_id, content=content)
        serializer = ChatSerializer(chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GigListByTeacherAPIView(generics.ListAPIView):
    serializer_class = GigSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs.get('teacher_id')
        return Gig.objects.filter(teacher_id=teacher_id).order_by('-created_at')

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

            # Fetch all tutors
            tutors = User.objects.filter(user_type='tutor')

            # Create notification with student's username
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

class TutorAverageRating(APIView):
    permission_classes = [AllowAny]

    def get(self, request, tutor_id):
        avg_rating = Review.objects.filter(teacher_id=tutor_id).aggregate(average=Avg('rating'))['average']
        avg_rating = round(avg_rating or 0, 1)
        return Response({"average_rating": avg_rating})

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

class JobListAPIView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.objects.filter(is_active=True).select_related('student').prefetch_related('subjects').order_by('-created_at')

class JobDetailAPIView(generics.RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

class TutorListAPIView(generics.ListAPIView):
    queryset = User.objects.filter(user_type='tutor')
    serializer_class = TutorSerializer
    permission_classes = [AllowAny]
# --- UserViewSet ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['register', 'search']:
            return []
        return super().get_permissions()

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
            Credit.objects.create(user=user, balance=100)
            Notification.objects.create(
                user=user,
                message="🎉 Welcome! You have received 100 free credits to get started."
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

    @action(detail=True, methods=['post'])
    def unlock_profile(self, request, pk=None):
        user = self.get_object()
        requesting_user = request.user
        if requesting_user.user_type != 'student':
            return Response({'error': 'Only students can unlock profiles'}, status=403)
        credit = Credit.objects.filter(user=requesting_user).first()
        if not credit or credit.balance < 1:
            return Response({'error': 'Insufficient credits'}, status=403)
        credit.balance -= 1
        credit.save()
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
    permission_classes = [AllowAny]  # no auth required
    def get(self, request, user_id):
        credit = get_object_or_404(Credit, user__id=user_id)
        return Response({
            "user_id": user_id,
            "balance": credit.balance
        }, status=status.HTTP_200_OK)

class CreditUpdateByUserPostView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = CreditUpdateByUserSerializer(data=request.data)
        if serializer.is_valid():
            credit = serializer.validated_data['credit']
            credit.balance = serializer.validated_data['new_balance']
            credit.save()
            return Response({
                "user_id": credit.user.id,
                "new_balance": credit.balance
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

def haversine(lon1, lat1, lon2, lat2):
    # Calculate the great circle distance between two points on the earth (specified in decimal degrees)
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    km = 6371 * c
    return km

class TutorSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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

        tutors = User.objects.filter(user_type="tutor").exclude(location__isnull=True).exclude(location__exact="")

        matched_tutors = []

        for tutor in tutors:
            try:
                # Filter gigs by subject to ensure tutor is relevant
                gigs_qs = Gig.objects.filter(teacher=tutor)
                if subject_query:
                    gigs_qs = gigs_qs.filter(subject__icontains=subject_query)

                if gigs_qs.count() == 0:
                    continue  # Skip if no matching gigs

                # Get credit count for tutor (adjust field name as per your model)
                credit_count = getattr(tutor, "credit_count", 0)

                # Optionally calculate distance
                distance_km = None
                if input_lat is not None and input_lon is not None:
                    tutor_loc = geolocator.geocode(tutor.location)
                    if tutor_loc:
                        tutor_lat, tutor_lon = tutor_loc.latitude, tutor_loc.longitude
                        distance_km = haversine(input_lon, input_lat, tutor_lon, tutor_lat)

                matched_tutors.append((tutor, credit_count, distance_km))

            except Exception:
                continue

        # Sort by credit_count descending
        matched_tutors.sort(key=lambda x: x[1], reverse=True)

        combined_tutors = [t[0] for t in matched_tutors]

        serializer = UserSerializer(combined_tutors, many=True)

        return Response({
            "count": len(combined_tutors),
            "results": serializer.data
        })

# --- GigViewSet ---
class GigViewSet(viewsets.ModelViewSet):
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'subject', 'location']

    def get_queryset(self):
        queryset = Gig.objects.filter(teacher__user_type='teacher')
        premium_only = self.request.query_params.get('premium_only')
        premium_first = self.request.query_params.get('premium_first')
        if premium_only == '1':
            queryset = queryset.filter(teacher__usersettings__is_premium=True)
        else:
            if premium_first == '1':
                from django.db import models
                queryset = queryset.annotate(
                    premium_sort=models.Case(
                        models.When(teacher__usersettings__is_premium=True, then=0),
                        default=1,
                        output_field=models.IntegerField(),
                    )
                ).order_by('premium_sort', '-created_at')
        subject = self.request.query_params.get('subject')
        location = self.request.query_params.get('location')
        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        if location:
            queryset = queryset.filter(location__icontains=location)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius_km = float(self.request.query_params.get('radius_km', 20))
        if lat and lng:
            lat, lng = float(lat), float(lng)
            results = []
            for gig in queryset:
                if hasattr(gig, 'latitude') and hasattr(gig, 'longitude') and gig.latitude and gig.longitude:
                    distance = haversine(lat, lng, gig.latitude, gig.longitude)
                    if distance <= radius_km:
                        gig._distance = distance
                        results.append(gig)
            results.sort(key=lambda g: getattr(g, '_distance', 0))
            return results
        return queryset

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'teacher':
            return Response({'error': 'Only teachers can create gigs'}, status=status.HTTP_403_FORBIDDEN)
        if Gig.objects.filter(teacher=request.user).count() >= 15:
            return Response({'error': 'Maximum limit of 15 gigs reached'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(teacher=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def unlock_contact(self, request, pk=None):
        gig = self.get_object()
        user = request.user
        if user.user_type != 'student':
            return Response({'error': 'Only students can unlock contact info'}, status=status.HTTP_403_FORBIDDEN)
        credit = Credit.objects.filter(user=user).first()
        if not credit or credit.balance < 1:
            return Response({'error': 'Insufficient credits'}, status=status.HTTP_403_FORBIDDEN)
        already_unlocked = Notification.objects.filter(
            user=user, message__icontains=f"Unlocked contact for gig {gig.id}"
        ).exists()
        if already_unlocked:
            return Response({'contact_info': gig.contact_info})
        credit.balance -= 1
        credit.save()
        Notification.objects.create(user=user, message=f"Unlocked contact for gig {gig.id}")
        return Response({'contact_info': gig.contact_info})

# --- CreditViewSet ---
class CreditViewSet(viewsets.ModelViewSet):
    serializer_class = CreditSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # NOTE: For testing purposes, you might want to mock request.user here
        # if not using actual authentication. For now, it relies on request.user.
        return Credit.objects.filter(user=self.request.user)

    # TEMPORARY: Changed permission_classes to AllowAny for testing without authentication
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def purchase(self, request):
        credits_to_add = int(request.data.get('credits', 0))
        amount = float(request.data.get('amount', 0))

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

        # Use the obtained 'user' object for Order creation
        # All other logic remains the same
        if not credits_to_add or not amount:
            return Response({'error': 'Both credits and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=user, # Use the acquired user object
            total_amount=Decimal(amount),
            is_paid=False
        )

        sslcommerz = SSLCommerzPayment()
        transaction_id = generate_transaction_id()

        payment = Payment.objects.create(
            order=order,
            transaction_id=transaction_id,
            amount=Decimal(amount),
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
            'cus_name': user.get_full_name() or user.username, # Use the acquired user object
            'cus_email': user.email, # Use the acquired user object
            'value_a': str(user.id),
            'value_b': str(credits_to_add),
            'value_c': str(order.id),
            'product_name': f"Credits purchase for {credits_to_add}",
            'product_category': 'Digital Goods',
            'product_profile': 'general',
            'shipping_method': 'NO',
            'num_of_item': 1,
        }

        response_data = sslcommerz.initiate_payment(payment_data)

        if response_data and response_data.get('status') == 'SUCCESS':
            payment.bank_transaction_id = response_data.get('tran_id')
            payment.save()

            return Response({
                'status': 'SUCCESS',
                'payment_url': response_data.get('GatewayPageURL'),
                'sessionkey': response_data.get('sessionkey'),
                'transaction_id': transaction_id
            })
        else:
            error_message = response_data.get('failedreason', 'Unknown error initiating payment.')
            payment.status = 'FAILED'
            payment.error_message = error_message
            payment.save()
            return Response({
                'status': 'FAILED',
                'error': error_message
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        recipient_id = request.data.get('recipient_id')
        amount = request.data.get('amount')
        try:
            recipient = User.objects.get(id=recipient_id)
            sender_credit = Credit.objects.get(user=request.user)
            recipient_credit, created = Credit.objects.get_or_create(user=recipient)
            if sender_credit.balance < amount:
                return Response({'error': 'Insufficient credits'}, status=status.HTTP_400_BAD_REQUEST)
            sender_credit.balance -= amount
            recipient_credit.balance += amount
            sender_credit.save()
            recipient_credit.save()
            return Response({'message': 'Credits transferred successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)

# --- JobViewSet ---
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'subject', 'location']

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
        job = serializer.save(student=self.request.user)
        teachers = User.objects.filter(user_type='teacher')
        for teacher in teachers:
            if teacher.email:
                send_mail(
                    'New Job Posted',
                    f'A new job matching your profile has been posted: {job.title}',
                    'from@example.com',
                    [teacher.email],
                    fail_silently=True,
                )

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
            credit = Credit.objects.get(user=user)
        except Credit.DoesNotExist:
            credit = Credit.objects.create(user=user)
        if credit.balance < 1:
            return Response(
                {'error': 'Insufficient credits to apply'},
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
        credit.balance -= 1
        credit.save()
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        notification = serializer.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notifications_{notification.user.id}",
            {
                "type": "send_notification",
                "message": notification.message
            }
        )

# --- MessageViewSet ---
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user))

    def create(self, request, *args, **kwargs):
        if request.user.user_type == 'student':
            try:
                credit = Credit.objects.get(user=request.user)
            except Credit.DoesNotExist:
                return Response({'error': 'You must buy credits to message tutors.'}, status=status.HTTP_403_FORBIDDEN)
            if credit.balance < 1:
                return Response({'error': 'Insufficient credits. Buy credits to unlock messaging.'}, status=status.HTTP_403_FORBIDDEN)
            credit.balance -= 1
            credit.save()
        receiver_id = request.data.get('receiver')
        content = request.data.get('content')
        if not receiver_id or not content:
            return Response(
                {'error': 'Both receiver and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Receiver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=content
        )
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
from core.utils import update_trust_score
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
        credit_obj, _ = Credit.objects.get_or_create(user=user)
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

    tran_id = data.get('tran_id')
    val_id = data.get('val_id')
    user_id_str = data.get('value_a')
    payment_type = data.get('value_b')
    order_id_str = data.get('value_c')

    if not tran_id or not val_id:
        query = urlencode({'tran_id': tran_id or '', 'reason': 'Missing transaction or validation ID'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    try:
        order = Order.objects.get(id=order_id_str)
        payment = Payment.objects.get(order=order, transaction_id=tran_id)
        user = order.user
    except (Order.DoesNotExist, Payment.DoesNotExist, User.DoesNotExist):
        query = urlencode({'tran_id': tran_id, 'reason': 'Order or payment not found'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")
    except Exception as e:
        print(f"Unexpected error retrieving records: {e}")
        query = urlencode({'tran_id': tran_id, 'reason': 'Unexpected error occurred'})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")

    sslcommerz = SSLCommerzPayment()
    validation_response = sslcommerz.validate_transaction(val_id)

    if validation_response and validation_response.get('status') == 'VALID':
        validated_amount = Decimal(validation_response.get('amount', '0.00'))
        validated_currency = validation_response.get('currency', '')

        if payment.status in ['PENDING', 'FAILED']:
            if validated_amount == payment.amount and validated_currency == payment.currency:
                # Mark payment success
                payment.status = 'SUCCESS'
                payment.bank_transaction_id = validation_response.get('bank_tran_id', payment.bank_transaction_id)
                payment.validation_status = 'VALIDATED'
                payment.save()

                order.is_paid = True
                order.save()

                if payment_type == 'credit_purchase':
                    credits_to_add = int(data.get('value_b', 0))
                    credit_obj, _ = Credit.objects.get_or_create(user=user)
                    credit_obj.balance += credits_to_add
                    credit_obj.save()
                    Notification.objects.create(
                        user=user,
                        message=f"💰 Your purchase of {credits_to_add} credits was successful! New balance: {credit_obj.balance}"
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
                        message=f"✨ Premium upgraded! Expires on {user_settings.premium_expires.strftime('%Y-%m-%d')}."
                    )

                # Redirect to frontend with details
                query = urlencode({
                    'tran_id': tran_id,
                    'val_id': val_id,
                    'amount': str(validated_amount),
                    'status': 'SUCCESS',
                    'credit': payment_type,
                })
                update_user_credit(int(user_id_str), int(payment_type))
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
                'credit': payment_type,
            })
            print(query)
            print("\n")
            print(user_id)
            return redirect(f"{settings.FRONTEND_SITE_URL}/payments/success?{query}")
    else:
        # Validation failed
        error_message = validation_response.get('failedreason', 'Payment validation failed.')
        if payment.status == 'PENDING':
            payment.status = 'FAILED'
            payment.validation_status = 'NOT_VALIDATED'
            payment.error_message = error_message
            payment.save()
        query = urlencode({'tran_id': tran_id, 'reason': error_message})
        return redirect(f"{settings.FRONTEND_SITE_URL}/payments/fail?{query}")


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
                    credit_obj, _ = Credit.objects.get_or_create(user=user)
                    credit_obj.balance += credits_to_add
                    credit_obj.save()
                    Notification.objects.create(
                        user=user,
                        message=f"💰 Your purchase of {credits_to_add} credits was confirmed (IPN)! Your new balance is {credit_obj.balance}."
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

UserModel = get_user_model()

class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Registered successfully. Please check your email to verify your account.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile_view(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class CheckUnlockStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        student_id = request.query_params.get('student_id')
        tutor_id = request.query_params.get('tutor_id')

        if not student_id or not tutor_id:
            return Response({'error': 'Missing student_id or tutor_id'}, status=400)

        unlocked = ContactUnlock.objects.filter(student_id=student_id, tutor_id=tutor_id).exists()
        return Response({'unlocked': unlocked})

class UnlockContactInfoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        student_id = request.data.get('student_id')
        tutor_id = request.data.get('tutor_id')

        try:
            student = User.objects.get(id=student_id, user_type='student')
            tutor = User.objects.get(id=tutor_id, user_type='tutor')
        except User.DoesNotExist:
            return Response({'error': 'Invalid student or tutor ID'}, status=400)

        if ContactUnlock.objects.filter(student=student, tutor=tutor).exists():
            return Response({
                'detail': 'Already unlocked.',
                'phone': str(tutor.phone_number) if tutor.phone_number else None,
                'email': tutor.email
            })

        credit = Credit.objects.filter(user=student).first()
        if not credit or credit.balance < 1:
            return Response({'error': 'Not enough credits.'}, status=402)

        # Deduct 1 credit
        credit.balance -= 1
        credit.save()

        # Record unlock
        ContactUnlock.objects.create(student=student, tutor=tutor)

        # 🔔 Create notification for the tutor
        Notification.objects.create(
            from_user=student,
            to_user=tutor,
            message=f"{student.username} has unlocked your contact information."
        )

        return Response({
            'detail': 'Contact info unlocked.',
            'phone': str(tutor.phone_number) if tutor.phone_number else None,
            'email': tutor.email
        })


class EmailVerifyView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            return Response({'error': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()

            # Create a credit record linked to this user
            Credit.objects.create(user=user, balance=5)  # or initial amount you want

            return Response({'detail': 'Email verified successfully. You can now log in.'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            if not user.is_active:
                return Response({'error': 'Email not verified.'}, status=400)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'user_type': user.user_type
            })
        return Response({'error': 'Invalid credentials.'}, status=400)

class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = UserModel.objects.get(email=email)
            except UserModel.DoesNotExist:
                return Response({'detail': 'If the email exists, you will get a reset link.'})
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_SITE_URL}/reset-password/{uid}/{token}"
            send_mail(
                "TutorMove Password Reset",
                f"Hi {user.username},\n\nReset your password here: {reset_url}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'detail': 'If the email exists, you will get a reset link.'})
        return Response(serializer.errors, status=400)

class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                uid = force_str(urlsafe_base64_decode(uid))
                user = UserModel.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
                return Response({'error': 'Invalid link.'}, status=400)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'detail': 'Password reset successful.'})
            return Response({'error': 'Invalid or expired token.'}, status=400)
        return Response(serializer.errors, status=400)

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
