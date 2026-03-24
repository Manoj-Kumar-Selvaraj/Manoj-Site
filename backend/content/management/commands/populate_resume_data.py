from datetime import date

from django.core.management.base import BaseCommand

from content.models import (
    Experience,
    Profile,
    ProfileStat,
    Skill,
    ToolArchitecture,
)


PROFILE_PAYLOAD = {
    'name': 'Manoj Kumar Selvaraj',
    'title': 'Cloud Platform Engineer | DevOps Engineer',
    'tagline': 'Building and modernizing enterprise DevOps platforms on AWS with reliability-first architecture.',
    'bio': (
        'Cloud and DevOps engineer focused on building, scaling, and modernizing enterprise DevOps platforms on AWS.\n\n'
        'Strong expertise across Terraform, Kubernetes, CI/CD ecosystems, IAM, and cloud networking, with hands-on delivery in '
        'large migrations, Python automation frameworks, and high-availability platform operations.\n\n'
        'Also focused on AI system evaluation, prompt engineering, and LLM agent benchmarking, combining infrastructure depth '
        'with rigorous validation of AI-driven systems.'
    ),
    'bio_extended': (
        'Core outcomes: platform reliability, migration safety, reusable automation, and measurable engineering velocity gains.\n'
        'This portfolio captures architecture practices and tooling decisions used across enterprise systems.'
    ),
    'email': 'ss.mano1998@gmail.com',
    'phone': '+91 80984 76095',
    'location': 'Bangalore, India',
    'github_url': 'https://github.com/Manoj-Kumar-Selvaraj',
    'linkedin_url': 'https://www.linkedin.com/in/manoj-kumar-selvaraj',
    'years_experience': 5,
    'projects_completed': 15,
    'is_available': True,
    'about_section_badge': 'About Me',
    'about_heading_prefix': 'Building infrastructure that',
    'about_heading_highlight': 'teams actually rely on.',
    'about_section_intro': 'Enterprise DevOps, AWS platform engineering, and AI system evaluation in production contexts.',
    'applications_section_title': 'Applications & Tooling Scope',
    'applications_section_body': (
        'Hands-on scope includes platform engineering for CI/CD ecosystems, Kubernetes operations, '
        'Terraform automation, cloud security hardening, and reliability engineering at enterprise scale.'
    ),
    'infra_section_title': 'Infrastructure & Architecture',
    'infra_section_body': (
        'Reference patterns include multi-account AWS architecture, private networking, EKS runtime platforms, '
        'policy-driven IAM, and automated delivery frameworks with observability guardrails.'
    ),
    'hero_tools_label': 'Core tools & services',
    'hero_stats_label': 'Quick stats',
}

PROFILE_STATS = [
    ('Pipelines', '15K+', 0),
    ('Terraform Workspaces', '1000+', 1),
    ('AWS Accounts', '30+', 2),
    ('EKS Clusters', '50+', 3),
]

SKILLS = [
    ('cloud', 'AWS EC2', 'amazonaws', 4, 0, True),
    ('cloud', 'AWS EKS', 'amazonaws', 4, 1, True),
    ('cloud', 'AWS ECR', 'amazonaws', 4, 2, False),
    ('cloud', 'AWS S3', 'amazonaws', 4, 3, False),
    ('cloud', 'AWS RDS', 'amazonaws', 3, 4, False),
    ('cloud', 'AWS VPC', 'amazonaws', 4, 5, False),
    ('cloud', 'AWS IAM', 'amazonaws', 4, 6, True),
    ('cloud', 'AWS KMS', 'amazonaws', 3, 7, False),
    ('cloud', 'AWS Lambda', 'amazonaws', 3, 8, False),
    ('cloud', 'Route 53', 'amazonaws', 3, 9, False),
    ('cloud', 'CloudWatch', 'amazonaws', 4, 10, True),
    ('cloud', 'CloudTrail', 'amazonaws', 3, 11, False),
    ('cloud', 'EventBridge', 'amazonaws', 3, 12, False),
    ('iac', 'Terraform', 'terraform', 4, 0, True),
    ('iac', 'CloudFormation', 'amazonaws', 3, 1, False),
    ('containers', 'Docker', 'docker', 4, 0, True),
    ('containers', 'Kubernetes', 'kubernetes', 4, 1, True),
    ('devops', 'Jenkins', 'jenkins', 4, 0, True),
    ('devops', 'GitHub Actions', 'githubactions', 4, 1, True),
    ('devops', 'Harness', 'harness', 4, 2, True),
    ('devops', 'SonarQube', 'sonarqube', 4, 3, True),
    ('devops', 'JFrog Artifactory', 'jfrog', 3, 4, True),
    ('devops', 'UDeploy', '', 3, 5, False),
    ('python', 'Python', 'python', 4, 0, True),
    ('python', 'Bash', 'gnubash', 4, 1, False),
    ('ai_llm', 'LLM Evaluation', '', 4, 0, False),
    ('ai_llm', 'Prompt Engineering', '', 4, 1, False),
    ('ai_llm', 'Agent Benchmarking', '', 4, 2, False),
]

