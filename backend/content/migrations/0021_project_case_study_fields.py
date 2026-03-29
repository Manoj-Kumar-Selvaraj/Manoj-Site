from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0020_alter_project_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='after_state',
            field=models.TextField(blank=True, help_text='Short description of the after state.'),
        ),
        migrations.AddField(
            model_name='project',
            name='architecture_components',
            field=models.TextField(blank=True, help_text='Main components/services, one per line.'),
        ),
        migrations.AddField(
            model_name='project',
            name='architecture_data_flow',
            field=models.TextField(blank=True, help_text='Step-by-step data/control flow, one step per line.'),
        ),
        migrations.AddField(
            model_name='project',
            name='architecture_source',
            field=models.TextField(blank=True, help_text='Source system or starting state. Short paragraph or one line.'),
        ),
        migrations.AddField(
            model_name='project',
            name='architecture_target',
            field=models.TextField(blank=True, help_text='Target system or destination architecture. Short paragraph or one line.'),
        ),
        migrations.AddField(
            model_name='project',
            name='before_state',
            field=models.TextField(blank=True, help_text='Short description of the before state.'),
        ),
        migrations.AddField(
            model_name='project',
            name='challenges_solutions',
            field=models.TextField(blank=True, help_text='Use paired lines: Challenge: ... and Solution: ... Repeat for each pair.'),
        ),
        migrations.AddField(
            model_name='project',
            name='impact_metrics',
            field=models.TextField(blank=True, help_text='One metric per line, e.g. Migrated 1,000+ workspaces or Reduced effort by 50%.'),
        ),
        migrations.AddField(
            model_name='project',
            name='performance_optimizations',
            field=models.TextField(blank=True, help_text='One optimization per line.'),
        ),
        migrations.AddField(
            model_name='project',
            name='role_ownership',
            field=models.TextField(blank=True, help_text='One responsibility per line, e.g. Designed migration workflow, built automation, owned validation.'),
        ),
        migrations.AddField(
            model_name='project',
            name='workflow_steps',
            field=models.TextField(blank=True, help_text='Execution workflow, one step per line.'),
        ),
        migrations.AlterField(
            model_name='project',
            name='description',
            field=models.TextField(help_text='Short impact summary shown at the top of the project card. Keep it to 2-3 lines.'),
        ),
        migrations.AlterField(
            model_name='project',
            name='long_description',
            field=models.TextField(blank=True, help_text='Optional supporting narrative. Use short paragraphs only when needed.'),
        ),
    ]