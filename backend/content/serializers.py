from rest_framework import serializers
from .models import (
    Profile, ProfileStat, Skill, ArchitectureEntry, CurrentFocusItem, ToolArchitecture,
    Project, Experience, BlogPost, Activity, Certification, ContactMessage
)


class ProfileStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileStat
        fields = ['label', 'value', 'order']


class ProfileSerializer(serializers.ModelSerializer):
    stats = ProfileStatSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'


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
        fields = '__all__'


class CurrentFocusItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentFocusItem
        fields = '__all__'


class ToolArchitectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolArchitecture
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'


class BlogPostListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        exclude = ['content']


class BlogPostDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    # Honeypot field: hidden on UI, but often filled by bots.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_website(self, value):
        if str(value or '').strip():
            raise serializers.ValidationError('Invalid submission.')
        return ''

    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message', 'website']
