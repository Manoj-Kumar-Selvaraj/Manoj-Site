from django.db import models
from django.utils.text import slugify


class Profile(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=300, help_text="e.g. Cloud Platform | DevOps | LLM Benchmarking")
    tagline = models.CharField(max_length=500, blank=True)
    bio = models.TextField(
        verbose_name="Opening bio",
        help_text="Short bio used in the hero/intro (use blank lines to split paragraphs).",
    )
    bio_extended = models.TextField(
        blank=True,
        verbose_name="About me (detailed)",
        help_text="Detailed bio shown on the About section (optional).",
    )
    avatar = models.ImageField(
        'Profile photo',
        upload_to='profile/',
        blank=True,
        null=True,
        help_text='Upload your profile image (used in Hero and About sections).',
    )
    resume = models.FileField(upload_to='resume/', blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, help_text="Public contact number shown on site (e.g. +9180...)")
    location = models.CharField(max_length=200, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    projects_completed = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True, help_text="Show 'Open to work' badge")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"

    def __str__(self):
        return self.name


class ProfileStat(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='stats')
    label = models.CharField(max_length=80, help_text="e.g. Years in tech, Certifications, Clients")
    value = models.CharField(max_length=40, help_text="e.g. 5+, 12, 99.9%")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Profile Stat"
        verbose_name_plural = "Profile Stats"

    def __str__(self):
        return f"{self.label}: {self.value}"


SKILL_CATEGORIES = [
    ('cloud', 'Cloud Infrastructure'),
    ('iac', 'Infrastructure as Code'),
    ('containers', 'Containers & Kubernetes'),
    ('devops', 'DevOps Platforms'),
    ('python', 'Programming & Automation'),
    ('ai_llm', 'AI System Evaluation'),
]

PROFICIENCY_LEVELS = [
    (1, 'Beginner'),
    (2, 'Intermediate'),
    (3, 'Advanced'),
    (4, 'Expert'),
]


class Skill(models.Model):
    category = models.CharField(max_length=50, choices=SKILL_CATEGORIES)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True, help_text="Icon name from devicons or simple-icons (e.g. python, docker)")
    proficiency = models.IntegerField(choices=PROFICIENCY_LEVELS, default=3)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category', 'order', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


PROJECT_STATUS = [
    ('completed', 'Completed'),
    ('in_progress', 'In Progress'),
    ('archived', 'Archived'),
]


class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    tech_stack = models.JSONField(default=list, help_text='List of tech strings e.g. ["Python", "Docker", "AWS"]')
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=PROJECT_STATUS, default='completed')
    featured = models.BooleanField(default=False, help_text="Show in home page featured section")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', 'order', '-created_at']
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Experience(models.Model):
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True, help_text="Leave blank if current")
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    highlights = models.JSONField(default=list, help_text='List of bullet point highlights')
    tech_stack = models.JSONField(default=list)
    company_logo = models.ImageField(upload_to='companies/', blank=True, null=True)
    company_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_current', '-start_date']
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"

    def __str__(self):
        return f"{self.role} @ {self.company}"


ACTIVITY_TYPES = [
    ('project', 'Project'),
    ('learning', 'Learning'),
    ('debugging', 'Debugging / Problem Solved'),
    ('achievement', 'Achievement'),
    ('contribution', 'Open Source Contribution'),
    ('research', 'Research'),
    ('certification', 'Certification'),
    ('talk', 'Talk / Presentation'),
]


class BlogPost(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True, blank=True)
    summary = models.TextField(max_length=500)
    content = models.TextField(help_text="Supports Markdown")
    cover_image = models.ImageField(upload_to='blog/', blank=True, null=True)
    tags = models.JSONField(default=list, help_text='List of tag strings')
    published = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Activity(models.Model):
    title = models.CharField(max_length=300)
    description = models.TextField()
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    date = models.DateField()
    link = models.URLField(blank=True)
    tags = models.JSONField(default=list)
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Activity"
        verbose_name_plural = "Activities"

    def __str__(self):
        return f"[{self.get_activity_type_display()}] {self.title}"


class Certification(models.Model):
    name = models.CharField(max_length=300)
    issuer = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=200, blank=True)
    credential_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='certifications/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-issue_date']
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"

    def __str__(self):
        return f"{self.name} — {self.issuer}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    read = models.BooleanField(default=False)
    replied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"[{'Read' if self.read else 'Unread'}] {self.subject} from {self.name}"
