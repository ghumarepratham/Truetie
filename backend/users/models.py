from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('S', 'Single'),
        ('I', 'In a Relationship'),
        ('E', 'Engaged'),
        ('M', 'Married'),
    ]

    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    relationship_status = models.CharField(max_length=1, choices=RELATIONSHIP_CHOICES, default='S')
    partner_email = models.EmailField(blank=True, null=True)
    trust_score = models.IntegerField(default=0)
    anniversary_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    def __str__(self):
        return self.username

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        # OTP expires in 10 minutes
        from django.utils import timezone
        import datetime
        return self.created_at < timezone.now() - datetime.timedelta(minutes=10)
