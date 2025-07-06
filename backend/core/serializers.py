# backend/core/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User, Gig, Credit, Job, Application, Notification, Message,
    UserSettings, Review, Subject, EscrowPayment, AbuseReport,
    Order, Payment, Conversation, Chat,
)

User = get_user_model()

class TutorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['bio', 'education', 'experience', 'location']

class TeacherProfileSerializer(serializers.ModelSerializer):
    gigs = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number',
            'user_type', 'bio', 'education', 'experience',
            'location', 'profile_picture', 'trust_score', 'is_verified',
            'subjects', 'gigs', 'reviews', 'bio', 'education', 'experience', 'location'
        ]

    def get_gigs(self, obj):
        gigs_qs = Gig.objects.filter(teacher=obj)
        return GigSerializer(gigs_qs, many=True).data

    def get_reviews(self, obj):
        reviews_qs = Review.objects.filter(teacher=obj, is_verified=True)
        return ReviewSerializer(reviews_qs, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        contact_unlocked = self.context.get('contact_unlocked', False)
        if not contact_unlocked:
            data['email'] = None
            data['phone_number'] = None
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ChatSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'sender', 'content', 'timestamp']

class ConversationSerializer(serializers.ModelSerializer):
    user1 = UserSerializer()
    user2 = UserSerializer()
    last_message = serializers.SerializerMethodField()
    has_unread = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'last_message', 'has_unread']

    def get_last_message(self, obj):
        last_chat = obj.chats.last()
        if last_chat:
            return ChatSerializer(last_chat).data
        return None

    def get_has_unread(self, obj):
        current_user_id = self.context.get('current_user_id')
        if not current_user_id:
            return False
        # Unread messages sent by the other user
        return obj.chats.filter(is_read=False).exclude(sender_id=current_user_id).exists()

# === AUTH & PASSWORD RESET SERIALIZERS ===

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=User.USER_TYPE_CHOICES)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'user_type']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data['user_type'],
        )
        user.is_active = False
        user.save()

        # Email verification link
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = f"{settings.FRONTEND_SITE_URL}/verify-email/{uid}/{token}/"

        # HTML Email Content
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
              <h2 style="color: #111827;">Welcome to <span style="color: #3b82f6;">TutorMove</span>!</h2>
              <p style="font-size: 16px; color: #374151;">Thank you for signing up. Please confirm your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_url}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email</a>
              </div>
              <p style="font-size: 14px; color: #6b7280;">If you did not register for TutorMove, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """
        text_content = f"Please verify your account by clicking this link: {verify_url}"

        # Send email
        msg = EmailMultiAlternatives(
            subject="Verify your TutorMove account",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()

class UserTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise serializers.ValidationError({'error': 'Email not verified.'})
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'user_type': self.user.user_type,
        })
        return data

# === SUBJECT SERIALIZER ===

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'aliases', 'is_active']


# === GIG SERIALIZER ===

class GigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gig
        fields = [
            'id', 'teacher', 'title', 'description', 'subject',
            'latitude', 'longitude', 'created_at', 'contact_info'
        ]
        read_only_fields = ['id', 'created_at']


# === CREDIT SERIALIZER ===
class CreditUpdateByUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.IntegerField(min_value=1)
    isincrease = serializers.BooleanField()

    def validate(self, data):
        from .models import Credit
        try:
            credit = Credit.objects.get(user__id=data['user_id'])
        except Credit.DoesNotExist:
            raise serializers.ValidationError("Credit entry not found for the user.")

        # Calculate new balance
        amount = data['amount']
        new_balance = credit.balance + amount if data['isincrease'] else credit.balance - amount

        if new_balance < 0:
            raise serializers.ValidationError("Balance cannot go negative.")
        if new_balance > 9223372036854776000:
            raise serializers.ValidationError("Balance exceeds maximum limit.")

        data['credit'] = credit  # Pass the credit instance forward
        data['new_balance'] = new_balance
        return data

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credit
        fields = '__all__'


# === JOB SERIALIZER ===

class JobSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()  # Add this field

    class Meta:
        model = Job
        fields = [
            'id', 'student', 'student_name', 'title', 'description', 'subject',
            'location', 'latitude', 'longitude', 'created_at', 'is_active', 'subjects'
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.username if obj.student else None


# === APPLICATION SERIALIZER ===

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'


# === NOTIFICATION SERIALIZER ===

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'to_user', 'message', 'created_at', 'is_read']


# === MESSAGE SERIALIZER ===

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


# === USER SETTINGS SERIALIZER ===

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'


# === REVIEW SERIALIZER ===

class ReviewSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'student', 'student_username', 'teacher', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['student', 'teacher', 'created_at', 'updated_at']


# === ESCROW PAYMENT SERIALIZER ===

class EscrowPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowPayment
        fields = '__all__'


# === ABUSE REPORT SERIALIZER ===

class AbuseReportSerializer(serializers.ModelSerializer):
    reported_user_id = serializers.SerializerMethodField()
    target_type = serializers.SerializerMethodField()
    target_id = serializers.SerializerMethodField()

    class Meta:
        model = AbuseReport
        fields = '__all__'  # plus reported_user_id, target_type, target_id

    def get_reported_user_id(self, obj):
        return obj.reported_user.id if obj.reported_user else None

    def get_target_type(self, obj):
        return obj.target_type

    def get_target_id(self, obj):
        return obj.target_id

class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class JobListSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    subjects = serializers.PrimaryKeyRelatedField(many=True, queryset=Subject.objects.all())

    class Meta:
        model = Job
        fields = [
            'id',
            'student',
            'title',
            'description',
            'subject',
            'subjects',
            'latitude',
            'longitude',
            'created_at',
            'is_active',
        ]
        read_only_fields = ['id', 'student', 'created_at']

    def validate(self, data):
        """Ensure student can't set is_active via API"""
        if 'is_active' in data:
            raise serializers.ValidationError("Cannot modify is_active directly")
        return data


# NEW: Serializers for Order and Payment models
class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model.
    """
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False) # Or a nested UserSerializer if you want user details
    
    class Meta:
        model = Order
        fields = '__all__' # Adjust fields as per your API requirements
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_paid'] # These are set by the backend


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    """
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), required=False) # Or nested OrderSerializer
    
    class Meta:
        model = Payment
        fields = '__all__' # Adjust fields as per your API requirements
        read_only_fields = ['id', 'transaction_id', 'bank_transaction_id', 'status', 'payment_date', 'validation_status', 'error_message']
