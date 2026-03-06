"""content.management.commands.seed_data

Admin-driven portfolio.

This project is intended to be managed via Django Admin (Profile/Skills/Projects/
Experience/Activities/Blog/Certifications).

This command exists only for *clearing* data during development.

Usage:
  python manage.py seed_data --clear
"""

from django.core.management.base import BaseCommand

from content.models import Activity, Experience, Profile, Project, Skill


class Command(BaseCommand):
    help = 'Admin-driven mode: only supports clearing existing content.'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data')

    def handle(self, *args, **options):
        if options.get('clear'):
            Activity.objects.all().delete()
            Experience.objects.all().delete()
            Project.objects.all().delete()
            Skill.objects.all().delete()
            Profile.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared all content.'))
            self.stdout.write(self.style.SUCCESS('Visit http://localhost:8000/admin/ to create content.'))
            return

        self.stdout.write(self.style.WARNING('Admin-driven mode: no seed data is generated.'))
        self.stdout.write(self.style.SUCCESS('Visit http://localhost:8000/admin/ to manage content.'))
