from rest_framework import serializers
from django.conf import settings
import time
from .models import (
    Profile, ProfileStat, Skill, ArchitectureEntry, CurrentFocusItem, ToolArchitecture,
    Project, Experience, BlogPost, Activity, Certification, OpenSourceContribution, ContactMessage
)


class ProfileStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileStat
        fields = ['label', 'value', 'order']


class ProfileSerializer(serializers.ModelSerializer):
    stats = ProfileStatSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id',
            'name',
            'title',
            'tagline',
            'about_section_badge',
            'about_heading_prefix',
            'about_heading_highlight',
            'about_section_intro',
            'hero_stats_label',
            'experience_section_badge',
            'experience_section_title',
            'experience_section_intro',
            'projects_section_badge',
            'projects_section_title',
            'projects_section_intro',
            'projects_empty_text',
            'projects_view_all_label',
            'blog_section_badge',
            'blog_section_title',
            'blog_section_intro',
            'blog_view_all_label',
            'certifications_section_badge',
            'certifications_section_title',
            'open_source_section_badge',
            'open_source_section_title',
            'open_source_section_intro',
            'contact_section_badge',
            'contact_section_title',
            'contact_section_intro',
            'bio',
            'bio_extended',
            'avatar',
            'resume',
            'email',
            'phone',
            'location',
            'github_url',
            'linkedin_url',
            'years_experience',
            'projects_completed',
            'is_available',
            'stats',
        ]


class SkillSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    proficiency_display = serializers.CharField(source='get_proficiency_display', read_only=True)
    icon_upload_url = serializers.SerializerMethodField()

    def get_icon_upload_url(self, obj):
        if not obj.icon_upload:
            return ''

        url = obj.icon_upload.url
        request = self.context.get('request')
        if request:
            url = request.build_absolute_uri(url)

        version = int(obj.updated_at.timestamp()) if obj.updated_at else 0
        separator = '&' if '?' in url else '?'
        return f'{url}{separator}v={version}'

    class Meta:
        model = Skill
        fields = [
            'id',
            'category',
            'category_display',
            'name',
            'icon',
            'icon_upload',
            'icon_upload_url',
            'proficiency',
            'proficiency_display',
            'order',
            'show_in_hero',
            'updated_at',
        ]


class ArchitectureEntrySerializer(serializers.ModelSerializer):
    tools_list = serializers.SerializerMethodField()
    outcomes_list = serializers.SerializerMethodField()
    diagram_image_url = serializers.SerializerMethodField()

    def get_tools_list(self, obj):
        return [p.strip() for p in str(obj.tools or '').split(',') if p.strip()]

    def get_outcomes_list(self, obj):
        return [line.strip() for line in str(obj.key_outcomes or '').splitlines() if line.strip()]

    def get_diagram_image_url(self, obj):
        if not obj.diagram_image:
            return ''

        url = obj.diagram_image.url
        request = self.context.get('request')
        if request:
            url = request.build_absolute_uri(url)
        return url

    class Meta:
        model = ArchitectureEntry
        fields = [
            'id',
            'title',
            'purpose',
            'context',
            'tools',
            'architecture',
            'diagram_text',
            'diagram_image',
            'key_outcomes',
            'challenges_solutions',
            'performance_optimizations',
            'integration_points',
            'deployment_strategy',
            'tools_list',
            'outcomes_list',
            'diagram_image_url',
        ]


class CurrentFocusItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentFocusItem
        fields = ['id', 'title', 'note']


class ToolArchitectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolArchitecture
        fields = ['id', 'name', 'role', 'setup', 'usage', 'communication', 'tradeoffs']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'long_description',
            'tech_stack',
            'github_url',
            'live_url',
            'image',
            'architecture_diagram',
            'architecture_caption',
            'architecture_notes',
            'status',
            'featured',
        ]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id',
            'company',
            'role',
            'location',
            'start_date',
            'end_date',
            'is_current',
            'description',
            'highlights',
            'tech_stack',
            'company_logo',
            'company_url',
        ]


class BlogPostListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id',
            'slug',
            'title',
            'summary',
            'cover_image',
            'tags',
            'featured',
            'views',
            'created_at',
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id',
            'slug',
            'title',
            'summary',
            'content',
            'cover_image',
            'tags',
            'featured',
            'views',
            'created_at',
        ]


class ActivitySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'activity_type',
            'activity_type_display',
            'date',
            'link',
            'tags',
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id',
            'name',
            'issuer',
            'issue_date',
            'expiry_date',
            'credential_id',
            'credential_url',
            'image',
        ]


class OpenSourceContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpenSourceContribution
        fields = [
            'id',
            'title',
            'repository',
            'summary',
            'contribution_type',
            'contribution_date',
            'contribution_url',
            'tags',
        ]


class ContactMessageSerializer(serializers.ModelSerializer):
    # Honeypot field: hidden on UI, but often filled by bots.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)
    # Epoch milliseconds captured when the form first rendered in browser.
    form_loaded_at = serializers.IntegerField(required=False, write_only=True)

    def validate(self, attrs):
        require_timing = str(getattr(settings, 'CONTACT_REQUIRE_FORM_TIMING', True)).lower() not in {'0', 'false', 'no'}
        min_fill_ms = int(getattr(settings, 'CONTACT_MIN_FORM_FILL_MS', 2500) or 2500)

        submitted_at = attrs.get('form_loaded_at')
        if require_timing and submitted_at is None:
            raise serializers.ValidationError({'non_field_errors': ['Please wait a moment before sending.']})

        if submitted_at is not None:
            now_ms = int(time.time() * 1000)
            elapsed_ms = now_ms - int(submitted_at)
            if elapsed_ms < min_fill_ms:
                raise serializers.ValidationError({'non_field_errors': ['Please wait a moment before sending.']})

        return attrs

    def validate_website(self, value):
        if str(value or '').strip():
            raise serializers.ValidationError('Invalid submission.')
        return ''

    def create(self, validated_data):
        validated_data.pop('website', None)
        validated_data.pop('form_loaded_at', None)
        return super().create(validated_data)

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message', 'website', 'form_loaded_at']