EXPERIENCES = [
    {
        'company': 'Accenture Solutions Pvt Ltd',
        'role': 'DevOps / Cloud Engineer',
        'location': 'Bangalore, India',
        'start_date': date(2021, 1, 1),
        'end_date': None,
        'is_current': True,
        'description': 'Owned and modernized enterprise DevOps platforms across AWS, Kubernetes, and CI/CD ecosystems.',
        'highlights': [
            'Owned enterprise DevOps platforms: Jenkins, Harness, Terraform Enterprise/Cloud, GitHub Enterprise, SonarQube, JFrog, and UDeploy.',
            'Migrated 1000+ Terraform Enterprise workspaces to Terraform Cloud with automated validation workflows.',
            'Built Python automation reducing migration effort by ~50%.',
            'Led Jenkins migration from CJP to CloudBees CI, moving 15000+ pipelines and ~500 GB Jenkins home data.',
            'Implemented OIDC authentication for GitHub Actions to remove long-lived IAM credentials.',
            'Scaled ARC runners in EKS across 5 AWS accounts to support 500+ workflows/day.',
            'Led EKS upgrades across 30+ AWS accounts with workload validation and add-on compatibility checks.',
        ],
        'tech_stack': ['AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'CloudBees CI', 'GitHub Actions', 'Harness', 'Python'],
        'order': 0,
    },
    {
        'company': 'Snorkel AI',
        'role': 'AI Evaluation & Agent Benchmarking',
        'location': 'Remote',
        'start_date': date(2024, 1, 1),
        'end_date': None,
        'is_current': True,
        'description': 'Evaluated and benchmarked LLM systems and coding agents through adversarial tasks and reproducible validation environments.',
        'highlights': [
            'Reviewed and rated LLM outputs for correctness, reasoning quality, and instruction adherence.',
            'Designed prompts and adversarial coding tasks to test edge-case handling and tool use.',
            'Built validation test suites and reference fixes to assess completion accuracy.',
        ],
        'tech_stack': ['LLM Evaluation', 'Prompt Engineering', 'Agent Benchmarking', 'Python'],
        'order': 1,
    },
    {
        'company': 'Enterprise Mainframe Program',
        'role': 'Mainframe Support Engineer',
        'location': 'Bangalore, India',
        'start_date': date(2019, 1, 1),
        'end_date': date(2020, 12, 31),
        'is_current': False,
        'description': 'Supported mission-critical mainframe disbursement systems and drove scheduler migration automation.',
        'highlights': [
            'Maintained 99.99% SLA for business-critical mainframe systems.',
            'Developed Python automation to migrate 3000 jobs from ESP to StoneBranch with validation checks.',
            'Integrated batch processes with AWS-based monitoring and file transfer automation.',
        ],
        'tech_stack': ['JCL', 'COBOL', 'Python', 'StoneBranch', 'AWS Monitoring'],
        'order': 2,
    },
]

TOOL_ARCHITECTURES = [
    {
        'name': 'Terraform Platform Modernization (TFE -> TFC)',
        'order': 0,
        'role': 'Infrastructure provisioning control plane for multi-account AWS environments.\nStandardized reusable modules and policy guardrails.',
        'setup': 'Terraform Cloud workspaces mapped by environment and account.\nVCS-driven runs with variable sets, workspace policies, and state governance.',
        'usage': 'Pipeline or PR change triggers plan/apply workflows.\nAutomations validate drift, deprecated resources, and workspace readiness before migration.',
        'communication': 'Integrates with GitHub Enterprise, IAM roles, and cloud APIs.\nStatus feedback loops into CI/CD and operations dashboards.',
        'tradeoffs': 'Centralized control improves consistency but requires strict workspace hygiene.\nMigration pace depends on state quality and module standardization depth.',
    },
    {
        'name': 'Jenkins / CloudBees CI Runtime Platform',
        'order': 1,
        'role': 'Primary CI execution backbone for high-volume enterprise delivery pipelines.',
        'setup': 'CloudBees CI controllers with resilient storage and backup strategy.\nShared libraries and standardized agent templates for team-level consistency.',
        'usage': 'Build/test/deploy workflows execute per repository and release process.\nOperational playbooks handle runner capacity, failures, and upgrades.',
        'communication': 'Connects to GitHub Enterprise, Artifactory, SonarQube, and deployment tools.\nFeeds logs/metrics to monitoring and incident workflows.',
        'tradeoffs': 'Highly flexible platform with operational overhead at large scale.\nStandardization reduces team variance but can slow custom pipeline changes.',
    },
    {
        'name': 'GitHub Actions ARC on EKS',
        'order': 2,
        'role': 'Elastic runner platform for distributed GitHub Actions workloads.',
        'setup': 'ARC runners deployed across EKS clusters in multiple AWS accounts.\nOIDC-based role assumption used for short-lived AWS access.',
        'usage': 'Workflows schedule onto ARC runners based on labels and concurrency.\nAutoscaling responds to queue load while maintaining runner isolation.',
        'communication': 'GitHub Actions control plane triggers jobs; runners access AWS services via IAM roles.\nMonitoring integrates with CloudWatch alarms and platform alerts.',
        'tradeoffs': 'Great elasticity and security posture; requires Kubernetes operational maturity.\nCross-account governance and upgrade cadence are ongoing responsibilities.',
    },
    {
        'name': 'Enterprise Code Quality and Artifact Flow',
        'order': 3,
        'role': 'Quality gates and artifact governance across CI/CD pipelines.',
        'setup': 'SonarQube and JFrog integrated into Jenkins/Harness workflows.\nPlugin and runtime compatibility baselines managed during upgrades.',
        'usage': 'Builds push binaries/images after scan and policy checks pass.\nQuality metrics and failure signals block unsafe promotions.',
        'communication': 'Bi-directional integration with CI engines, scanners, and artifact repositories.\nAlerts and dashboards feed operational incident workflows.',
        'tradeoffs': 'Improves release confidence but increases pipeline dependency chain.\nVersion upgrades need pre-validation to avoid ecosystem breakage.',
    },
    {
        'name': 'Full Stack Business Management Platform (Personal Project)',
        'order': 4,
        'role': 'Business workflow platform for employee, inventory, and billing operations.',
        'setup': 'React frontend on S3 + CloudFront; Django backend on EC2 behind ALB.\nProvisioned via Terraform with IAM/networking controls.',
        'usage': 'Users interact via React SPA; Django APIs process business operations.\nCI/CD automates frontend and backend deployments.',
        'communication': 'Frontend communicates with Django APIs over HTTPS.\nBackend integrates with MySQL host through secure role-based access patterns.',
        'tradeoffs': 'Simple architecture for SMB scale with clear ownership boundaries.\nRequires disciplined infra automation and release validation for long-term maintainability.',
    },
]


class Command(BaseCommand):
    help = 'Populate portfolio content from resume-aligned defaults.'

    def handle(self, *args, **options):
        profile = Profile.objects.first()
        if not profile:
            profile = Profile()

        for key, value in PROFILE_PAYLOAD.items():
            setattr(profile, key, value)
        profile.save()

        ProfileStat.objects.filter(profile=profile).exclude(
            label__in=[item[0] for item in PROFILE_STATS]
        ).delete()

        for label, value, order in PROFILE_STATS:
            ProfileStat.objects.update_or_create(
                profile=profile,
                label=label,
                defaults={'value': value, 'order': order},
            )

        expected_skill_names = [item[1] for item in SKILLS]
        Skill.objects.exclude(name__in=expected_skill_names).update(show_in_hero=False)

        for category, name, icon, proficiency, order, show_in_hero in SKILLS:
            Skill.objects.update_or_create(
                name=name,
                defaults={
                    'category': category,
                    'icon': icon,
                    'proficiency': proficiency,
                    'order': order,
                    'show_in_hero': show_in_hero,
                },
            )

        for exp in EXPERIENCES:
            Experience.objects.update_or_create(
                company=exp['company'],
                role=exp['role'],
                defaults={
                    'location': exp['location'],
                    'start_date': exp['start_date'],
                    'end_date': exp['end_date'],
                    'is_current': exp['is_current'],
                    'description': exp['description'],
                    'highlights': exp['highlights'],
                    'tech_stack': exp['tech_stack'],
                    'order': exp['order'],
                },
            )

        ToolArchitecture.objects.all().delete()
        for item in TOOL_ARCHITECTURES:
            ToolArchitecture.objects.create(**item)

        self.stdout.write(self.style.SUCCESS('Resume-aligned data populated successfully.'))
