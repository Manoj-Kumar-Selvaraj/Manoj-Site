from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
import logging
from django.conf import settings
from django.core.mail import EmailMessage
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Profile, Skill, ArchitectureEntry, CurrentFocusItem, ToolArchitecture,
    Project, Experience,
    BlogPost, Activity, Certification, OpenSourceContribution, ContactMessage,
    SKILL_CATEGORIES
)
from .serializers import (
    ProfileSerializer, SkillSerializer, ArchitectureEntrySerializer, CurrentFocusItemSerializer, ToolArchitectureSerializer,
    ProjectSerializer,
    ExperienceSerializer, BlogPostListSerializer, BlogPostDetailSerializer,
    ActivitySerializer, CertificationSerializer, OpenSourceContributionSerializer, ContactMessageSerializer
)
from .throttles import ContactSubmitRateThrottle


logger = logging.getLogger(__name__)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.prefetch_related('stats').all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile = Profile.objects.prefetch_related('stats').first()
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)
        return Response(ProfileSerializer(profile, context={'request': request}).data)


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    @action(detail=False, methods=['get'])
    def grouped(self, request):
        skills = Skill.objects.all()
        groups = {}
        for skill in skills:
            cat = skill.category
            if cat not in groups:
                groups[cat] = {
                    'category': cat,
                    'label': skill.get_category_display(),
                    'skills': []
                }
            groups[cat]['skills'].append(SkillSerializer(skill, context={'request': request}).data)

        ordered_categories = [c for c, _ in SKILL_CATEGORIES]
        ordered = [groups[c] for c in ordered_categories if c in groups]
        # Append any unexpected categories at the end (stable order).
        for cat, payload in groups.items():
            if cat not in ordered_categories:
                ordered.append(payload)

        return Response(ordered)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        curated = Skill.objects.filter(show_in_hero=True).order_by('order', 'name')

        if curated.exists():
            skills = list(curated)
        else:
            # Backward-compatible fallback so Hero still shows a concise tool strip
            # before admins curate skills in Django admin.
            skills = list(
                Skill.objects.filter(Q(icon__gt='') | Q(icon_upload__gt=''))
                .order_by('-proficiency', 'order', 'name')
            )

        return Response(SkillSerializer(skills, many=True, context={'request': request}).data)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all().order_by('order', 'id')
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['featured', 'status']
    search_fields = ['title', 'description']
    lookup_field = 'slug'
    pagination_class = None


class ArchitectureEntryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ArchitectureEntry.objects.filter(published=True)
    serializer_class = ArchitectureEntrySerializer
    permission_classes = [AllowAny]


class CurrentFocusItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CurrentFocusItem.objects.filter(active=True)
    serializer_class = CurrentFocusItemSerializer
    permission_classes = [AllowAny]


class ToolArchitectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ToolArchitecture.objects.all().order_by('order', 'id')
    serializer_class = ToolArchitectureSerializer
    permission_classes = [AllowAny]


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [AllowAny]


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.filter(published=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['featured']
    search_fields = ['title', 'summary', 'tags']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['activity_type']
    search_fields = ['title', 'description']

    def get_queryset(self):
        qs = Activity.objects.filter(published=True)

        # Day-to-day mode excludes achievements/projects so the home page
        # can focus on ongoing work rather than milestones.
        day_to_day = self.request.query_params.get('day_to_day')
        if str(day_to_day).lower() in {'1', 'true', 'yes'}:
            qs = qs.exclude(activity_type__in=['project', 'achievement'])

        return qs


class CertificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [AllowAny]


class OpenSourceContributionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OpenSourceContribution.objects.filter(published=True)
    serializer_class = OpenSourceContributionSerializer
    permission_classes = [AllowAny]


def _mask_email(value):
    raw = str(value or '').strip()
    if not raw or '@' not in raw:
        return '<empty>' if not raw else '<invalid-email>'

    local, domain = raw.rsplit('@', 1)
    if len(local) <= 2:
        masked_local = f"{local[:1]}***"
    else:
        masked_local = f"{local[:2]}***{local[-1:]}"
    return f"{masked_local}@{domain}"


def _contact_email_debug_config(to_email, from_email):
    password = str(getattr(settings, 'EMAIL_HOST_PASSWORD', '') or '')
    username = str(getattr(settings, 'EMAIL_HOST_USER', '') or '')
    return {
        'email_backend': str(getattr(settings, 'EMAIL_BACKEND', '') or ''),
        'email_host': str(getattr(settings, 'EMAIL_HOST', '') or ''),
        'email_port': getattr(settings, 'EMAIL_PORT', None),
        'email_timeout': getattr(settings, 'EMAIL_TIMEOUT', None),
        'email_use_tls': bool(getattr(settings, 'EMAIL_USE_TLS', False)),
        'email_use_ssl': bool(getattr(settings, 'EMAIL_USE_SSL', False)),
        'email_host_user': _mask_email(username),
        'email_host_password_set': bool(password),
        'email_host_password_length': len(password),
        'default_from_email': _mask_email(from_email),
        'contact_notification_email': _mask_email(to_email),
    }


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactSubmitRateThrottle]
    http_method_names = ['post']

    def _legacy_create_async(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message_obj = serializer.save()

        to_email = str(getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', '') or '').strip()
        from_email = str(getattr(settings, 'DEFAULT_FROM_EMAIL', '') or '').strip() or None
        email_sent = False
        email_queued = False
        email_status = 'not_configured'
        delivery_note = ''

        if to_email:
            subject = f"[Portfolio Contact] {message_obj.subject}"
            body = (
                "A new contact form message was submitted.\n\n"
                f"Name: {message_obj.name}\n"
                f"Email: {message_obj.email}\n"
                f"Subject: {message_obj.subject}\n"
                f"Message:\n{message_obj.message}\n"
            )

            def _send_notification_async():
                try:
                    logger.debug(
                        f"Sending contact email: from={from_email}, to={to_email}, "
                        f"host={settings.EMAIL_HOST}, port={settings.EMAIL_PORT}, "
                        f"use_tls={settings.EMAIL_USE_TLS}, use_ssl={settings.EMAIL_USE_SSL}"
                    )
                    send_mail(
                        subject=subject,
                        message=body,
                        from_email=from_email,
                        recipient_list=[to_email],
                        fail_silently=False,
                    )
                    logger.info('✓ Contact notification email sent to %s', to_email)
                except Exception as e:
                    logger.error(
                        f"✗ Failed to send contact notification email to {to_email}: "
                        f"{type(e).__name__}: {str(e)}"
                    )
                    logger.exception('Full traceback for contact email failure')

            # Keep API response fast even if SMTP is slow/unreachable.
            threading.Thread(target=_send_notification_async, daemon=True).start()
            email_queued = True
            email_status = 'queued'
            delivery_note = 'Notification email queued for delivery. Check server logs for final SMTP result.'
        else:
            email_status = 'not_configured'
            delivery_note = 'CONTACT_NOTIFICATION_EMAIL is not configured; message was saved in admin only.'

        response_payload = {
            'message': 'Your message has been sent. I will get back to you soon!',
            'email_sent': email_sent,
            'email_queued': email_queued,
            'email_status': email_status,
        }
        if delivery_note:
            response_payload['delivery_note'] = delivery_note

        return Response(
            response_payload,
            status=status.HTTP_201_CREATED
        )

    def _legacy_create_queued(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message_obj = serializer.save()

        to_email = str(getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', '') or '').strip()
        from_email = str(getattr(settings, 'DEFAULT_FROM_EMAIL', '') or '').strip() or None
        email_sent = False
        email_status = 'not_configured'
        delivery_note = 'CONTACT_NOTIFICATION_EMAIL is not configured; message was saved in admin only.'

        if to_email:
            subject = f"[Portfolio Contact] {message_obj.subject}"
            body = (
                "A new contact form message was submitted.\n\n"
                f"Name: {message_obj.name}\n"
                f"Email: {message_obj.email}\n"
                f"Subject: {message_obj.subject}\n"
                f"Message:\n{message_obj.message}\n"
            )

            try:
                logger.debug(
                    f"Sending contact email: from={from_email}, to={to_email}, "
                    f"host={settings.EMAIL_HOST}, port={settings.EMAIL_PORT}, "
                    f"use_tls={settings.EMAIL_USE_TLS}, use_ssl={settings.EMAIL_USE_SSL}"
                )
                email = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=from_email,
                    to=[to_email],
                    reply_to=[message_obj.email],
                )
                email.send(fail_silently=False)
                email_sent = True
                email_status = 'sent'
                delivery_note = 'Notification email sent.'
                logger.info('Contact notification email sent to %s', to_email)
            except Exception as e:
                email_status = 'failed'
                delivery_note = 'Message saved, but notification email failed. Check server logs and SMTP settings.'
                logger.error(
                    f"Failed to send contact notification email to {to_email}: "
                    f"{type(e).__name__}: {str(e)}"
                )
                logger.exception('Full traceback for contact email failure')

        response_payload = {
            'message': 'Your message has been sent. I will get back to you soon!',
            'email_sent': email_sent,
            'email_status': email_status,
            'delivery_note': delivery_note,
        }

        return Response(response_payload, status=status.HTTP_201_CREATED)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message_obj = serializer.save()

        to_email = str(getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', '') or '').strip()
        from_email = str(getattr(settings, 'DEFAULT_FROM_EMAIL', '') or '').strip() or None
        email_sent = False
        email_status = 'not_configured'
        delivery_note = 'CONTACT_NOTIFICATION_EMAIL is not configured; message was saved in admin only.'
        debug_config = _contact_email_debug_config(to_email, from_email)

        logger.info(
            'Contact message saved: id=%s sender=%s subject_length=%s message_length=%s',
            message_obj.id,
            _mask_email(message_obj.email),
            len(str(message_obj.subject or '')),
            len(str(message_obj.message or '')),
        )
        logger.info('Contact email config: %s', debug_config)

        if to_email:
            subject = f"[Portfolio Contact] {message_obj.subject}"
            body = (
                "A new contact form message was submitted.\n\n"
                f"Name: {message_obj.name}\n"
                f"Email: {message_obj.email}\n"
                f"Subject: {message_obj.subject}\n"
                f"Message:\n{message_obj.message}\n"
            )

            try:
                if bool(getattr(settings, 'EMAIL_USE_TLS', False)) and bool(getattr(settings, 'EMAIL_USE_SSL', False)):
                    logger.warning('Contact email config has both EMAIL_USE_TLS and EMAIL_USE_SSL enabled.')
                if not str(getattr(settings, 'EMAIL_HOST', '') or '').strip():
                    logger.warning('Contact email config has empty EMAIL_HOST.')
                if not str(getattr(settings, 'EMAIL_HOST_USER', '') or '').strip():
                    logger.warning('Contact email config has empty EMAIL_HOST_USER.')
                if not str(getattr(settings, 'EMAIL_HOST_PASSWORD', '') or '').strip():
                    logger.warning('Contact email config has empty EMAIL_HOST_PASSWORD.')

                logger.debug(
                    'Contact email body preview: id=%s subject=%r body_length=%s',
                    message_obj.id,
                    subject,
                    len(body),
                )
                email = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=from_email,
                    to=[to_email],
                    reply_to=[message_obj.email],
                )
                email.send(fail_silently=False)
                email_sent = True
                email_status = 'sent'
                delivery_note = 'Notification email sent.'
                logger.info(
                    'Contact notification email sent: id=%s to=%s backend=%s host=%s port=%s',
                    message_obj.id,
                    _mask_email(to_email),
                    debug_config['email_backend'],
                    debug_config['email_host'],
                    debug_config['email_port'],
                )
            except Exception as e:
                email_status = 'failed'
                delivery_note = 'Message saved, but notification email failed. Check server logs and SMTP settings.'
                logger.error(
                    'Contact notification email failed: id=%s to=%s error_type=%s error=%s config=%s',
                    message_obj.id,
                    _mask_email(to_email),
                    type(e).__name__,
                    str(e),
                    debug_config,
                )
                logger.exception('Full traceback for contact email failure')
        else:
            logger.warning(
                'Contact notification skipped: CONTACT_NOTIFICATION_EMAIL is empty. id=%s config=%s',
                message_obj.id,
                debug_config,
            )

        response_payload = {
            'message': 'Your message has been sent. I will get back to you soon!',
            'email_sent': email_sent,
            'email_status': email_status,
            'delivery_note': delivery_note,
        }

        return Response(response_payload, status=status.HTTP_201_CREATED)
