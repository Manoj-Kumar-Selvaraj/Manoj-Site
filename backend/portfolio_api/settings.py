import os
import sys
import logging
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-this-in-production-abc123xyz')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

def _normalize_host(value: str) -> str:
    raw = (value or '').strip()
    if not raw:
        return ''

    if '://' in raw:
        parsed = urlparse(raw)
        raw = parsed.netloc or parsed.path

    raw = raw.split('/')[0].strip()

    # Keep IPv6 literals intact, but strip ports from standard host:port values.
    if raw.count(':') == 1 and not raw.startswith('['):
        raw = raw.split(':', 1)[0]

    return raw.strip('[]')


def _split_hosts(value: str) -> list[str]:
    hosts = []
    for item in (value or '').split(','):
        host = _normalize_host(item)
        if host and host not in hosts:
            hosts.append(host)
    return hosts


def _host_variants(host: str) -> list[str]:
    base = _normalize_host(host)
    if not base:
        return []

    variants = [base]
    if base.startswith('www.'):
        variants.append(base[4:])
    elif '.' in base and not base.endswith('.cloudfront.net'):
        variants.append(f"www.{base}")

    deduped = []
    for item in variants:
        if item and item not in deduped:
            deduped.append(item)
    return deduped


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name, str(default))
    try:
        return int(str(raw).strip())
    except (TypeError, ValueError):
        return default


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return str(raw).strip().lower() in {'1', 'true', 'yes', 'on'}


def _db_sslmode(default: str = 'prefer') -> str:
    allowed = {'disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'}
    raw = str(os.environ.get('DB_SSLMODE', default) or default).strip().strip('"\'').lower()
    return raw if raw in allowed else default


_cf_domain = _normalize_host(os.environ.get('CLOUDFRONT_DOMAIN', ''))
_static_cdn_domain = _normalize_host(os.environ.get('STATIC_CDN_DOMAIN', '')) or _cf_domain
_media_cdn_domain = _normalize_host(os.environ.get('MEDIA_CDN_DOMAIN', ''))
_media_url_prefix = str(os.environ.get('MEDIA_URL_PREFIX', '') or '').strip().strip('/')


ALLOWED_HOSTS = _split_hosts(os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1'))

INSTALLED_APPS = [
    'jazzmin',  # must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'content.apps.ContentConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'portfolio_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio_api.wsgi.application'

_db_engine = os.environ.get('DB_ENGINE', '').strip().lower()
_use_postgres = _db_engine in {'postgres', 'postgresql'} or bool(os.environ.get('DB_HOST', '').strip())

if _use_postgres:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'portfolio'),
            'USER': os.environ.get('DB_USER', 'portfolio'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': _env_int('DB_PORT', 5432),
            'CONN_MAX_AGE': _env_int('DB_CONN_MAX_AGE', 60),
            'OPTIONS': {
                'sslmode': _db_sslmode(),
            },
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = f'https://{_static_cdn_domain}/static/' if (not DEBUG and _static_cdn_domain) else '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# CompressedStaticFilesStorage: serves gzip/brotli-compressed files without
# the strict manifest validation that would fail on third-party packages
# (e.g. Jazzmin) that reference .map files not included in their distributions.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
]

# Allow the deployed frontend to call the API (CloudFront + custom domain)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\\.cloudfront\\.net$",
    r"^https://(www\\.)?manoj-tech-solutions\\.site$",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_THROTTLE_RATES': {
        # Anti-spam guard for public contact form endpoint.
        'contact_submit': os.environ.get('CONTACT_SUBMIT_RATE', '3/hour'),
    },
}

