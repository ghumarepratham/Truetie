from django.db import migrations, models
import django.db.models.deletion
import uuid
import django.utils.timezone
from django.conf import settings

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Couple',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('relationship_start', models.DateField(default=django.utils.timezone.now)),
                ('status', models.CharField(choices=[('active', 'Active'), ('broken', 'Broken')], default='active', max_length=10)),
                ('loyalty_score', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('partner1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='couples_as_partner1', to=settings.AUTH_USER_MODEL)),
                ('partner2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='couples_as_partner2', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='RelationshipInvite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('receiver_email', models.EmailField(max_length=254)),
                ('token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_relationship_invites', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
