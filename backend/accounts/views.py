import random
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import User
from core.serializers import SignupSerializer
from django.core.mail import send_mail

@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already in use"}, status=400)
        user = serializer.save()
        otp = f"{random.randint(100000,999999)}"
        user.otp_code = otp
        user.otp_expires = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_mail(
            "Your TutorMove OTP",
            f"Your OTP code is: {otp}",
            "tutormove.com@gmail.com",
            [email]
        )
        return Response({"message": "OTP sent to email"})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def verify_otp(request):
    email = request.data['email']
    otp = request.data['otp']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)
    if user.otp_code == otp and user.otp_expires > timezone.now():
        user.is_active = True
        user.email_verified = True
        user.otp_code = ""
        user.save()
        return Response({"message": "Account verified"})
    else:
        return Response({"error": "Invalid or expired OTP"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_phone_otp(request):
    phone = request.data.get("phone")
    otp = f"{random.randint(100000, 999999)}"
    user = request.user
    user.phone = phone
    user.phone_otp = otp
    user.phone_otp_expires = timezone.now() + timezone.timedelta(minutes=10)
    user.phone_verified = False
    user.save()
    # Demo: print to console. Production: integrate SMS API (e.g., Twilio)
    print(f"Send SMS to {phone}: Your TutorMove verification code: {otp}")
    return Response({"message": "OTP sent to phone"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_phone_otp(request):
    otp = request.data.get("otp")
    user = request.user
    if user.phone_otp == otp and user.phone_otp_expires > timezone.now():
        user.phone_verified = True
        user.phone_otp = ""
        user.save()
        return Response({"message": "Phone verified successfully"})
    return Response({"error": "Invalid or expired OTP"}, status=400)

from django.contrib.auth import authenticate, login

@api_view(['POST'])
def signin(request):
    email = request.data['email']
    password = request.data['password']
    user = authenticate(request, username=email, password=password)
    if user is not None and user.is_active:
        login(request, user)
        return Response({"message": "Login successful"})
    else:
        return Response({"error": "Invalid credentials or not verified"}, status=400)

@api_view(['POST'])
def request_reset(request):
    email = request.data['email']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)
    otp = f"{random.randint(100000,999999)}"
    user.otp_code = otp
    user.otp_expires = timezone.now() + timezone.timedelta(minutes=10)
    user.save()
    send_mail(
        "TutorMove Password Reset OTP",
        f"Your OTP is: {otp}",
        "tutormove.com@gmail.com",
        [email]
    )
    return Response({"message": "Password reset OTP sent"})

@api_view(['POST'])
def reset_password(request):
    email = request.data['email']
    otp = request.data['otp']
    new_password = request.data['new_password']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)
    if user.otp_code == otp and user.otp_expires > timezone.now():
        user.set_password(new_password)
        user.otp_code = ""
        user.save()
        return Response({"message": "Password reset successful"})
    else:
        return Response({"error": "Invalid or expired OTP"}, status=400)
