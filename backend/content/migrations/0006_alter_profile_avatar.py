from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0005_alter_profile_bio_alter_profile_bio_extended_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='avatar',
            field=models.ImageField(
                blank=True,
                help_text='Upload your profile image (used in Hero and About sections).',
                null=True,
                upload_to='profile/',
                verbose_name='Profile photo',
            ),
        ),
    ]
