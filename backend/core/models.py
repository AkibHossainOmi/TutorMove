# backend/core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import re
from phonenumber_field.modelfields import PhoneNumberField
import uuid

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
    is_verified = models.BooleanField(default=False) # Reverted: Original duplicate field
    verification_requested = models.BooleanField(default=False)
    verification_doc = models.FileField(upload_to='verification_docs/', blank=True, null=True)
    verification_requested = models.BooleanField(default=False) # Reverted: Original duplicate field
    is_verified = models.BooleanField(default=False) # Reverted: Original duplicate field


# ADDED: Order and Payment Models (These are new and remain as part of payment integration)
class Order(models.Model):
    """
    Represents an order in your system. This model will hold the total amount
    and link to the user. You should extend this with more specific order
    details like items, quantity, shipping address, etc., as per your application's needs.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="The user who placed the order. Can be null for guest orders."
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The total amount of the order, including tax and shipping."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the order was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the order was last updated."
    )
    is_paid = models.BooleanField(
        default=False,
        help_text="Indicates if the order has been successfully paid for."
    )
    # You can add more fields here relevant to your specific order system
    # e.g., 'items_json', 'shipping_address', 'order_status'

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-created_at'] # Order by most recent by default

    def __str__(self):
        """String representation of the Order."""
        return f"Order {self.id} (User: {self.user.username if self.user else 'Guest'}) - Amount: {self.total_amount} - Paid: {self.is_paid}"

class Payment(models.Model):
    """
    Records a payment transaction associated with an Order.
    This stores details about the payment attempt, its status,
    and references from the payment gateway.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="The order associated with this payment."
    )
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="Your internal unique transaction ID for this payment attempt."
    )
    bank_transaction_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="The transaction ID returned by SSLCommerz (or other payment gateway)."
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The amount processed in this payment transaction."
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('SUCCESS', 'Success'),
            ('FAILED', 'Failed'),
            ('CANCELED', 'Canceled by User'),
            ('VALIDATED', 'Validated by API'), # Payment confirmed via validation API
            ('RISK', 'Risk Payment'), # Flagged as risky by SSLCommerz
        ],
        default='PENDING',
        help_text="Current status of the payment transaction."
    )
    payment_method = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Method used for payment (e.g., 'VISA', 'Mastercard', 'Bkash')."
    )
    currency = models.CharField(
        max_length=10,
        default='BDT', # Default to Bangladeshi Taka, change if your primary currency differs
        help_text="Currency of the payment (e.g., BDT, USD)."
    )
    payment_date = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the payment record was created."
    )
    validation_status = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Detailed validation status from the payment gateway."
    )
    error_message = models.TextField(
        null=True,
        blank=True,
        help_text="Any error message associated with a failed payment."
    )

    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ['-payment_date'] # Order by most recent payment

    def __str__(self):
        """String representation of the Payment."""
        return f"Payment for Order {self.order.id} - Amount: {self.amount} - Status: {self.status}"

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