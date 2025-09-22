import django_rq
from datetime import timedelta, timezone
from core.tasks import expire_single_user_premium

JOB_EMAIL_DELAY = 20 * 60  # 20 minutes in seconds
BATCHES = [1, 2, 3, 4]     # tutors per batch

def schedule_job_emails(tutor_data):
    """
    Schedule emails in batches:
    1 tutor → 0s
    2 tutors → 20min
    3 tutors → 40min
    4 tutors → 60min
    """
    queue = django_rq.get_queue('default')
    sent_count = 0
    delay_seconds = 0

    for batch_size in BATCHES:
        batch = tutor_data[sent_count : sent_count + batch_size]
        for tutor in batch:
            queue.enqueue_in(
                timedelta(seconds=delay_seconds),
                'core.tasks.send_job_email',
                tutor['email'],
                tutor['html_content'],
                tutor['text_content']
            )
        sent_count += batch_size
        delay_seconds += JOB_EMAIL_DELAY
        if sent_count >= len(tutor_data):
            break

# core/utils.py

def update_trust_score(user):
    # Example: penalize if reported, reward if verified
    base = 1.0
    reviews = user.reviews_received.all()
    avg_rating = sum([r.rating for r in reviews]) / reviews.count() if reviews.exists() else 1
    base += (avg_rating - 3) * 0.3  # e.g., 5-star avg = +0.6, 1-star avg = -0.6
    if user.is_verified:
        base += 0.3
    # Add more: e.g., penalize spam reports, reward completed jobs, etc.
    user.trust_score = round(max(0.1, min(base, 2.0)), 2)
    user.save()


def schedule_premium_expiry(user):
    """
    Schedule a one-off task to expire this user's premium exactly when premium_expires.
    """
    if not user.premium_expires:
        return

    delay_seconds = (user.premium_expires - timezone.now()).total_seconds()
    if delay_seconds <= 0:
        # Already expired
        expire_single_user_premium(user.id)
        return

    queue = django_rq.get_queue('default')
    queue.enqueue_in(
        timedelta(seconds=delay_seconds),
        expire_single_user_premium,
        user.id
    )