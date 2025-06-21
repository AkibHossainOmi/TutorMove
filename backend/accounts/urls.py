from django.urls import path
from . import views  # This imports your accounts/views.py file

urlpatterns = [
    path('signup/', views.signup),
    path('verify-otp/', views.verify_otp),
    path('send-phone-otp/', views.send_phone_otp),
    path('verify-phone-otp/', views.verify_phone_otp),
    path('signin/', views.signin),
    path('request-reset/', views.request_reset),
    path('reset-password/', views.reset_password),
]
