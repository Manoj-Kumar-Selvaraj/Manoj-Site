from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0021_project_case_study_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='current_focus_cta_label',
            field=models.CharField(blank=True, default='Discuss these initiatives', max_length=100),
        ),
        migrations.AddField(
            model_name='profile',
            name='current_focus_section_badge',
            field=models.CharField(blank=True, default='Current Focus', max_length=80),
        ),
        migrations.AddField(
            model_name='profile',
            name='current_focus_section_intro',
            field=models.CharField(blank=True, default='The engineering areas, systems, and capabilities I am investing in at the moment.', max_length=300),
        ),
        migrations.AddField(
            model_name='profile',
            name='current_focus_section_title',
            field=models.CharField(blank=True, default='What I am actively improving right now.', max_length=200),
        ),
    ]