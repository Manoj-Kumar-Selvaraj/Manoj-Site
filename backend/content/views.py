from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Profile, Skill, Project, Experience,
    BlogPost, Activity, Certification, ContactMessage,
    SKILL_CATEGORIES
)
from .serializers import (
    ProfileSerializer, SkillSerializer, ProjectSerializer,
    ExperienceSerializer, BlogPostListSerializer, BlogPostDetailSerializer,
    ActivitySerializer, CertificationSerializer, ContactMessageSerializer
)


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
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['featured', 'status']
    search_fields = ['title', 'description']
    lookup_field = 'slug'


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


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Your message has been sent. I will get back to you soon!'},
            status=status.HTTP_201_CREATED
        )
