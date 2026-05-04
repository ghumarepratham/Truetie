from django.db import models
from couples.models import Couple

class Reward(models.Model):
    REWARD_TYPE_CHOICES = [
        ('badge', 'Badge'),
        ('coupon', 'Coupon'),
        ('voucher', 'Voucher'),
        ('experience', 'Experience'),
    ]
    TIER_CHOICES = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPE_CHOICES)
    tier_required = models.CharField(max_length=20, choices=TIER_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.tier_required})"

class CoupleReward(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='rewards')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    unlocked_by_partner1 = models.BooleanField(default=False)
    unlocked_by_partner2 = models.BooleanField(default=False)
    is_unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    is_redeemed = models.BooleanField(default=False)
    redeemed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('couple', 'reward')

    def __str__(self):
        return f"{self.couple} - {self.reward.title} (Unlocked: {self.is_unlocked})"
