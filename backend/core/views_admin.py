from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, viewsets, status, filters, serializers
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from .models import (
    User, Job, Payment, AbuseReport, Subject, Gig, PointPackage,
    UnlockPricingTier, CountryGroup, Question, Coupon, TutorApplication,
    Answer, Credit
)
from .serializers import (
    UserSerializer, JobSerializer, PaymentSerializer, AbuseReportSerializer,
    SubjectSerializer, GigSerializer, PointPackageSerializer,
    UnlockPricingTierSerializer, CountryGroupSerializer, QuestionSerializer,
    CouponSerializer, TutorApplicationSerializer
)
from .permissions import IsAdminOrModerator
from .pdf_utils.pdf_generator import PaymentStatementPDF

class AdminUserSerializer(UserSerializer):
    """
    Serializer for Admin to create/update users, handling password hashing.
    Includes credit balance from Credit model.
    """
    password = serializers.CharField(write_only=True, required=False)
    credits = serializers.SerializerMethodField(read_only=True)
    set_credits = serializers.IntegerField(write_only=True, required=False, min_value=0)

    class Meta(UserSerializer.Meta):
        fields = '__all__'

    def get_credits(self, obj):
        """Get the credit balance from Credit model."""
        try:
            credit = Credit.objects.get(user=obj)
            return credit.balance
        except Credit.DoesNotExist:
            return 0

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        set_credits = validated_data.pop('set_credits', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        # Create Credit entry for new user
        credit, created = Credit.objects.get_or_create(user=user, defaults={'balance': set_credits or 0})
        if not created and set_credits is not None:
            credit.balance = set_credits
            credit.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        set_credits = validated_data.pop('set_credits', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        # Update Credit balance if provided
        if set_credits is not None:
            credit, created = Credit.objects.get_or_create(user=user, defaults={'balance': set_credits})
            if not created:
                credit.balance = set_credits
                credit.save()
        return user

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminOrModerator]

    def get(self, request):
        from django.db.models import Q

        # User Statistics
        total_users = User.objects.count()
        student_count = User.objects.filter(user_type='student').count()
        tutor_count = User.objects.filter(user_type='tutor').count()
        admin_count = User.objects.filter(user_type='admin').count()
        moderator_count = User.objects.filter(user_type='moderator').count()

        # Question Statistics
        total_questions = Question.objects.count()
        approved_questions = Question.objects.filter(approval_status='approved').count()
        pending_questions = Question.objects.filter(approval_status='pending').count()
        rejected_questions = Question.objects.filter(approval_status='rejected').count()
        total_answers = Answer.objects.count()

        # Job Statistics
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(status='Open').count()
        open_jobs = Job.objects.filter(status='Open').count()
        in_progress_jobs = Job.objects.filter(status='Assigned').count()
        completed_jobs = Job.objects.filter(status='Completed').count()

        # Gig Statistics
        total_gigs = Gig.objects.count()
        active_gigs = Gig.objects.filter(is_active=True).count()

        # Payment Statistics
        total_payments = Payment.objects.count()
        successful_payments = Payment.objects.filter(status='SUCCESS').count()
        pending_payments = Payment.objects.filter(status='PENDING').count()
        failed_payments = Payment.objects.filter(status='FAILED').count()
        total_revenue = Payment.objects.filter(status='SUCCESS').aggregate(total=Sum('amount'))['total'] or 0

        # Report Statistics
        total_reports = AbuseReport.objects.count()
        # Note: AbuseReport model doesn't have status field yet, so all reports are considered pending
        pending_reports = total_reports
        resolved_reports = 0

        # Subject Statistics
        active_subjects = Subject.objects.filter(is_active=True).count()

        # Package Statistics
        total_packages = PointPackage.objects.count()

        # Coupon Statistics
        from django.utils import timezone
        active_coupons = Coupon.objects.filter(
            active=True,
            valid_from__lte=timezone.now(),
            valid_to__gte=timezone.now()
        ).count()

        # Premium Users (users who have made successful payments)
        premium_users = Payment.objects.filter(status='SUCCESS').values('order__user').distinct().count()

        # Recent Activity
        recent_activity = []
        recent_users = User.objects.order_by('-date_joined')[:5]
        for user in recent_users:
            recent_activity.append({
                "description": f"New user joined: {user.username}",
                "timestamp": user.date_joined
            })

        recent_jobs = Job.objects.order_by('-created_at')[:5]
        for job in recent_jobs:
            desc = job.description[:20] + "..." if job.description else job.service_type
            recent_activity.append({
                "description": f"New job posted: {desc}",
                "timestamp": job.created_at
            })

        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activity = recent_activity[:10]

        return Response({
            # User Stats
            "total_users": total_users,
            "student_count": student_count,
            "tutor_count": tutor_count,
            "admin_count": admin_count,
            "moderator_count": moderator_count,
            "premium_users": premium_users,

            # Question Stats
            "total_questions": total_questions,
            "approved_questions": approved_questions,
            "pending_questions": pending_questions,
            "rejected_questions": rejected_questions,
            "total_answers": total_answers,

            # Job Stats
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "open_jobs": open_jobs,
            "in_progress_jobs": in_progress_jobs,
            "completed_jobs": completed_jobs,

            # Gig Stats
            "total_gigs": total_gigs,
            "active_gigs": active_gigs,

            # Payment Stats
            "total_payments": total_payments,
            "successful_payments": successful_payments,
            "pending_payments": pending_payments,
            "failed_payments": failed_payments,
            "total_revenue": float(total_revenue),

            # Report Stats
            "total_reports": total_reports,
            "pending_reports": pending_reports,
            "resolved_reports": resolved_reports,

            # Other Stats
            "active_subjects": active_subjects,
            "total_packages": total_packages,
            "active_coupons": active_coupons,

            # Recent Activity
            "recent_activity": recent_activity
        })

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['user_type', 'is_active']
    search_fields = ['username', 'email']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = User.objects.count()
        students = User.objects.filter(user_type='student').count()
        tutors = User.objects.filter(user_type='tutor').count()
        admins = User.objects.filter(user_type='admin').count()
        moderators = User.objects.filter(user_type='moderator').count()
        return Response({
            "total": total,
            "students": students,
            "tutors": tutors,
            "admins": admins,
            "moderators": moderators
        })

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'User blocked'})

    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'User unblocked'})

    @action(detail=True, methods=['post'])
    def make_moderator(self, request, pk=None):
        # Only admins can make moderators
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Only admins can make moderators'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.user_type = 'moderator'
        user.save()
        return Response({'status': 'User is now a moderator'})

    @action(detail=True, methods=['post'])
    def remove_moderator(self, request, pk=None):
        # Only admins can remove moderators
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Only admins can remove moderators'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        target_role = request.data.get('target_role', 'student')
        if target_role not in ['student', 'tutor']:
             target_role = 'student'
        user.user_type = target_role
        user.save()
        return Response({'status': f'User removed from moderators and set to {target_role}'})

