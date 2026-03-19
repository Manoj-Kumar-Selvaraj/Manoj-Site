import csv
import json

from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import (
    Profile, ProfileStat, Skill, Project, Experience,
    BlogPost, Activity, Certification, ContactMessage
)


class ProfileStatInline(admin.TabularInline):
    model = ProfileStat
    extra = 1          # always show one blank row so adding is obvious
    min_num = 0
    fields = ('label', 'value', 'order')
    ordering = ('order', 'id')
    verbose_name = 'Stat'
    verbose_name_plural = 'Stats (add as many as you like)'


@admin.register(ProfileStat)
class ProfileStatAdmin(admin.ModelAdmin):
    list_display = ['label', 'value', 'order', 'profile']
    list_display_links = ['label']
    list_filter = ['profile']
    list_editable = ['value', 'order']
    search_fields = ['label', 'value', 'profile__name']
    ordering = ['profile', 'order', 'id']
    # pre-select the first profile when adding via this standalone page
    def get_changeform_initial_data(self, request):
        from .models import Profile
        first = Profile.objects.first()
        return {'profile': first.pk} if first else {}


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'email', 'phone', 'is_available', 'updated_at']
    readonly_fields = ['avatar_preview']
    inlines = [ProfileStatInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'title', 'tagline', 'avatar', 'avatar_preview', 'email', 'phone', 'location', 'is_available')
        }),
        ('About Section Content', {
            'fields': ('about_section_badge', 'about_heading_prefix', 'about_heading_highlight', 'about_section_intro')
        }),
        ('Bio', {
            'fields': ('bio', 'bio_extended', 'resume')
        }),
        ('Stats', {
            'fields': ('years_experience', 'projects_completed')
        }),
        ('Social Links', {
            'fields': ('github_url', 'linkedin_url', 'twitter_url', 'website_url'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description='Current photo')
    def avatar_preview(self, obj):
        if obj and obj.avatar:
            return format_html(
                '<img src="{}" alt="Profile photo" style="height:96px;width:96px;object-fit:cover;border-radius:12px;border:1px solid #d1d5db;" />',
                obj.avatar.url,
            )
        return 'No photo uploaded yet.'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'proficiency', 'order']
    list_filter = ['category', 'proficiency']
    list_editable = ['order', 'proficiency']
    ordering = ['category', 'order']
    search_fields = ['name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'featured', 'order', 'created_at']
    list_filter = ['status', 'featured']
    list_editable = ['featured', 'order', 'status']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description', 'long_description', 'image')
        }),
        ('Links', {
            'fields': ('github_url', 'live_url')
        }),
        ('Tech & Status', {
            'fields': ('tech_stack', 'status', 'featured', 'order')
        }),
    )


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['role', 'company', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current']
    ordering = ['-start_date']
    fieldsets = (
        ('Position', {
            'fields': ('role', 'company', 'location', 'company_url', 'company_logo')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'is_current')
        }),
        ('Details', {
            'fields': ('description', 'highlights', 'tech_stack', 'order')
        }),
    )


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'published', 'featured', 'views', 'created_at']
    list_filter = ['published', 'featured']
    list_editable = ['published', 'featured']
    search_fields = ['title', 'summary']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'summary', 'content', 'cover_image')
        }),
        ('Meta', {
            'fields': ('tags', 'published', 'featured')
        }),
    )


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity_type', 'date', 'published']
    date_hierarchy = 'date'
    list_filter = [
        'activity_type',
        ('date', admin.DateFieldListFilter),
        'published',
    ]
    list_editable = ['published']
    search_fields = ['title', 'description']
    ordering = ['-date']

    actions = ['export_as_csv']

    @admin.action(description='Export selected activities (CSV)')
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="activities.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'date',
            'activity_type',
            'activity_type_display',
            'title',
            'description',
            'link',
            'tags',
            'published',
        ])

        for a in queryset.order_by('-date', 'id'):
            writer.writerow([
                a.date.isoformat() if a.date else '',
                a.activity_type,
                a.get_activity_type_display(),
                a.title,
                a.description,
                a.link,
                json.dumps(a.tags or [], ensure_ascii=False),
                'yes' if a.published else 'no',
            ])

        return response


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuer', 'issue_date', 'expiry_date']
    ordering = ['-issue_date']
    search_fields = ['name', 'issuer']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'read', 'replied', 'created_at']
    list_filter = ['read', 'replied']
    list_editable = ['read', 'replied']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        return False
