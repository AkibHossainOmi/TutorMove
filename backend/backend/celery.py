import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Create Celery app
app = Celery("backend")

# Read config from Django settings, CELERY namespace
app.config_from_object("django.conf:settings", namespace="CELERY")

# Autodiscover tasks from installed apps
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "reset-credits-every-month": {
        "task": "core.tasks.reset_monthly_credits_spend_on_gigs",
        "schedule": crontab(minute=0, hour=0, day_of_month=1),  # 1st day of month at 00:00
    },
}
