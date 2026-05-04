from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone

class Couple(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('broken', 'Broken'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner1 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='couples_as_partner1'
    )
    partner2 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='couples_as_partner2'
    )
    relationship_start = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    loyalty_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.partner1.email} & {self.partner2.email} ({self.status})"

class RelationshipInvite(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_relationship_invites'
    )
    receiver_email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite from {self.sender.email} to {self.receiver_email} ({self.status})"

class BreakupRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='breakup_requests')
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='initiated_breakups')
    confirmed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='confirmed_breakups')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(null=True, blank=True)
    initiated_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Breakup Request for {self.couple} ({self.status})"

class RelationshipArchive(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='archives')
    partner1_email = models.CharField(max_length=255)
    partner2_email = models.CharField(max_length=255)
    relationship_start = models.DateTimeField()
    relationship_end = models.DateTimeField(auto_now_add=True)
    total_days = models.IntegerField()
    final_loyalty_score = models.IntegerField()
    final_trust_tier = models.CharField(max_length=20)
    breakup_reason = models.TextField(null=True)
    can_reactivate_until = models.DateTimeField()
    is_permanently_reset = models.BooleanField(default=False)

    def __str__(self):
        return f"Archive for {self.partner1_email} & {self.partner2_email}"
