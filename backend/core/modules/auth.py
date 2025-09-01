import random
import threading
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

class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = random.randint(100000, 999999)

            # Store registration data + OTP in Redis for 5 minutes
            cache.set(f"register:{email}", {
                'user_data': serializer.validated_data,
                'otp': otp
            }, timeout=5*60)

            # Prepare email sending function
            def send_otp_email():
                html_content = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
                      <h2 style="color: #111827;">Your TutorMove OTP</h2>
                      <p style="font-size: 16px; color: #374151;">
                        Use the following OTP to complete your registration. It expires in 5 minutes.
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 18px;">{otp}</span>
                      </div>
                      <p style="font-size: 14px; color: #6b7280;">If you did not register for TutorMove, you can safely ignore this email.</p>
                    </div>
                  </body>
                </html>
                """
                text_content = f"Your OTP is {otp}. It expires in 5 minutes."

                msg = EmailMultiAlternatives(
                    subject="Your TutorMove OTP",
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email],
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send()

            # Send email in a separate thread
            threading.Thread(target=send_otp_email).start()

            # Immediately return success
            return Response({
                'detail': 'OTP is being sent to email.',
                'email': email
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        cached = cache.get(f"register:{email}")
        if not cached:
            return Response({'error': 'OTP expired or invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        if str(cached['otp']) != str(otp):
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP valid, create user
        user_data = cached['user_data']
        serializer = RegisterSerializer(data=user_data)
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                # Create initial credit
                Credit.objects.get_or_create(user=user, defaults={'balance': 5})

            # Remove from cache
            cache.delete(f"register:{email}")

            return Response({'detail': 'Registration complete.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = UserTokenSerializer


class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = UserModel.objects.get(email=email)
            except UserModel.DoesNotExist:
                # Do not reveal email existence
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

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                uid_decoded = force_str(urlsafe_base64_decode(uid))
                user = UserModel.objects.get(pk=uid_decoded)
            except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
                return Response({'error': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)

            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'detail': 'Password reset successful.'})

            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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