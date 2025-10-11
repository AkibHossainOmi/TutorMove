from django.utils import timezone
from core.tasks import send_job_email, expire_single_user_premium

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
