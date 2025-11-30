import logging
from django.utils import timezone
from django.db import transaction
from core.tasks import send_job_email, expire_single_user_premium

logger = logging.getLogger(__name__)

JOB_EMAIL_DELAY = 20 * 60  # 20 minutes in seconds
BATCHES = [1, 2, 3, 4]     # tutors per batch

def schedule_job_emails(tutor_data):
    sent_count = 0
    delay_seconds = 0

    for batch_size in BATCHES:
        batch = tutor_data[sent_count: sent_count + batch_size]
        for tutor in batch:
            send_job_email.apply_async(
                args=[tutor['email'], tutor['html_content'], tutor['text_content']],
                countdown=delay_seconds
            )
            print(f"Scheduled email to {tutor['email']} in {delay_seconds} seconds")
        sent_count += batch_size
        delay_seconds += JOB_EMAIL_DELAY
        if sent_count >= len(tutor_data):
            break


def update_trust_score(user):
    base = 1.0
    reviews = user.reviews_received.all()
    avg_rating = sum([r.rating for r in reviews]) / reviews.count() if reviews.exists() else 1
    base += (avg_rating - 3) * 0.3
    if user.is_verified:
        base += 0.3
    user.trust_score = round(max(0.1, min(base, 2.0)), 2)
    user.save()


def schedule_premium_expiry(user):
    if not user.premium_expires:
        return

    delay_seconds = (user.premium_expires - timezone.now()).total_seconds()
    if delay_seconds <= 0:
        expire_single_user_premium.apply_async(args=[user.id])
        return

    expire_single_user_premium.apply_async(args=[user.id], countdown=delay_seconds)
    print(f"Scheduled premium expiry for user {user.id} in {delay_seconds} seconds")

def process_referral_bonus(user, amount_credits):
    """
    Process referral bonus for the user's referrer.
    Ensures the bonus is awarded only once (idempotent).
    """
    if not user.referred_by:
        return

    # Use select_for_update to lock the user row and prevent race conditions
    with transaction.atomic():
        user_locked = type(user).objects.select_for_update().get(id=user.id)
        if user_locked.referral_bonus_awarded:
            return

        bonus_amount = int(amount_credits * 0.10)
        if bonus_amount > 0:
            from core.models import Credit, Notification  # avoid circular import
            try:
                referrer_credit, _ = Credit.objects.select_for_update().get_or_create(user=user.referred_by)
                referrer_credit.balance += bonus_amount
                referrer_credit.save(update_fields=['balance'])

                Notification.objects.create(
                    from_user=user,
                    to_user=user.referred_by,
                    message=f"You earned {bonus_amount} bonus coins from {user.username}'s first purchase!"
                )

                # Mark as awarded
                user_locked.referral_bonus_awarded = True
                user_locked.save(update_fields=['referral_bonus_awarded'])

            except Exception as e:
                logger.error(f"Error processing referral bonus: {e}")
