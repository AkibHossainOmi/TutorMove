from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Credit

WELCOME_CREDITS = 50

@receiver(post_save, sender=User)
def give_welcome_credits(sender, instance, created, **kwargs):
    if created and instance.user_type == 'student':
        # Only give if not already credited (avoid duplicates)
        credit, created_credit = Credit.objects.get_or_create(user=instance)
        if created_credit or credit.balance == 0:
            credit.balance += WELCOME_CREDITS
            credit.save()