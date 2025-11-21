from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from core.models import User
from core.models import Gig

@shared_task
def send_job_email(email, html_content, text_content):
    msg = EmailMultiAlternatives(
        subject="New Job Matching Your Gig",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()


@shared_task
def expire_single_user_premium(user_id):
    try:
        user = User.objects.get(id=user_id)
        if user.is_premium and user.premium_expires <= timezone.now():
            user.is_premium = False
            user.premium_expires = None
            user.save(update_fields=['is_premium', 'premium_expires'])
    except User.DoesNotExist:
        pass

@shared_task
def reset_monthly_credits_spend_on_gigs():
    """
    Reset used_credits to 0 for all gigs.
    Scheduled to run on the 1st day of each month.
    """
    updated_count = Gig.objects.update(used_credits=0)
    print(f"Reset used_credits for {updated_count} gigs.")