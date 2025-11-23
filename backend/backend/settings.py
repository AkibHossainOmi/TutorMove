"""
Django settings for tutorclone_backend project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY and os.getenv("DEBUG", "False") == "True":
    SECRET_KEY = 'django-insecure-dswq$mer#l$f2p%b8eydalez%(%e_e*su9itll(9+yvvpsqwf@'

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'phonenumber_field',
    "corsheaders",
    'accounts',

    # Third party apps
    "rest_framework",
    "rest_framework.authtoken",
    "channels",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "drf_yasg",
    "django_redis",

    # Local apps
    "core",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

# Channels
ASGI_APPLICATION = "backend.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                (
                    os.getenv("REDIS_HOST", "127.0.0.1"),
                    int(os.getenv("REDIS_PORT", 6379))
                )
            ],
        },
    }
}

# CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_SITE_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# Authentication backends
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# Site ID for django-allauth
SITE_ID = 1

# # Google OAuth2 settings
# SOCIALACCOUNT_PROVIDERS = {
#     "google": {
#         "APP": {
#             "client_id": os.getenv('GOOGLE_CLIENT_ID'),
#             "secret": os.getenv('GOOGLE_CLIENT_SECRET'),
#             "key": "",
#         }
#     }
# }

# SSLCommerz settings
SSL_COMMERZ = {
    'STORE_ID': os.getenv('SSL_COMMERZ_STORE_ID'),
    'STORE_PASSWORD': os.getenv('SSL_COMMERZ_STORE_PASSWORD'),
    'STORE_NAME': os.getenv('SSL_COMMERZ_STORE_NAME'),
    'REGISTERED_URL': os.getenv('SSL_COMMERZ_REGISTERED_URL'),
    'SESSION_API': os.getenv('SSL_COMMERZ_SESSION_API'),
    'VALIDATION_API': os.getenv('SSL_COMMERZ_VALIDATION_API'),
}

REDIS_HOST = os.environ.get("REDIS_HOST", "127.0.0.1")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
CELERY_BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
CELERY_RESULT_BACKEND = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Asia/Dhaka"  # or your timezone
CELERY_ENABLE_UTC = False

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{REDIS_HOST}:{REDIS_PORT}/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Custom user model
AUTH_USER_MODEL = "core.User"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("FROM_EMAIL", EMAIL_HOST_USER)
FROM_EMAIL = DEFAULT_FROM_EMAIL 
FRONTEND_SITE_URL = os.getenv("FRONTEND_SITE_URL", "http://localhost:3000")
INTERNAL_API_BASE_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

DB_ENGINE = os.getenv("DB_ENGINE", "django.db.backends.sqlite3")

if DB_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": os.getenv("DB_NAME", BASE_DIR / "db.sqlite3"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": os.getenv("DB_NAME", "my_database"),
            "USER": os.getenv("DB_USER", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "3306" if "mysql" in DB_ENGINE else "5432"),
            "OPTIONS": {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'"
            } if "mysql" in DB_ENGINE else {}
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGES = [
    ('en', 'English'),
    ('zh-hans', 'Chinese (Simplified)'),
    ('hi', 'Hindi'),
    ('es', 'Spanish'),
    ('fr', 'French'),
    ('ar', 'Arabic'),
    ('bn', 'Bengali'),
    ('pt', 'Portuguese'),
    ('ru', 'Russian'),
    ('ur', 'Urdu'),
]
LANGUAGE_CODE = 'en'
USE_I18N = True
USE_L10N = True


STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static/")

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media/")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

USE_JWT=True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

JWT_COOKIE = {
    'REFRESH_TOKEN_NAME': 'refresh_token',
    'HTTPONLY': True,
    'SECURE': not DEBUG,  # True in production
    'SAMESITE': 'Lax',
    'MAX_AGE': 7 * 24 * 60 * 60,  # 7 days
    'PATH': '/api/auth/token/refresh/',
}

# Secure Cookies
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
