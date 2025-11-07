# backend/core/serializers.py
from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    ContactUnlock, User, Gig, Point, Job, Application, Notification,
    UserSettings, Review, Subject, EscrowPayment, AbuseReport,
    Order, Payment, JobUnlock,
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

class ContactUnlockSerializer(serializers.ModelSerializer):
    unlocker = serializers.PrimaryKeyRelatedField(read_only=True)
    target = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = ContactUnlock
        fields = ['id', 'unlocker', 'target', 'timestamp']
        read_only_fields = ['id', 'unlocker', 'timestamp']

    def create(self, validated_data):
        # Automatically set unlocker to the logged-in user
        user = self.context['request'].user
        validated_data['unlocker'] = user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()  # <-- Add this

    class Meta:
        model = User
        fields = '__all__'

    def get_unlocked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # Check if the current user unlocked this tutor
            return ContactUnlock.objects.filter(unlocker=request.user, target=obj).exists()
        # For anonymous users, just return False
        return False

# === AUTH & PASSWORD RESET SERIALIZERS ===

class RegisterSerializer(serializers.ModelSerializer):
    user_type = serializers.ChoiceField(choices=[('student', 'Student'), ('tutor', 'Tutor')])
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'username',
            'user_type',
            'email',
            'password',
            'phone_number',
        ]

    def validate(self, attrs):
        user_type = attrs.get("user_type")
        phone_number = attrs.get("phone_number")

        if user_type == "tutor" and not phone_number:
            raise serializers.ValidationError({
                "phone_number": "Phone number is required for tutors."
            })
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()

class UserTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username", "").strip()
        password = attrs.get("password")

        if not username_or_email or not password:
            raise serializers.ValidationError({"error": "Both username/email and password are required."})

        # Try to get user by username first
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            # If not found, try email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"error": "Invalid credentials."})

        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError({"error": "Invalid credentials."})

        if not user.is_active:
            raise serializers.ValidationError({"error": "Email not verified."})

        self.user = user

        # Pass correct username to parent for JWT token creation
        data = super().validate({"username": user.username, "password": password})

        # Add extra fields
        data.update({
            "user_id": user.id,
            "username": user.username,
            "user_type": user.user_type,
        })

        return data

# === SUBJECT SERIALIZER ===

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'aliases', 'is_active']


# === GIG SERIALIZER ===


class GigSerializer(serializers.ModelSerializer):
    subject_active = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = '__all__'
        read_only_fields = ['tutor', 'used_credits']

    def get_subject_active(self, obj):
        try:
            subject = Subject.objects.get(name__iexact=obj.subject)
            return subject.is_active
        except Subject.DoesNotExist:
            return False

# === JOB UNLOCK SERIALIZER ===
class JobUnlockSerializer(serializers.ModelSerializer):
    tutor = serializers.StringRelatedField(read_only=True)
    job = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = JobUnlock
        fields = ['id', 'job', 'tutor', 'points_spent', 'unlocked_at']

# === CREDIT SERIALIZER ===
class CreditUpdateByUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.IntegerField(min_value=1)
    isincrease = serializers.BooleanField()

    def validate(self, data):
        from .models import Point
        try:
            point = Point.objects.get(user__id=data['user_id'])
        except Point.DoesNotExist:
            raise serializers.ValidationError("Point entry not found for the user.")

        # Calculate new balance
        amount = data['amount']
        new_balance = point.balance + amount if data['isincrease'] else point.balance - amount

        if new_balance < 0:
            raise serializers.ValidationError("Balance cannot go negative.")
        if new_balance > 9223372036854776000:
            raise serializers.ValidationError("Balance exceeds maximum limit.")

        data['point'] = point  # Pass the point instance forward
        data['new_balance'] = new_balance
        return data

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']  # choose what you want


# === JOB SERIALIZER ===

# === REVIEW SERIALIZER ===

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'job', 'tutor', 'student', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'tutor', 'student', 'created_at']

# === JOB SERIALIZER ===

class JobSerializer(serializers.ModelSerializer):
    subjects = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True
    )
    subject_details = serializers.SerializerMethodField(read_only=True)
    student = StudentSerializer(read_only=True)
    can_unlock = serializers.SerializerMethodField(read_only=True)
    applicants_count = serializers.SerializerMethodField()
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'student', 'description', 'location', 'country',
            'service_type', 'education_level', 'gender_preference', 'budget',
            'budget_type', 'phone', 'mode', 'distance', 'languages',
            'subjects', 'subject_details', 'total_hours', 'status', 'assigned_tutor',
            'created_at', 'updated_at', 'can_unlock', 'applicants_count', 'review'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']

    def get_applicants_count(self, obj):
        return obj.unlocks.count()

    def get_can_unlock(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        user = request.user
        if user.user_type != "tutor":
            return False

        # Get all subject names from tutor's gigs (string field)
        gig_subjects = user.gigs.values_list("subject", flat=True)

        # Check if any of the job's subjects match tutor's gig subjects
        return obj.subjects.filter(name__in=gig_subjects, is_active=True).exists()

    def get_subject_details(self, obj):
        return [subject.name for subject in obj.subjects.all()]

    def validate_distance(self, value):
        if value in ['', None]:
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("A valid integer is required.")

    def create(self, validated_data):
        subject_names = validated_data.pop('subjects', [])
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['student'] = request.user

        job = Job.objects.create(**validated_data)

        subjects = []
        for name in subject_names:
            subject, _ = Subject.objects.get_or_create(name=name.strip())
            subjects.append(subject)
        job.subjects.set(subjects)
        return job

    def update(self, instance, validated_data):
        subject_names = validated_data.pop('subjects', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if subject_names is not None:
            subjects = []
            for name in subject_names:
                subject, _ = Subject.objects.get_or_create(name=name.strip())
                subjects.append(subject)
            instance.subjects.set(subjects)

        return instance


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

# class MessageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Message
#         fields = '__all__'


# === USER SETTINGS SERIALIZER ===

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'

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
