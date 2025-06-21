from django.db.models import Q
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status, filters, views
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

from .models import User, Gig, Credit, Job, Application, Notification, Message, UserSettings, Review, Subject, EscrowPayment
from .serializers import (
    UserSerializer, GigSerializer, CreditSerializer, JobSerializer,
    ApplicationSerializer, NotificationSerializer, MessageSerializer, UserSettingsSerializer, ReviewSerializer,
    AbuseReportSerializer, SubjectSerializer, EscrowPaymentSerializer,
    RegisterSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)

from .payments import SSLCommerzPayment

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
def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    km = 6371 * c
    return km

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
from uuid import uuid4
class CreditViewSet(viewsets.ModelViewSet):
    serializer_class = CreditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Credit.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def purchase(self, request):
        credits = int(request.data.get('credits', 0))
        amount = float(request.data.get('amount', 0))
        if not credits or not amount:
            return Response({'error': 'Both credits and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)
        sslcommerz = SSLCommerzPayment(
            store_id="tutor68298baf61ba2",
            store_password="tutor68298baf61ba2@ssl"
        )
        transaction_id = f"CREDIT_{request.user.id}_{uuid4()}"
        payment_data = {
            'total_amount': amount,
            'currency': "BDT",
            'tran_id': transaction_id,
            'success_url': "http://localhost:3000/credit-purchase?success=1",
            'fail_url': "http://localhost:3000/credit-purchase?success=0",
            'cancel_url': "http://localhost:3000/credit-purchase?success=0",
            'ipn_url': "http://localhost:8000/api/payments/sslcommerz-ipn/",
            'cus_name': request.user.get_full_name() or request.user.username,
            'cus_email': request.user.email,
            'value_a': str(request.user.id),
            'value_b': str(credits),
        }
        response = sslcommerz.initiate_payment(payment_data)
        if response.get('status') == 'SUCCESS':
            return Response({
                'status': 'SUCCESS',
                'payment_url': response.get('GatewayPageURL'),
                'sessionkey': response.get('sessionkey'),
                'transaction_id': transaction_id
            })
        else:
            return Response({
                'status': 'FAILED',
                'error': response.get('failedreason', 'Payment initiation failed')
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
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        user_settings = UserSettings.objects.get(user=request.user)
        return Response({
            'is_premium': user_settings.is_premium,
            'premium_expires': user_settings.premium_expires,
            'features': self.get_premium_features()
        })

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        user_settings = UserSettings.objects.get(user=request.user)
        plan = request.data.get('plan')
        sslcommerz = SSLCommerzPayment(
            store_id="tutor68298baf61ba2",
            store_password="tutor68298baf61ba2@ssl"
        )
        payment_data = {
            'total_amount': self.get_plan_price(plan),
            'currency': "BDT",
            'tran_id': f"PREMIUM_{request.user.id}_{timezone.now().timestamp()}",
            'success_url': "http://localhost:3000/premium/payment/success/",
            'fail_url': "http://localhost:3000/premium/payment/fail/",
            'cancel_url': "http://localhost:3000/premium/payment/cancel/",
            'cus_name': request.user.get_full_name(),
            'cus_email': request.user.email,
        }
        response = sslcommerz.initiate_payment(payment_data)
        return Response(response)

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
            'monthly': 1000,
            'yearly': 10000
        }
        return prices.get(plan, 1000)

# --- SubjectViewSet ---
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]
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
    permission_classes = [permissions.IsAuthenticated]

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
        commission_pct = 0.10
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

# --- SSLCommerz IPN ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def sslcommerz_ipn(request):
    from .payments import SSLCommerzPayment
    val_id = request.data.get('val_id')
    tran_id = request.data.get('tran_id')
    value_a = request.data.get('value_a')  # user_id
    value_b = request.data.get('value_b')  # credits (for credit purchase)
    payment = SSLCommerzPayment()
    result = payment.validate_transaction(val_id)
    if result.get('status') == 'VALID' and value_a:
        from .models import User, Credit, UserSettings
        try:
            user = User.objects.get(id=value_a)
        except User.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=400)
        if tran_id and tran_id.startswith('CREDIT_'):
            credits = int(value_b) if value_b else 0
            credit_obj, _ = Credit.objects.get_or_create(user=user)
            credit_obj.balance += credits
            credit_obj.save()
        elif tran_id and tran_id.startswith('PREMIUM_'):
            settings, _ = UserSettings.objects.get_or_create(user=user)
            now = timezone.now()
            if not settings.premium_expires or settings.premium_expires < now:
                settings.premium_expires = now + timedelta(days=30)
            else:
                settings.premium_expires += timedelta(days=30)
            settings.is_premium = True
            settings.save()
        return Response({'status': 'success'})
    return Response({'status': 'failed'}, status=400)

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
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_url = f"{settings.FRONTEND_SITE_URL}/verify-email/{uid}/{token}"
            send_mail(
                "Verify your TutorMove account",
                f"Hi {user.username},\n\nPlease verify your email:\n{verify_url}\n\nThank you!",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'detail': 'Registered. Please check your email to verify.'}, status=201)
        return Response(serializer.errors, status=400)

class EmailVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uid, token):
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            return Response({'error': 'Invalid link.'}, status=400)
        if user and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'detail': 'Email verified! You may now log in.'})
        return Response({'error': 'Invalid or expired link.'}, status=400)

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]

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

