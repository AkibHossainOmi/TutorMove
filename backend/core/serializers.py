from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import (
    User, Gig, Credit, Job, Application, Notification, Message,
    UserSettings, Review, Subject, EscrowPayment, AbuseReport
)

User = get_user_model()

# === AUTH & PASSWORD RESET SERIALIZERS ===

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    user_type = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_type']

    def create(self, validated_data):
        user_type = validated_data.get('user_type', 'student')
        if user_type == 'teacher':  # Normalize
            user_type = 'tutor'
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            user_type=user_type,
            is_active=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user



class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()


# === USER & PROFILE SERIALIZERS ===

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type',
            'trust_score', 'is_verified', 'verification_requested', 'verification_doc'
        ]


# === SUBJECT SERIALIZER ===

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'aliases', 'is_active']


# === GIG SERIALIZER ===

class GigSerializer(serializers.ModelSerializer):
    is_premium = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    trust_score = serializers.SerializerMethodField()
    teacher_username = serializers.SerializerMethodField()
    subjects = serializers.CharField(source='subject', read_only=True)  # or use related model
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Gig
        fields = [
            'id', 'teacher', 'teacher_username', 'title', 'description', 'subject', 'created_at', 'contact_info',
            'is_premium', 'is_verified', 'trust_score', 'subjects', 'subject_ids'
        ]
        read_only_fields = ['id', 'teacher', 'created_at']

    def get_is_premium(self, obj):
        return getattr(obj.teacher, 'usersettings', None) and obj.teacher.usersettings.is_premium

    def get_is_verified(self, obj):
        return getattr(obj.teacher, 'is_verified', False)

    def get_trust_score(self, obj):
        return getattr(obj.teacher, 'trust_score', 1.0)

    def get_teacher_username(self, obj):
        return obj.teacher.username if obj.teacher else None


# === CREDIT SERIALIZER ===

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credit
        fields = '__all__'


# === JOB SERIALIZER ===

class JobSerializer(serializers.ModelSerializer):
    subject = serializers.SerializerMethodField(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True, required=True
    )

    class Meta:
        model = Job
        fields = [
            'id', 'student', 'title', 'description', 'subject', 'subject_id',
            'location', 'latitude', 'longitude', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'subject']

    def get_subject(self, obj):
        if obj.subject:
            return {
                "id": obj.subject.id,
                "name": obj.subject.name,
                "aliases": obj.subject.aliases,
            }
        return None


# === APPLICATION SERIALIZER ===

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'


# === NOTIFICATION SERIALIZER ===

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


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
    student_name = serializers.CharField(source='student.username', read_only=True)
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)
    teacher_trust_score = serializers.FloatField(source='teacher.trust_score', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'student', 'teacher', 'rating', 'comment', 'created_at', 'updated_at',
            'job', 'is_verified', 'student_name', 'teacher_name', 'job_title',
            'student_email', 'teacher_email', 'teacher_trust_score',
        ]
        read_only_fields = [
            'id', 'student', 'created_at', 'updated_at', 'is_verified',
            'student_name', 'teacher_name', 'job_title',
            'student_email', 'teacher_email', 'teacher_trust_score'
        ]


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
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'trust_score', 'credit_balance']

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
