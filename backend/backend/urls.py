from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.http import HttpResponse

schema_view = get_schema_view(
   openapi.Info(
      title="TutorMove API",
      default_version='v1',
      description="API documentation for TutorMove backend",
      contact=openapi.Contact(email="tutormove.com@example.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

def root_view(request):
    html_content = """
    <html>
        <head>
            <title>TeacherOn Clone API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                ul { list-style-type: none; padding: 0; }
                li { margin: 10px 0; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Welcome to TeacherOn Clone API</h1>
            <ul>
                <li><a href="/admin/">Admin Panel</a></li>
                <li><a href="/api/">API Endpoints</a></li>
                <li><a href="/swagger/">API Documentation (Swagger)</a></li>
                <li><a href="/redoc/">API Documentation (ReDoc)</a></li>
            </ul>
        </body>
    </html>
    """
    return HttpResponse(html_content)

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('accounts/', include('allauth.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
