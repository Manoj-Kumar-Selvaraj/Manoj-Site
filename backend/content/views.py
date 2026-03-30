from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
import logging
from django.conf import settings
from django.core.mail import send_mail
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


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactSubmitRateThrottle]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message_obj = serializer.save()

        to_email = str(getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', '') or '').strip()
        from_email = str(getattr(settings, 'DEFAULT_FROM_EMAIL', '') or '').strip() or None
        email_sent = False
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

            # Do not fail the API call if SMTP is temporarily unavailable;
            # the message remains stored in admin for manual follow-up.
            try:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=from_email,
                    recipient_list=[to_email],
                    fail_silently=False,
                )
                email_sent = True
            except Exception:
                logger.exception('Failed to send contact notification email.')
                delivery_note = 'Notification email failed; message was still saved in admin.'
        else:
            delivery_note = 'CONTACT_NOTIFICATION_EMAIL is not configured; message was saved in admin only.'

        response_payload = {
            'message': 'Your message has been sent. I will get back to you soon!',
            'email_sent': email_sent,
        }
        if delivery_note:
            response_payload['delivery_note'] = delivery_note

        return Response(
            response_payload,
            status=status.HTTP_201_CREATED
        )
