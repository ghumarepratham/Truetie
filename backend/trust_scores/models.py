from django.db import models
from couples.models import Couple

class TrustScore(models.Model):
    TIER_CHOICES = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ]

    couple = models.OneToOneField(Couple, on_delete=models.CASCADE, related_name='trust_score')
    score = models.IntegerField(default=0)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='Bronze')
    days_together = models.IntegerField(default=0)
    mutual_checkins = models.IntegerField(default=0)
    milestones_achieved = models.IntegerField(default=0)
    missed_checkins = models.IntegerField(default=0)
    is_frozen = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trust Score for {self.couple}: {self.score} ({self.tier})"
