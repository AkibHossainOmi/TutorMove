from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, GigViewSet, CreditViewSet, JobViewSet,
    ApplicationViewSet, NotificationViewSet, UserSettingsViewSet,
    ReviewViewSet, PremiumViewSet, EscrowPaymentViewSet, SubjectViewSet,
    AdminViewSet, LoginView,
    # ADDED: Import new payment callback views
    payment_success_view, payment_fail_view, payment_cancel_view, send_whatsapp, sslcommerz_ipn, 
    SendOTPView, ResetPasswordView, VerifyOTPView, SubmitReview, ContactUnlockViewSet,
    CookieTokenObtainPairView, CookieTokenRefreshView, credit_purchase, TutorViewSet, StudentViewSet, verify_otp,
    # If you registered PaymentViewSet with router, also import it here:
    # PaymentViewSet,
)

# ADDED: If you uncommented PaymentViewSet, import its serializer:
# from .serializers import PaymentSerializer # Example, adjust as per your serializers.py


router = DefaultRouter()
router.register(r'admin-tools', AdminViewSet, basename='admin-tools')
router.register(r'users', UserViewSet, basename='user')
router.register(r'tutors', TutorViewSet, basename='tutor')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'credits', CreditViewSet, basename='credit')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'gigs', GigViewSet, basename='gig')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'notifications', NotificationViewSet, basename='notification')
# router.register(r'messages', MessageViewSet, basename='message')
router.register(r'settings', UserSettingsViewSet, basename='settings')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'premium', PremiumViewSet, basename='premium')
router.register(r'escrow', EscrowPaymentViewSet, basename='escrow')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'contact-unlock', ContactUnlockViewSet, basename='contact-unlock')
# If you decide to expose a PaymentViewSet, register it here:
# router.register(r'payments', PaymentViewSet, basename='payment')


urlpatterns = [
    # Auth & account endpoints (JWT/session-based, email/password)
    path('auth/register/', SendOTPView.as_view(), name='register'),  # send OTP for signup
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),  # reusable for resend OTP
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),  # verify OTP

    # Password reset
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    # path('profile/', UserProfileView.as_view(), name='user-profile'),
    # path('profile/edit/', UserProfileUpdateByIdView.as_view(), name='user-profile-edit'),
    # path('credit/update/', CreditUpdateByUserPostView.as_view(), name='credit-update-by-user'),
    # path('credit/purchase/', credit_purchase, name='credit_purchase'),
    # path('credit/user/<int:user_id>/', UserCreditBalanceView.as_view(), name='user-credit-balance'),
    # path('users/search/', UserSearchView.as_view(), name='user-search'),
    # path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    # path('conversations/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
    # path('messages/send/', SendMessageView.as_view(), name='send-message'),
    # path('teacher/<int:tutor_id>/', TeacherProfileView.as_view(), name='teacher-profile'),
    path('reviews/', SubmitReview.as_view(), name='submit-review'),
    # All other API endpoints handled by the router
    path('', include(router.urls)),

    # NEW: SSLCommerz payment callback URLs
    # These paths will be under the 'api/' prefix from your main backend/urls.py
    path('payments/success/', payment_success_view, name='payment_success'),
    path('payments/fail/', payment_fail_view, name='payment_fail'),
    path('payments/cancel/', payment_cancel_view, name='payment_cancel'),
    # The IPN URL for server-to-server communication
    path('payments/sslcommerz-ipn/', sslcommerz_ipn, name='sslcommerz_ipn'),
    path("whatsapp/send/", send_whatsapp, name="send_whatsapp"),
    path("whatsapp/verify/", verify_otp, name="verify_otp"),
]
