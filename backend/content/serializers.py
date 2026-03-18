from rest_framework import serializers
from .models import (
    Profile, ProfileStat, AboutFocusArea, AboutCareerItem, Skill, Project, Experience,
    BlogPost, Activity, Certification, ContactMessage
)


class ProfileStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileStat
        fields = ['label', 'value', 'order']


class AboutFocusAreaSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()

    class Meta:
        model = AboutFocusArea
        fields = ['title', 'points', 'order']

    def get_points(self, obj):
        return obj.points()


class AboutCareerItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutCareerItem
        fields = ['text', 'order']


class ProfileSerializer(serializers.ModelSerializer):
    stats = ProfileStatSerializer(many=True, read_only=True)
    about_focus_areas = AboutFocusAreaSerializer(many=True, read_only=True)
    about_career_items = AboutCareerItemSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    proficiency_display = serializers.CharField(source='get_proficiency_display', read_only=True)

    class Meta:
        model = Skill
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
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']
