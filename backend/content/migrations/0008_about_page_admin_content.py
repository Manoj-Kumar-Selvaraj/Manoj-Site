from django.db import migrations, models
import django.db.models.deletion


def seed_about_content(apps, schema_editor):
    Profile = apps.get_model('content', 'Profile')
    AboutFocusArea = apps.get_model('content', 'AboutFocusArea')
    AboutCareerItem = apps.get_model('content', 'AboutCareerItem')

    focus_defaults = [
        ('Cloud Infrastructure', 'AWS multi-account environments\nNetworking, IAM, and infrastructure architecture'),
        ('Platform Engineering', 'CI/CD platforms\nDeveloper infrastructure'),
        ('Infrastructure Automation', 'Terraform infrastructure\nPython operational automation'),
        ('AI Systems', 'AI code evaluation\nBenchmarking environments'),
    ]
    career_defaults = [
        'Started career supporting mission-critical mainframe systems',
        'Transitioned into cloud infrastructure and DevOps platforms',
        'Worked on enterprise platform engineering environments',
        'Focused on large-scale migrations and platform reliability',
    ]

    for profile in Profile.objects.all():
        if not AboutFocusArea.objects.filter(profile=profile).exists():
            for index, (title, points_text) in enumerate(focus_defaults):
                AboutFocusArea.objects.create(
                    profile=profile,
                    title=title,
                    points_text=points_text,
                    order=index,
                )

        if not AboutCareerItem.objects.filter(profile=profile).exists():
            for index, text in enumerate(career_defaults):
                AboutCareerItem.objects.create(
                    profile=profile,
                    text=text,
                    order=index,
                )


def unseed_about_content(apps, schema_editor):
    AboutFocusArea = apps.get_model('content', 'AboutFocusArea')
    AboutCareerItem = apps.get_model('content', 'AboutCareerItem')
    AboutFocusArea.objects.all().delete()
    AboutCareerItem.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0007_profile_about_content_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='about_career_badge',
            field=models.CharField(blank=True, default='Journey', help_text='Small badge shown in the career background card.', max_length=80),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_career_title',
            field=models.CharField(blank=True, default='Career Background', help_text='Title for the career background card.', max_length=120),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_cta_label',
            field=models.CharField(blank=True, default="Let's Talk", help_text='Primary call-to-action label for the About section.', max_length=80),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_focus_badge',
            field=models.CharField(blank=True, default='Core Areas', help_text='Small badge shown in the engineering focus section.', max_length=80),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_focus_intro',
            field=models.CharField(blank=True, default='Detailed but easy to scan across the systems I spend the most time building.', help_text='Short intro line for the engineering focus section.', max_length=300),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_focus_title',
            field=models.CharField(blank=True, default='Engineering Focus', help_text='Title for the engineering focus section.', max_length=120),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_metrics_badge',
            field=models.CharField(blank=True, default='At a Glance', help_text='Small badge shown in the metrics section.', max_length=80),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_metrics_intro',
            field=models.CharField(blank=True, default='A quick engineering snapshot across platform scale, delivery volume, and operating footprint.', help_text='Short intro line for the metrics section.', max_length=300),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_metrics_title',
            field=models.CharField(blank=True, default='Impact Metrics', help_text='Title for the metrics section.', max_length=120),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_notes_intro',
            field=models.CharField(blank=True, default='Additional context from the portfolio profile, kept in shorter paragraphs for fast scanning.', help_text='Short intro line for the detailed notes section.', max_length=300),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_notes_title',
            field=models.CharField(blank=True, default='Profile Notes', help_text='Title for the detailed notes section.', max_length=120),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_role',
            field=models.CharField(blank=True, default='Platform Engineer | Cloud Infrastructure | DevOps', help_text='Role line shown under your name in the About profile card.', max_length=300),
        ),
        migrations.AddField(
            model_name='profile',
            name='projects_completed_label',
            field=models.CharField(blank=True, default='Infrastructure Projects', help_text='Label shown for the projects completed metric.', max_length=120),
        ),
        migrations.AddField(
            model_name='profile',
            name='years_experience_label',
            field=models.CharField(blank=True, default='Years in Engineering', help_text='Label shown for the years experience metric.', max_length=120),
        ),
        migrations.CreateModel(
            name='AboutFocusArea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=120)),
                ('points_text', models.TextField(help_text='Enter one bullet point per line.')),
                ('order', models.PositiveIntegerField(default=0)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='about_focus_areas', to='content.profile')),
            ],
            options={
                'verbose_name': 'About Focus Area',
                'verbose_name_plural': 'About Focus Areas',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='AboutCareerItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='about_career_items', to='content.profile')),
            ],
            options={
                'verbose_name': 'About Career Item',
                'verbose_name_plural': 'About Career Items',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.RunPython(seed_about_content, unseed_about_content),
    ]
