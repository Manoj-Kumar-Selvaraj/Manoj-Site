from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_alter_profile_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='about_heading_highlight',
            field=models.CharField(
                blank=True,
                default='teams actually rely on.',
                help_text='Highlighted second line of the About heading.',
                max_length=200,
            ),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_heading_prefix',
            field=models.CharField(
                blank=True,
                default='Building infrastructure that',
                help_text='First line of the About heading.',
                max_length=200,
            ),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_section_badge',
            field=models.CharField(
                blank=True,
                default='About Me',
                help_text='Small label shown above the About heading.',
                max_length=80,
            ),
        ),
        migrations.AddField(
            model_name='profile',
            name='about_section_intro',
            field=models.CharField(
                blank=True,
                default='This is where I share my background, impact, and current focus.',
                help_text='Short intro text shown under the About heading.',
                max_length=300,
            ),
        ),
    ]
