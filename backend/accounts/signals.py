from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Point

WELCOME_CREDITS = 50

@receiver(post_save, sender=User)
def give_welcome_credits(sender, instance, created, **kwargs):
    if created and instance.user_type == 'student':
        # Only give if not already credited (avoid duplicates)
        point, created_credit = Point.objects.get_or_create(user=instance)
        if created_credit or point.balance == 0:
            point.balance += WELCOME_CREDITS
            point.save()