class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ['description', 'title', 'service_type']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Job.objects.count()
        open_jobs = Job.objects.filter(status='Open').count()
        assigned = Job.objects.filter(status='Assigned').count()
        completed = Job.objects.filter(status='Completed').count()
        cancelled = Job.objects.filter(status='Cancelled').count()
        return Response({
            "total": total,
            "open": open_jobs,
            "assigned": assigned,
            "completed": completed,
            "cancelled": cancelled
        })

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        job = self.get_object()
        job.status = 'Cancelled'
        job.save()
        return Response({'status': 'Job closed'})

class AdminPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ['transaction_id', 'status', 'order__id']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Payment.objects.count()
        success = Payment.objects.filter(status='SUCCESS').count()
        pending = Payment.objects.filter(status='PENDING').count()
        failed = Payment.objects.filter(status='FAILED').count()
        return Response({
            "total": total,
            "success": success,
            "pending": pending,
            "failed": failed
        })

    @action(detail=False, methods=['get'])
    def download_statement(self, request):
        """
        Download payment statement as PDF for a given date range.
        Only admins can download (not moderators).
        """
        # Permission check: Only admins can download
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Only administrators can download payment statements.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        payment_status = request.query_params.get('status', None)

        # Validate required parameters
        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Parse datetime strings
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate date range
        if end_date < start_date:
            return Response(
                {'error': 'end_date must be after start_date.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Query payments within date range
        payments = Payment.objects.filter(
            payment_date__range=[start_date, end_date]
        ).select_related('order', 'order__user').order_by('-payment_date')

        # Filter by status if provided
        if payment_status and payment_status != 'all':
            payments = payments.filter(status=payment_status.upper())

        # Check if there are any payments
        if not payments.exists():
            return Response(
                {'error': 'No payments found for the specified date range.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate PDF
        admin_name = request.user.get_full_name() or request.user.username
        pdf_generator = PaymentStatementPDF(
            payments=payments,
            start_date=start_date.strftime('%Y-%m-%d %H:%M'),
            end_date=end_date.strftime('%Y-%m-%d %H:%M'),
            admin_name=admin_name
        )

        pdf_buffer = pdf_generator.generate()

        # Create filename
        filename = f"payment_statement_{start_date.strftime('%Y-%m-%d')}_to_{end_date.strftime('%Y-%m-%d')}.pdf"

        # Return PDF as HTTP response
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

class AdminReportViewSet(viewsets.ModelViewSet):
    queryset = AbuseReport.objects.all().order_by('-created_at')
    serializer_class = AbuseReportSerializer
    permission_classes = [IsAdminOrModerator]
    http_method_names = ['get', 'delete']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = AbuseReport.objects.count()
        return Response({"total": total})

class AdminSubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Subject.objects.count()
        active = Subject.objects.filter(is_active=True).count()
        inactive = total - active
        return Response({"total": total, "active": active, "inactive": inactive})

class AdminGigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.all().order_by('-created_at')
    serializer_class = GigSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'subject', 'tutor__username']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Gig.objects.count()
        # Add more if Gig model has status
        return Response({"total": total})

class AdminQuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['approval_status', 'is_flagged']
    search_fields = ['title', 'content', 'student__username']

    def get_queryset(self):
        # Admins and moderators can see all questions
        return Question.objects.all().order_by('-created_at')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Question.objects.count()
        pending = Question.objects.filter(approval_status='pending').count()
        approved = Question.objects.filter(approval_status='approved').count()
        rejected = Question.objects.filter(approval_status='rejected').count()
        flagged = Question.objects.filter(is_flagged=True).count()
        return Response({
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "flagged": flagged
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending question."""
        question = self.get_object()
        question.approval_status = 'approved'
        question.is_flagged = False
        question.reviewed_by = request.user
        question.reviewed_at = datetime.now()
        question.save()
        return Response({'status': 'Question approved', 'approval_status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a pending question."""
        question = self.get_object()
        question.approval_status = 'rejected'
        question.reviewed_by = request.user
        question.reviewed_at = datetime.now()
        question.save()
        return Response({'status': 'Question rejected', 'approval_status': 'rejected'})

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending questions for review."""
        pending_questions = Question.objects.filter(approval_status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_questions, many=True)
        return Response(serializer.data)

class AdminPointPackageViewSet(viewsets.ModelViewSet):
    queryset = PointPackage.objects.all()
    serializer_class = PointPackageSerializer

    def get_permissions(self):
        # Allow anyone to view packages (GET), but only admins/moderators can modify
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrModerator()]

    def get_queryset(self):
        # For non-admin users, only show active packages
        queryset = PointPackage.objects.all()
        if not (self.request.user.is_authenticated and
                (self.request.user.is_staff or
                 getattr(self.request.user, 'user_type', None) in ['admin', 'moderator'])):
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('-id')

class AdminPricingTierViewSet(viewsets.ModelViewSet):
    queryset = UnlockPricingTier.objects.all()
    serializer_class = UnlockPricingTierSerializer
    permission_classes = [IsAdminOrModerator]

class AdminCountryGroupViewSet(viewsets.ModelViewSet):
    queryset = CountryGroup.objects.all()
    serializer_class = CountryGroupSerializer
    permission_classes = [IsAdminOrModerator]

class AdminCouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [filters.SearchFilter]
    search_fields = ['code']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Coupon.objects.count()
        active = Coupon.objects.filter(active=True).count()
        return Response({"total": total, "active": active})

class AdminTutorApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admins/moderators to review tutor applications.
    """
    queryset = TutorApplication.objects.all().order_by('-created_at')
    serializer_class = TutorApplicationSerializer
    permission_classes = [IsAdminOrModerator]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['student__username', 'student__email']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = TutorApplication.objects.count()
        pending = TutorApplication.objects.filter(status='pending').count()
        approved = TutorApplication.objects.filter(status='approved').count()
        rejected = TutorApplication.objects.filter(status='rejected').count()
        return Response({
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a tutor application and grant dual-role access."""
        application = self.get_object()

        if application.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update application
        application.status = 'approved'
        application.reviewed_by = request.user
        application.reviewed_at = datetime.now()
        application.save()

        # Update user to have dual role
        student = application.student
        student.is_dual_role = True
        student.original_user_type = student.user_type
        student.user_type = 'tutor'  # Set to tutor by default
        student.save()

        return Response({
            'status': 'Application approved',
            'message': f'{student.username} now has dual-role access.'
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a tutor application."""
        application = self.get_object()

        if application.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get optional review notes
        review_notes = request.data.get('review_notes', '')

        # Update application
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.reviewed_at = datetime.now()
        application.review_notes = review_notes
        application.save()

        return Response({
            'status': 'Application rejected'
        })
