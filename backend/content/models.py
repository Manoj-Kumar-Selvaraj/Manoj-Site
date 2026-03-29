from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class Profile(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=300, help_text="e.g. Cloud Platform | DevOps | LLM Benchmarking")
    tagline = models.CharField(max_length=500, blank=True)
    about_section_badge = models.CharField(
        max_length=80,
        blank=True,
        default='Tools & Architecture',
        help_text='Small label shown above the About heading.',
    )
    about_heading_prefix = models.CharField(
        max_length=200,
        blank=True,
        default='Platform tooling and systems',
        help_text='First line of the About heading.',
    )
    about_heading_highlight = models.CharField(
        max_length=200,
        blank=True,
        default='engineered to scale.',
        help_text='Highlighted second line of the About heading.',
    )
    about_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='An overview of the tools, platforms, and architecture patterns I work with.',
        help_text='Short intro text shown under the About heading.',
    )
    hero_tools_label = models.CharField(
        max_length=120,
        blank=True,
        default='Core tools & services',
        help_text='Heading shown above hero tool chips.',
    )
    hero_stats_label = models.CharField(
        max_length=120,
        blank=True,
        default='Quick stats',
        help_text='Heading shown above hero stats cards.',
    )
    experience_section_badge = models.CharField(max_length=80, blank=True, default='Work History')
    experience_section_title = models.CharField(max_length=200, blank=True, default='Experience')
    experience_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='Platform engineering and large-scale migrations.',
    )
    current_focus_section_badge = models.CharField(max_length=80, blank=True, default='Current Focus')
    current_focus_section_title = models.CharField(
        max_length=200,
        blank=True,
        default='What I am actively improving right now.',
    )
    current_focus_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='The engineering areas, systems, and capabilities I am investing in at the moment.',
    )
    current_focus_cta_label = models.CharField(
        max_length=100,
        blank=True,
        default='Discuss these initiatives',
    )
    projects_section_badge = models.CharField(max_length=80, blank=True, default='Portfolio')
    projects_section_title = models.CharField(max_length=200, blank=True, default='Projects & Initiatives')
    projects_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='Large-scale migrations, automation frameworks, and full-stack systems built in production.',
    )
    projects_empty_text = models.CharField(max_length=160, blank=True, default='Projects coming soon.')
    projects_view_all_label = models.CharField(max_length=80, blank=True, default='View All Projects')
    blog_section_badge = models.CharField(max_length=80, blank=True, default='Writing')
    blog_section_title = models.CharField(max_length=200, blank=True, default='Latest Posts')
    blog_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='Thoughts on AI, DevOps, cloud infrastructure and engineering.',
    )
    blog_view_all_label = models.CharField(max_length=80, blank=True, default='Read All Posts')
    certifications_section_badge = models.CharField(max_length=80, blank=True, default='Credentials')
    certifications_section_title = models.CharField(max_length=200, blank=True, default='Certifications')
    open_source_section_badge = models.CharField(max_length=80, blank=True, default='Open Source')
    open_source_section_title = models.CharField(max_length=200, blank=True, default='Open Source Contributions')
    open_source_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default='Projects, fixes, and tooling contributions shared with the community.',
    )
    contact_section_badge = models.CharField(max_length=80, blank=True, default='Contact')
    contact_section_title = models.CharField(max_length=200, blank=True, default="Let's Work Together")
    contact_section_intro = models.CharField(
        max_length=300,
        blank=True,
        default="Send a message and I'll get back to you.",
    )
    bio = models.TextField(
        verbose_name="Opening bio",
        help_text="Short bio used in the hero/intro (use blank lines to split paragraphs).",
    )
    bio_extended = models.TextField(
        blank=True,
        verbose_name="Tooling & architecture details",
        help_text="Detailed write-up shown in the Tools & Architecture section (optional).",
    )
    applications_section_title = models.CharField(
        max_length=200,
        blank=True,
        default='Applications',
        help_text='Title for the applications detail section.',
    )
    applications_section_body = models.TextField(
        blank=True,
        default='',
        help_text='Describe the applications you have built or maintain. Supports plain text.',
    )
    infra_section_title = models.CharField(
        max_length=200,
        blank=True,
        default='Infrastructure & Architecture',
        help_text='Title for the infrastructure / architecture section.',
    )
    infra_section_body = models.TextField(
        blank=True,
        default='',
        help_text='Describe your infrastructure architecture and design decisions.',
    )
    infra_diagram = models.ImageField(
        'Infrastructure diagram',
        upload_to='infra/',
        blank=True,
        null=True,
        help_text='Upload an infrastructure diagram or architecture image (optional).',
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
    icon = models.CharField(
        max_length=100,
        blank=True,
        help_text='Simple Icons slug (e.g. githubactions, terraform, docker). Leave blank if you upload a custom icon instead.',
    )
    icon_upload = models.ImageField(
        upload_to='skills/',
        blank=True,
        null=True,
        help_text='Upload a custom icon for brands not available on the CDN.',
    )
    proficiency = models.IntegerField(choices=PROFICIENCY_LEVELS, default=3)
    order = models.PositiveIntegerField(default=0)
    show_in_hero = models.BooleanField(
        default=False,
        help_text='Enable to show this skill in the Hero tools strip.',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'order', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def save(self, *args, **kwargs):
        previous_icon_name = None
        previous_storage = None

        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).only('icon_upload').first()
            if previous and previous.icon_upload:
                previous_icon_name = previous.icon_upload.name
                previous_storage = previous.icon_upload.storage

        super().save(*args, **kwargs)

        current_icon_name = self.icon_upload.name if self.icon_upload else None
        if previous_icon_name and previous_icon_name != current_icon_name and previous_storage:
            previous_storage.delete(previous_icon_name)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class ArchitectureEntry(models.Model):
    title = models.CharField(max_length=200)
    purpose = models.TextField(
        blank=True,
        help_text='What this application/tool does and its real-world use case.',
    )
    context = models.CharField(
        max_length=200,
        blank=True,
        help_text='Optional app/system context (e.g. CI/CD platform, observability stack).',
    )
    tools = models.CharField(
        max_length=400,
        blank=True,
        help_text='Comma-separated tools/services (e.g. EKS, Jenkins, SonarQube, EC2).',
    )
    architecture = models.TextField(
        blank=True,
        help_text='Deep details on architecture, workflows, and operational design (optional when diagram image is uploaded).',
    )
    diagram_text = models.CharField(
        max_length=500,
        blank=True,
        help_text='Optional textual flow (e.g. User -> React -> Django API -> Lambda -> MySQL).',
    )
    diagram_image = models.ImageField(
        upload_to='architecture/',
        blank=True,
        null=True,
        help_text='Optional architecture diagram image.',
    )
    key_outcomes = models.TextField(
        blank=True,
        help_text='Optional outcomes, one per line.',
    )
    challenges_solutions = models.TextField(
        blank=True,
        help_text='Optional challenge and solution notes. Use one line per point.',
    )
    performance_optimizations = models.TextField(
        blank=True,
        help_text='Optional optimization notes. Use one line per point.',
    )
    integration_points = models.TextField(
        blank=True,
        help_text='Optional external integrations (mainframe, AWS services, third-party APIs). One line per point.',
    )
    deployment_strategy = models.TextField(
        blank=True,
        help_text='Optional deployment strategy notes. One line per point.',
    )
    order = models.PositiveIntegerField(default=0)
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Architecture Entry'
        verbose_name_plural = 'Architecture Entries'

    def clean(self):
        if not (str(self.architecture or '').strip() or self.diagram_image):
            raise ValidationError('Provide either an architecture overview or an architecture diagram image.')

    def __str__(self):
        return self.title


class CurrentFocusItem(models.Model):
    title = models.CharField(max_length=180)
    note = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Current Focus Item'
        verbose_name_plural = 'Current Focus Items'

    def __str__(self):
        return self.title


class ToolArchitecture(models.Model):
    name = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    role = models.TextField(blank=True, default='')
    setup = models.TextField(blank=True, default='')
    usage = models.TextField(blank=True, default='')
    communication = models.TextField(blank=True, default='')
    tradeoffs = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Tool Architecture'
        verbose_name_plural = 'Tool Architectures'

    def __str__(self):
        return self.name


PROJECT_STATUS = [
    ('completed', 'Completed'),
    ('in_progress', 'In Progress'),
    ('archived', 'Archived'),
]


class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, max_length=120)
    description = models.TextField(help_text='Short impact summary shown at the top of the project card. Keep it to 2-3 lines.')
    long_description = models.TextField(blank=True, help_text='Optional supporting narrative. Use short paragraphs only when needed.')
    impact_metrics = models.TextField(
        blank=True,
        help_text='One metric per line, e.g. Migrated 1,000+ workspaces or Reduced effort by 50%.',
    )
    role_ownership = models.TextField(
        blank=True,
        help_text='One responsibility per line, e.g. Designed migration workflow, built automation, owned validation.',
    )
    architecture_source = models.TextField(
        blank=True,
        help_text='Source system or starting state. Short paragraph or one line.',
    )
    architecture_target = models.TextField(
        blank=True,
        help_text='Target system or destination architecture. Short paragraph or one line.',
    )
    architecture_components = models.TextField(
        blank=True,
        help_text='Main components/services, one per line.',
    )
    architecture_data_flow = models.TextField(
        blank=True,
        help_text='Step-by-step data/control flow, one step per line.',
    )
    workflow_steps = models.TextField(
        blank=True,
        help_text='Execution workflow, one step per line.',
    )
    challenges_solutions = models.TextField(
        blank=True,
        help_text='Use paired lines: Challenge: ... and Solution: ... Repeat for each pair.',
    )
    performance_optimizations = models.TextField(
        blank=True,
        help_text='One optimization per line.',
    )
    before_state = models.TextField(
        blank=True,
        help_text='Short description of the before state.',
    )
    after_state = models.TextField(
        blank=True,
        help_text='Short description of the after state.',
    )
    tech_stack = models.JSONField(default=list, help_text='List of tech strings e.g. ["Python", "Docker", "AWS"]')
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    architecture_diagram = models.ImageField(
        upload_to='projects/architecture/',
        blank=True,
        null=True,
        help_text='Optional architecture/system diagram image for this project.',
    )
    architecture_caption = models.CharField(
        max_length=240,
        blank=True,
        help_text='Short caption shown under the architecture diagram.',
    )
    architecture_notes = models.TextField(
        blank=True,
        help_text='Detailed architecture explanation (components, flow, scaling, reliability).',
    )
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


class OpenSourceContribution(models.Model):
    title = models.CharField(max_length=300)
    repository = models.CharField(max_length=200, blank=True)
    summary = models.TextField()
    contribution_type = models.CharField(max_length=120, blank=True, help_text='e.g. Feature, Bug Fix, Docs, Tooling')
    contribution_date = models.DateField(blank=True, null=True)
    contribution_url = models.URLField(blank=True)
    tags = models.JSONField(default=list, help_text='List of tag strings')
    order = models.PositiveIntegerField(default=0)
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', '-contribution_date', 'id']
        verbose_name = 'Open Source Contribution'
        verbose_name_plural = 'Open Source Contributions'

    def __str__(self):
        repo = f" ({self.repository})" if self.repository else ''
        return f"{self.title}{repo}"


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