# Jazzmin Admin Theme
JAZZMIN_SETTINGS = {
    "site_title": "Portfolio Admin",
    "site_header": "Portfolio CMS",
    "site_brand": "Manoj's Portfolio",
    "welcome_sign": "Welcome to Portfolio Admin",
    "copyright": "Portfolio",
    "search_model": ["content.BlogPost", "content.Project"],
    "topmenu_links": [
        {"name": "View Site", "url": "http://localhost:5173", "new_window": True},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "content.Profile": "fas fa-id-card",
        "content.Skill": "fas fa-code",
        "content.Project": "fas fa-project-diagram",
        "content.Experience": "fas fa-briefcase",
        "content.BlogPost": "fas fa-blog",
        "content.Activity": "fas fa-tasks",
        "content.Certification": "fas fa-certificate",
        "content.ContactMessage": "fas fa-envelope",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    "related_modal_active": True,
    "custom_css": None,
    "custom_js": None,
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "order_with_respect_to": [
        "content",
        "content.Profile",
        "content.Skill",
        "content.Project",
        "content.Experience",
        "content.BlogPost",
        "content.Activity",
        "content.Certification",
        "content.ContactMessage",
    ],
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}


# ── Production: S3 Media Storage ─────────────────────────────────────────────
# Django uploads (profile photos, project images, blog covers, etc.) are stored
# in S3 when DEBUG=False. Locally they use MEDIA_ROOT on disk.
if not DEBUG:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
    AWS_S3_REGION_NAME      = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_ACCESS_KEY_ID       = os.environ.get('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY   = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    AWS_S3_FILE_OVERWRITE   = False
    AWS_DEFAULT_ACL         = None
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': os.environ.get('AWS_S3_CACHE_CONTROL', 'public, max-age=31536000, immutable')
    }

    if _media_cdn_domain:
        _media_prefix = f'/{_media_url_prefix}' if _media_url_prefix else ''
        MEDIA_URL = f'https://{_media_cdn_domain}{_media_prefix}/'
    elif _cf_domain and str(os.environ.get('USE_PRIMARY_CDN_FOR_MEDIA', 'False')).lower() in {'1', 'true', 'yes'}:
        MEDIA_URL = f'https://{_cf_domain}/'
    else:
        MEDIA_URL = f'https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/'

# ── Production Security Headers ───────────────────────────────────────────────
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER   = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # `check --deploy` recommends DENY unless you intentionally allow framing.
    X_FRAME_OPTIONS             = 'DENY'
    SECURE_HSTS_SECONDS         = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD         = True
    # SSL terminates at CloudFront; CloudFront already enforces HTTPS for viewers
    # (viewer_protocol_policy = "redirect-to-https"), so Django must NOT issue
    # its own HTTPS redirect — otherwise it would redirect to https://ec2-host:443
    # which has no TLS listener (causing ERR_CONNECTION_REFUSED in the browser).
    # Honor the X-Forwarded-Proto header so Django knows the original request was
    # secure (required for CSRF, secure cookies, etc.).
    SECURE_PROXY_SSL_HEADER     = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT         = False
    SESSION_COOKIE_SECURE       = True
    CSRF_COOKIE_SECURE          = True

# ── CSRF Trusted Origins (EC2 IP + custom domain) ────────────────────────────
_raw_hosts = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
CSRF_TRUSTED_ORIGINS = [
    f"https://{h.strip()}" for h in _raw_hosts
    if h.strip() not in ('localhost', '127.0.0.1', '')
] + ['http://localhost:5173', 'http://127.0.0.1:5173']

# ── CORS / ALLOWED_HOSTS / CSRF: production CloudFront domain ────────────────
for _domain in _host_variants(_cf_domain):
    _origin = f'https://{_domain}'
    if _domain not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(_domain)
    if _origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(_origin)
    if _origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(_origin)


# ── Email (Contact Form Notifications) ─────────────────────────────────────
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = _env_int('EMAIL_PORT', 587)
EMAIL_TIMEOUT = _env_int('EMAIL_TIMEOUT', 8)
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = _env_bool('EMAIL_USE_TLS', True)
EMAIL_USE_SSL = _env_bool('EMAIL_USE_SSL', False)
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'noreply@portfolio.local')

# Recipient for portfolio contact form emails.
CONTACT_NOTIFICATION_EMAIL = os.environ.get('CONTACT_NOTIFICATION_EMAIL', EMAIL_HOST_USER)

if not DEBUG:
    if not CONTACT_NOTIFICATION_EMAIL:
        logger.warning('CONTACT_NOTIFICATION_EMAIL is empty; contact form notifications are disabled.')
    if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend' and (
        not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD
    ):
        logger.warning('SMTP backend is enabled but EMAIL_HOST_USER/EMAIL_HOST_PASSWORD are missing.')

# Contact anti-bot timing: require users to spend at least this many
# milliseconds on the form before submitting.
CONTACT_MIN_FORM_FILL_MS = _env_int('CONTACT_MIN_FORM_FILL_MS', 2500)
CONTACT_REQUIRE_FORM_TIMING = os.environ.get('CONTACT_REQUIRE_FORM_TIMING', 'True') == 'True'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'content.views': {
            'handlers': ['console'],
            'level': os.environ.get('CONTACT_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}
