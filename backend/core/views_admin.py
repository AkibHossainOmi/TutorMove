from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from django.db.models import Sum
from .models import User, Job, Payment, AbuseReport
from .serializers import UserSerializer, JobSerializer

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_jobs = Job.objects.filter(status='Open').count()

        # Calculate revenue from Payment model (assuming successful payments are revenue)
        total_revenue = Payment.objects.filter(status='SUCCESS').aggregate(total=Sum('amount'))['total'] or 0

        # Pending reports
        pending_reports = AbuseReport.objects.count() # You might want to filter by status if you add one

        # Recent Activity (Example: Last 5 users joined)
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_activity = []
        for user in recent_users:
            recent_activity.append({
                "description": f"New user joined: {user.username}",
                "timestamp": user.date_joined
            })

        # You can add more activities like recent jobs, recent payments etc.
        recent_jobs = Job.objects.order_by('-created_at')[:5]
        for job in recent_jobs:
            # Use description or service_type since title doesn't exist
            desc = job.description[:20] + "..." if job.description else job.service_type
            recent_activity.append({
                "description": f"New job posted: {desc}",
                "timestamp": job.created_at
            })

        # Sort combined activity by timestamp desc
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
    http_method_names = ['get', 'delete', 'patch', 'post'] # Restrict methods

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

class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete', 'patch', 'post']

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        job = self.get_object()
        job.status = 'Cancelled' # Or Closed if that status exists, choices says Cancelled/Completed
        job.save()
        return Response({'status': 'Job closed'})
