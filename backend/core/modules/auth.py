from django.core.mail import send_mail
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
            serializer.save()
            return Response(
                {'detail': 'Registered successfully. Please check your email to verify your account.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerifyView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            return Response({'error': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_active:
            return Response({'detail': 'Account already verified.'}, status=status.HTTP_200_OK)

        if default_token_generator.check_token(user, token):
            with transaction.atomic():
                user.is_active = True
                user.save()
                Credit.objects.get_or_create(user=user, defaults={'balance': 5})
            return Response({'detail': 'Email verified successfully. You can now log in.'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


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