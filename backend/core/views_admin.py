from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, viewsets, status, filters
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    User, Job, Payment, AbuseReport, Subject, Gig, PointPackage,
    UnlockPricingTier, CountryGroup, Question
)
from .serializers import (
    UserSerializer, JobSerializer, PaymentSerializer, AbuseReportSerializer,
    SubjectSerializer, GigSerializer, PointPackageSerializer,
    UnlockPricingTierSerializer, CountryGroupSerializer, QuestionSerializer
)

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_jobs = Job.objects.filter(status='Open').count()
        total_revenue = Payment.objects.filter(status='SUCCESS').aggregate(total=Sum('amount'))['total'] or 0
        pending_reports = AbuseReport.objects.count()

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
            "total_users": total_users,
            "active_jobs": active_jobs,
            "total_revenue": float(total_revenue),
            "pending_reports": pending_reports,
            "recent_activity": recent_activity
        })

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
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
        user = self.get_object()
        user.user_type = 'moderator'
        user.save()
        return Response({'status': 'User is now a moderator'})

    @action(detail=True, methods=['post'])
    def remove_moderator(self, request, pk=None):
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
    permission_classes = [permissions.IsAdminUser]
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
    permission_classes = [permissions.IsAdminUser]
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

class AdminReportViewSet(viewsets.ModelViewSet):
    queryset = AbuseReport.objects.all().order_by('-created_at')
    serializer_class = AbuseReportSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = AbuseReport.objects.count()
        return Response({"total": total})

class AdminSubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAdminUser]
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
    permission_classes = [permissions.IsAdminUser]
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
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'student__username']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Question.objects.count()
        return Response({"total": total})

class AdminPointPackageViewSet(viewsets.ModelViewSet):
    queryset = PointPackage.objects.all()
    serializer_class = PointPackageSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminPricingTierViewSet(viewsets.ModelViewSet):
    queryset = UnlockPricingTier.objects.all()
    serializer_class = UnlockPricingTierSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCountryGroupViewSet(viewsets.ModelViewSet):
    queryset = CountryGroup.objects.all()
    serializer_class = CountryGroupSerializer
    permission_classes = [permissions.IsAdminUser]
