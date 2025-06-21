from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, GigViewSet, CreditViewSet, JobViewSet,
    ApplicationViewSet, NotificationViewSet, MessageViewSet, UserSettingsViewSet,
    ReviewViewSet, PremiumViewSet, EscrowPaymentViewSet, SubjectViewSet, sslcommerz_ipn,
    AdminViewSet,  # Add this import if not already there
    RegisterView, EmailVerifyView, LoginView, PasswordResetRequestView, PasswordResetConfirmView
)

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

urlpatterns = [
    # Custom text search for tutors
    path('tutors/search/', UserViewSet.as_view({'get': 'search'}), name='tutor-search'),

    # Auth & account endpoints (JWT/session-based, email/password)
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/verify-email/<str:uid>/<str:token>/', EmailVerifyView.as_view(), name='email-verify'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # All other API endpoints
    path('', include(router.urls)),

    # SSLCommerz IPN callback
    path('api/payments/sslcommerz-ipn/', sslcommerz_ipn, name='sslcommerz_ipn'),
]
