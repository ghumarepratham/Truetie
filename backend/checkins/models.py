from django.db import models
from django.conf import settings

class CheckIn(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    couple = models.ForeignKey('couples.Couple', on_delete=models.CASCADE, related_name='checkins')
    date = models.DateField()
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"Check-in for {self.user.email} on {self.date}"

class Milestone(models.Model):
    couple = models.ForeignKey('couples.Couple', on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    milestone_date = models.DateField()
    days_count = models.IntegerField()
    is_achieved = models.BooleanField(default=False)
    achieved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} for {self.couple}"
