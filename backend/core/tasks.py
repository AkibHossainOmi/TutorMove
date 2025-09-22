from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_job_email(email, html_content, text_content):
    """
    Send single job email
    """
    msg = EmailMultiAlternatives(
        subject="New Job Matching Your Gig",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

from django.utils import timezone
from core.models import User

def expire_single_user_premium(user_id):
    """
    Expire a user's premium exactly at premium_expires.
    """
    try:
        user = User.objects.get(id=user_id)
        if user.is_premium and user.premium_expires <= timezone.now():
            user.is_premium = False
            user.premium_expires = None
            user.save(update_fields=['is_premium', 'premium_expires'])
    except User.DoesNotExist:
        pass