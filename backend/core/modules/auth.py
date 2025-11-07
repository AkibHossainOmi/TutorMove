import random
import threading
import time
from django.core.cache import cache
from django.core.mail import send_mail, EmailMultiAlternatives
from rest_framework import status, views, serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.db import transaction
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from rest_framework import views
from ..serializers import (
    RegisterSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, UserTokenSerializer
)
from ..models import Credit

UserModel = get_user_model()


# --- Reusable OTP utils ---

def generate_otp():
    return random.randint(100000, 999999)

def set_otp(email, purpose="register", user_data=None, timeout=300, throttle_seconds=300):
    """
    Stores OTP in cache and prevents sending too frequently.
    Returns tuple: (otp, is_throttled)
    """
    key = f"otp:{purpose}:{email}"
    existing = cache.get(key)

    now_ts = int(time.time())
    if existing and "last_sent" in existing:
        elapsed = now_ts - existing["last_sent"]
        if elapsed < throttle_seconds:
            return existing["otp"], True

    otp = generate_otp()
    value = {"otp": otp, "last_sent": now_ts, "attempts": 0}  # initialize attempts
    if user_data:
        value["user_data"] = user_data

    cache.set(key, value, timeout=timeout)
    return otp, False


def get_otp(email, purpose="register"):
    key = f"otp:{purpose}:{email}"
    return cache.get(key)

def delete_otp(email, purpose="register"):
    key = f"otp:{purpose}:{email}"
    cache.delete(key)

def send_otp_email(email, otp, purpose="register"):
    subject = "Your TutorMove OTP"
    action_text = "register your account"
    if purpose == "password-reset":
        subject = "Reset your TutorMove password"
        action_text = "reset your password"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
          <h2 style="color: #111827;">Your OTP Code</h2>
          <p style="font-size: 16px; color: #374151;">
            Use this OTP to {action_text}. It expires in 5 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 18px;">{otp}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">If you did not request this, ignore this email.</p>
        </div>
      </body>
    </html>
    """
    text_content = f"Your OTP is {otp}. It expires in 5 minutes."

    def send_email():
        msg = EmailMultiAlternatives(subject=subject, body=text_content,
                                     from_email=settings.DEFAULT_FROM_EMAIL, to=[email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    threading.Thread(target=send_email).start()

# --- API Views ---

class SendOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        purpose = request.data.get("purpose", "register")
        user_data = request.data.get("user_data")  # optional for signup

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check email existence
        if purpose == "register":
            if UserModel.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email is already registered."},
                    status=status.HTTP_409_CONFLICT
                )
        elif purpose == "password-reset":
            if not UserModel.objects.filter(email=email).exists():
                return Response({"error": "Email not found."},
                                status=status.HTTP_404_NOT_FOUND)

        otp, throttled = set_otp(email, purpose=purpose, user_data=user_data)
        if throttled:
            return Response({"error": "Please wait a moment before trying again."},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        send_otp_email(email, otp, purpose=purpose)
        return Response({"detail": f"OTP sent for {purpose}"}, status=status.HTTP_200_OK)


class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        purpose = request.data.get("purpose", "register")

        if not all([email, otp]):
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        key = f"otp:{purpose}:{email}"
        cached = get_otp(email, purpose=purpose)

        if not cached:
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Increment attempts
        cached["attempts"] = cached.get("attempts", 0) + 1
        cache.set(key, cached, timeout=300)  # refresh cache timeout

        if cached["attempts"] > 3:
            delete_otp(email, purpose)
            return Response({"error": "Too many failed attempts. OTP invalidated."},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        if str(cached["otp"]) != str(otp):
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP correct
        if purpose == "register":
            serializer = RegisterSerializer(data=cached.get("user_data"))
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    Credit.objects.get_or_create(user=user, defaults={"balance": 5})
                delete_otp(email, purpose)
                return Response({"detail": "Registration complete"}, status=status.HTTP_201_CREATED)

        delete_otp(email, purpose)
        return Response({"detail": f"OTP verified for {purpose}"}, status=status.HTTP_200_OK)


class ResetPasswordView(views.APIView):
    permission_classes = [AllowAny]

    MAX_ATTEMPTS = 3  # maximum OTP attempts

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")
        if not all([email, otp, new_password]):
            return Response(
                {"error": "Email, OTP, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cached = get_otp(email, purpose="password-reset")
        if not cached:
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize attempts if not present
        attempts = cached.get("attempts", 0)

        # Check OTP
        if str(cached["otp"]) != str(otp):
            attempts += 1
            # Save updated attempts
            cache.set(f"otp:password-reset:{email}", {**cached, "attempts": attempts}, timeout=300)
            if attempts >= self.MAX_ATTEMPTS:
                return Response(
                    {"error": "Maximum attempts reached. Please request a new OTP."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            return Response(
                {"error": f"Invalid OTP. You have {self.MAX_ATTEMPTS - attempts} attempts left."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP correct, reset password
        try:
            user = UserModel.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            delete_otp(email, purpose="password-reset")
            return Response({"detail": "Password reset successfully"}, status=status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = UserTokenSerializer

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh = response.data.get('refresh')
            access = response.data.get('access')

            # Use configurable settings
            cookie_settings = settings.JWT_COOKIE
            response.set_cookie(
                key=cookie_settings['REFRESH_TOKEN_NAME'],
                value=refresh,
                httponly=cookie_settings['HTTPONLY'],
                secure=cookie_settings['SECURE'],
                samesite=cookie_settings['SAMESITE'],
                max_age=cookie_settings['MAX_AGE'],
                path=cookie_settings['PATH']
            )

            # Remove refresh from body
            response.data.pop('refresh')
            response.data['access'] = access
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'Refresh token cookie not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)

        access = serializer.validated_data['access']
        return Response({'access': access})