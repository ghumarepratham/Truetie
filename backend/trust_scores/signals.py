from django.db.models.signals import post_save
from django.dispatch import receiver
from checkins.models import CheckIn
from couples.models import Couple
from .utils import calculate_trust_score

@receiver(post_save, sender=CheckIn)
def update_trust_score_on_checkin(sender, instance, created, **kwargs):
    """
    Automatically recalculate trust score after every CheckIn save.
    """
    calculate_trust_score(instance.couple)

@receiver(post_save, sender=Couple)
def create_trust_score_for_new_couple(sender, instance, created, **kwargs):
    """
    Create TrustScore record automatically when a couple is first formed.
    """
    if created:
        calculate_trust_score(instance)
