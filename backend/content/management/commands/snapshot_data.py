"""content.management.commands.snapshot_data

Create a snapshot of admin-managed portfolio content (backend data).

This produces a JSON fixture you can commit or back up, and later restore with:
  python manage.py loaddata <snapshot-file>.json

Usage:
  python manage.py snapshot_data
  python manage.py snapshot_data --output snapshots/portfolio_snapshot.json
"""

from __future__ import annotations

import datetime
import io
from pathlib import Path

from django.conf import settings
from django.core.management import BaseCommand, call_command


class Command(BaseCommand):
    help = 'Export a JSON snapshot of portfolio content.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            default='',
            help='Output file path (relative to backend/). Defaults to snapshots/portfolio_YYYYMMDD_HHMMSS.json',
        )

    def handle(self, *args, **options):
        ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        default_name = f'portfolio_{ts}.json'

        out_arg = str(options.get('output') or '').strip()
        if out_arg:
            out_path = Path(settings.BASE_DIR) / out_arg
        else:
            out_path = Path(settings.BASE_DIR) / 'snapshots' / default_name

        out_path.parent.mkdir(parents=True, exist_ok=True)

        # Export only the content that powers the public site.
        app_labels = [
            'content.profile',
            'content.profilestat',
            'content.skill',
            'content.project',
            'content.experience',
            'content.activity',
            'content.certification',
            'content.blogpost',
        ]

        buffer = io.StringIO()
        call_command('dumpdata', *app_labels, indent=2, stdout=buffer)
        out_path.write_text(buffer.getvalue(), encoding='utf-8')

        self.stdout.write(self.style.SUCCESS(f'Snapshot written: {out_path}'))
