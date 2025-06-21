from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import re
from phonenumber_field.modelfields import PhoneNumberField
# from django.contrib.gis.db import models as geomodels
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ("student", "Student"),
        ("tutor", "Tutor"),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default="student")
    email_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires = models.DateTimeField(blank=True, null=True)
    credit_balance = models.IntegerField(default=0)
    phone = PhoneNumberField(blank=True, null=True, unique=True)
    phone_verified = models.BooleanField(default=False)
    phone_otp = models.CharField(max_length=6, blank=True, null=True)
    phone_otp_expires = models.DateTimeField(blank=True, null=True)
    trust_score = models.FloatField(default=1.0)
    is_verified = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_requested = models.BooleanField(default=False)
    verification_doc = models.FileField(upload_to='verification_docs/', blank=True, null=True)
    verification_requested = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)




# core/models.py

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    aliases = models.CharField(max_length=255, blank=True, help_text="Comma-separated list of alternate names")
    is_active = models.BooleanField(default=True)

    def alias_list(self):
        return [a.strip() for a in self.aliases.split(',') if a.strip()]

    def __str__(self):
        return self.name


class Gig(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'teacher'})
    title = models.CharField(max_length=255)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    subjects = models.ManyToManyField('Subject', related_name='gigs_as_gig')
    created_at = models.DateTimeField(auto_now_add=True)
    contact_info = models.TextField(blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.contact_info:
            self.contact_info = re.sub(r'[\w\.-]+@[\w\.-]+', '[hidden email]', self.contact_info)
            self.contact_info = re.sub(r'\b\d{10,}\b', '[hidden phone]', self.contact_info)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} by {self.teacher.username}"

class Credit(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.IntegerField(default=0)
    auto_renew = models.BooleanField(default=False)
    last_renewed = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.balance} credits"

class Job(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    title = models.CharField(max_length=255)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    subjects = models.ManyToManyField('Subject', related_name='gigs_as_job')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} by {self.student.username}"

class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'teacher'})
    applied_at = models.DateTimeField(auto_now_add=True)
    is_premium = models.BooleanField(default=False)
    countdown_end = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Application by {self.teacher.username} for {self.job.title}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {'Read' if self.is_read else 'Unread'}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    profile_visibility = models.BooleanField(default=True)
    search_visibility = models.BooleanField(default=True)
    profile_deactivated = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    premium_expires = models.DateTimeField(null=True, blank=True)
    job_notifications = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings for {self.user.username}"

class Review(models.Model):
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'teacher', 'job')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.student.username} for {self.teacher.username}"

    def save(self, *args, **kwargs):
        if self.job and not self.is_verified:
            completed_application = Application.objects.filter(
                job=self.job,
                teacher=self.teacher,
                status='completed'
            ).exists()
            if completed_application:
                self.is_verified = True
        super().save(*args, **kwargs)

class EscrowPayment(models.Model):
    student = models.ForeignKey(User, related_name='escrow_student', on_delete=models.CASCADE)
    tutor = models.ForeignKey(User, related_name='escrow_tutor', on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_released = models.BooleanField(default=False)
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Escrow: {self.student}→{self.tutor} | {self.amount}'



from django.conf import settings

class AbuseReport(models.Model):
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='abuse_reports')
    # add other fields as needed
    description = models.TextField()
    target_type = models.CharField(max_length=50)
    target_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)