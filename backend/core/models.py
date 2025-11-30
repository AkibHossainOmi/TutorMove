# backend/core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import F
from django.utils import timezone
import re
from phonenumber_field.modelfields import PhoneNumberField
import uuid

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ("student", "Student"),
        ("tutor", "Tutor"),
        ("admin", "Admin"),
        ("moderator", "Moderator"),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default="student")
    email_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires = models.DateTimeField(blank=True, null=True)
    credit_balance = models.IntegerField(default=5)
    phone_number = PhoneNumberField(blank=True, null=True, unique=True)
    phone = PhoneNumberField(blank=True, null=True, unique=True)
    phone_verified = models.BooleanField(default=False)
    phone_otp = models.CharField(max_length=6, blank=True, null=True)
    phone_otp_expires = models.DateTimeField(blank=True, null=True)
    trust_score = models.FloatField(default=1.0)
    is_verified = models.BooleanField(default=False)
    verification_requested = models.BooleanField(default=False)
    verification_doc = models.FileField(upload_to='verification_docs/', blank=True, null=True)
    verification_requested = models.BooleanField(default=False) # Reverted: Original duplicate field
    is_premium = models.BooleanField(default=False) # Reverted: Original duplicate field
    location = models.CharField(max_length=255, blank=True, null=True, help_text="e.g., City, Country or Region")
    bio = models.TextField(blank=True, null=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    experience = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    subjects = models.JSONField(default=list, blank=True)
    jobcount = models.PositiveIntegerField(default=0)
    premium_expires = models.DateTimeField(blank=True, null=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    referral_bonus_awarded = models.BooleanField(default=False)

    def has_premium(self):
        """Check if user currently has active premium."""
        if self.is_premium and self.premium_expires:
            return self.premium_expires >= timezone.now()
        return False

class ContactUnlock(models.Model):
    unlocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contacts_unlocked")
    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name="unlocked_by")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("unlocker", "target")

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
    is_active = models.BooleanField(default=False)

    def alias_list(self):
        return [a.strip() for a in self.aliases.split(',') if a.strip()]

    def __str__(self):
        return self.name


# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Gig(models.Model):
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gigs')
    subject = models.CharField(max_length=255, default='')
    title = models.CharField(max_length=255, default='')  # default empty string
    description = models.TextField(default='')            # default empty string
    message = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    education = models.CharField(max_length=255, blank=True, null=True)
    experience = models.CharField(max_length=255, blank=True, null=True)

    fee_details = models.TextField(default='')            # default empty string
    used_credits = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.tutor.username}"

class Credit(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.IntegerField(default=0)
    auto_renew = models.BooleanField(default=False)
    last_renewed = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.balance} credits"

class Job(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('Tutoring', 'Tutoring'),
        ('Assignment Help', 'Assignment Help'),
    ]

    BUDGET_TYPE_CHOICES = [
        ('Fixed', 'Fixed'),
        ('Per Hour', 'Per Hour'),
        ('Per Month', 'Per Month'),
        ('Per Week', 'Per Week'),
        ('Per Year', 'Per Year'),
    ]

    GENDER_PREFERENCE_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Any', 'Any'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs_posted')

    location = models.CharField(max_length=255, default='Unknown')
    phone = models.CharField(max_length=30, default='N/A')
    description = models.TextField(default='')

    subjects = models.ManyToManyField('Subject', related_name='jobs')

    languages = models.JSONField(default=list, blank=True)
    mode = models.JSONField(default=list, blank=True)

    education_level = models.CharField(
        max_length=50,
        choices=[
            ('Primary', 'Primary'),
            ('Secondary', 'Secondary'),
            ('Higher Secondary', 'Higher Secondary'),
            ('Bachelor', 'Bachelor'),
            ('Masters', 'Masters'),
            ('PhD', 'PhD'),
        ],
        default='Primary',  # Default value here
    )

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("Assigned", "Assigned"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES, default='Tutoring')

    distance = models.PositiveIntegerField(null=True, blank=True, help_text="Distance in kilometers if Travel to Tutor")

    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPE_CHOICES, blank=True, default='Fixed')
    total_hours = models.PositiveIntegerField(null=True, blank=True, help_text="Total hours for the job") 

    gender_preference = models.CharField(
        max_length=10,
        choices=GENDER_PREFERENCE_CHOICES,
        default='Any',
        blank=True
    )

    country = models.CharField(max_length=100, blank=True, default='Unknown')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Open")

    assigned_tutor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_jobs"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.id} by {self.student.username} - {self.service_type}"

class UnlockPricingTier(models.Model):
    min_rate = models.DecimalField(max_digits=10, decimal_places=2)
    max_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Leave null for no upper limit")
    points = models.PositiveIntegerField()

    def __str__(self):
        if self.max_rate:
            return f"${self.min_rate} - ${self.max_rate} → {self.points} pts"
        return f"${self.min_rate}+ → {self.points} pts"

class JobUnlock(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='unlocks')
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs_unlocked')
    points_spent = models.PositiveIntegerField()
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'tutor')

    def __str__(self):
        return f"{self.tutor.username} unlocked Job {self.job.id} for {self.points_spent} pts"

class PointPackage(models.Model):
    name = models.CharField(max_length=100)
    price_usd = models.DecimalField(max_digits=6, decimal_places=2)
    base_points = models.PositiveIntegerField()
    bonus_points = models.PositiveIntegerField(default=0)

    @property
    def total_points(self):
        return self.base_points + self.bonus_points

    @property
    def savings_percentage(self):
        base_price_per_point = self.price_usd / self.base_points
        new_price_per_point = self.price_usd / self.total_points
        return round(((base_price_per_point - new_price_per_point) / base_price_per_point) * 100, 2)

    def __str__(self):
        return f"{self.name} - {self.total_points} pts for ${self.price_usd}"

class CountryGroupPoint(models.Model):
    group = models.CharField(max_length=5, unique=True)  # G1, G2, etc.
    points = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.group} - {self.points} pts"
class CountryGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    group = models.CharField(max_length=2)  # G1, G2, G3, G4, G5

    def __str__(self):
        return f"{self.name} ({self.group})"

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
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        default=1 
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_notifications',
        default=1 
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'From {self.from_user} to {self.to_user} - {self.message[:30]}'

class Conversation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id}"


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='participants', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='conversations', on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_message = models.ForeignKey("Message", null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f"{self.user.username} in Conversation {self.conversation.id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_system = models.BooleanField(default=False)  # For bidding events or notifications
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"

class MessageRead(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('seen', 'Seen'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reads")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')

    class Meta:
        unique_together = ('message', 'user')


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
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='review', null=True, blank=True)
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'student', 'tutor')

    def __str__(self):
        return f"Review for Job {self.job.id} by {self.student.username}"

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
class Question(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.ManyToManyField(User, related_name='upvoted_questions', blank=True)

    def total_upvotes(self):
        return self.upvotes.count()

    def __str__(self):
        return self.title

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.ManyToManyField(User, related_name='upvoted_answers', blank=True)
    downvotes = models.ManyToManyField(User, related_name='downvoted_answers', blank=True)

    def total_upvotes(self):
        return self.upvotes.count()

    def total_downvotes(self):
        return self.downvotes.count()

    def __str__(self):
        return f"Answer to {self.question.title} by {self.tutor.username}"
from django.db import models
from django.conf import settings

class CoinGift(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_gifts')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_gifts')
    amount = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} gifted {self.amount} to {self.recipient}"
