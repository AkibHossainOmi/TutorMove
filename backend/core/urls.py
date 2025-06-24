from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, GigViewSet, CreditViewSet, JobViewSet,
    ApplicationViewSet, NotificationViewSet, MessageViewSet, UserSettingsViewSet,
    ReviewViewSet, PremiumViewSet, EscrowPaymentViewSet, SubjectViewSet,
    AdminViewSet,
    RegisterView, EmailVerifyView, LoginView, PasswordResetRequestView, PasswordResetConfirmView,
    # ADDED: Import new payment callback views
    payment_success_view, payment_fail_view, payment_cancel_view, sslcommerz_ipn, UserProfileView, UserProfileUpdateByIdView,
    TutorSearchAPIView, JobCreateAPIView, JobDetailAPIView,
    # If you registered PaymentViewSet with router, also import it here:
    # PaymentViewSet,
)
from .views import TutorListAPIView
from .views import JobListAPIView
# ADDED: If you uncommented PaymentViewSet, import its serializer:
# from .serializers import PaymentSerializer # Example, adjust as per your serializers.py


router = DefaultRouter()
router.register(r'admin-tools', AdminViewSet, basename='admin-tools')
router.register(r'users', UserViewSet, basename='user')
router.register(r'tutors', GigViewSet, basename='tutor')
router.register(r'credits', CreditViewSet, basename='credit')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'settings', UserSettingsViewSet, basename='settings')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'premium', PremiumViewSet, basename='premium')
router.register(r'escrow', EscrowPaymentViewSet, basename='escrow')
router.register(r'subjects', SubjectViewSet, basename='subject')
# If you decide to expose a PaymentViewSet, register it here:
# router.register(r'payments', PaymentViewSet, basename='payment')


urlpatterns = [
    # Custom text search for tutors
    path('tutors/search/', UserViewSet.as_view({'get': 'search'}), name='tutor-search'),
    path('tutors/', TutorListAPIView.as_view(), name='tutor-list'),
    path('jobs/', JobListAPIView.as_view(), name='job-list'),
    path('search-tutors/', TutorSearchAPIView.as_view(), name='search-tutors'),

    # Auth & account endpoints (JWT/session-based, email/password)
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/verify-email/<str:uid>/<str:token>/', EmailVerifyView.as_view(), name='email-verify'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/edit/', UserProfileUpdateByIdView.as_view(), name='user-profile-edit'),
    path('jobs/create', JobCreateAPIView.as_view(), name='job-create'),
    path('jobs/<int:pk>/', JobDetailAPIView.as_view(), name='job-detail'),
    # All other API endpoints handled by the router
    path('', include(router.urls)),

    # NEW: SSLCommerz payment callback URLs
    # These paths will be under the 'api/' prefix from your main backend/urls.py
    path('payments/success/', payment_success_view, name='payment_success'),
    path('payments/fail/', payment_fail_view, name='payment_fail'),
    path('payments/cancel/', payment_cancel_view, name='payment_cancel'),
    # The IPN URL for server-to-server communication
    path('payments/sslcommerz-ipn/', sslcommerz_ipn, name='sslcommerz_ipn'),
]
