from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Gig, Credit, Job, Application,
    Notification, Message, UserSettings, Review, EscrowPayment ,Subject, Conversation, ConversationParticipant,
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'verification_requested')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_verified', 'verification_requested')
    fieldsets = UserAdmin.fieldsets + (
        ('User Type & Trust', {'fields': ('user_type', 'trust_score', 'is_verified', 'verification_requested')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('User Type & Trust', {'fields': ('user_type', 'trust_score', 'is_verified', 'verification_requested')}),
    )
    actions = ['approve_verification']

    def approve_verification(self, request, queryset):
        queryset.update(is_verified=True, verification_requested=False)
        self.message_user(request, "Selected users marked as verified.")

    approve_verification.short_description = "Approve selected as verified"


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ('title', 'tutor', 'created_at', 'used_credits')
    list_filter = ('created_at',)
    search_fields = ('title', 'description', 'education', 'experience')
    ordering = ('-created_at',)

@admin.register(Credit)
class CreditAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'auto_renew', 'last_renewed')
    list_filter = ('auto_renew',)
    search_fields = ('user__username',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'student',
        'get_subjects',
        'service_type',
        'education_level',
        'gender_preference',
        'location',
        'budget',
        'budget_type',
        'country',
        'created_at',
    ]
    list_filter = [
        'service_type',
        'education_level',
        'gender_preference',
        'country',
        'created_at',
    ]
    search_fields = ['description', 'location', 'subjects__name', 'student__username']

    def get_subjects(self, obj):
        return ", ".join([subject.name for subject in obj.subjects.all()])
    get_subjects.short_description = 'Subjects'

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'teacher', 'applied_at', 'is_premium')
    list_filter = ('is_premium', 'applied_at')
    search_fields = ('job__title', 'teacher__username')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('from_user__username', 'to_user__username', 'message')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'content_preview', 'is_system', 'timestamp')
    list_filter = ('is_system', 'timestamp')
    search_fields = ('sender__username', 'conversation__id', 'content')

    def content_preview(self, obj):
        return (obj.content[:50] + '...') if obj.content else '[No Text]'
    content_preview.short_description = 'Message'

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    search_fields = ('id',)

@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'user', 'joined_at', 'last_read_message')
    search_fields = ('user__username', 'conversation__id')

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'sms_notifications', 'profile_visibility', 'is_premium')
    list_filter = ('email_notifications', 'sms_notifications', 'profile_visibility', 'is_premium', 'profile_deactivated')
    search_fields = ('user__username',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('student', 'teacher', 'rating', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_verified', 'created_at')
    search_fields = ('student__username', 'teacher__username', 'comment')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(EscrowPayment)
class EscrowPaymentAdmin(admin.ModelAdmin):
    list_display = ('student', 'tutor', 'job', 'amount', 'is_released', 'commission', 'created_at')
    search_fields = ('student__username', 'tutor__username', 'job__id')
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'aliases', 'is_active')
    search_fields = ('name', 'aliases')
    list_filter = ('is_active',)
# backend/core/admin.py
