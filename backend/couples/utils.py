from django.utils import timezone
from datetime import timedelta
from .models import RelationshipArchive
from trust_scores.models import TrustScore

def archive_relationship(couple, reason=None):
    # Get current trust score and tier
    trust_score = getattr(couple, 'trust_score', None)
    final_tier = trust_score.tier if trust_score else 'Bronze'
    
    # Calculate total days
    total_days = (timezone.now().date() - couple.relationship_start).days
    
    # Create archive record
    archive = RelationshipArchive.objects.create(
        couple=couple,
        partner1_email=couple.partner1.email,
        partner2_email=couple.partner2.email,
        relationship_start=timezone.make_aware(timezone.datetime.combine(couple.relationship_start, timezone.datetime.min.time())),
        total_days=max(0, total_days),
        final_loyalty_score=couple.loyalty_score,
        final_trust_tier=final_tier,
        breakup_reason=reason,
        can_reactivate_until=timezone.now() + timedelta(days=30)
    )
    
    # Update couple status
    couple.status = 'broken'
    couple.save()
    
    # Freeze TrustScore
    if trust_score:
        trust_score.is_frozen = True
        trust_score.save()
        
    return archive

def reactivate_relationship(couple):
    archive = RelationshipArchive.objects.filter(couple=couple, is_permanently_reset=False).order_by('-relationship_end').first()
    
    if not archive:
        return "No archive found to reactivate."
        
    if archive.can_reactivate_until < timezone.now():
        permanently_reset(couple)
        return "Reactivation period has expired. Scores have been reset."
        
    # Reactivate
    couple.status = 'active'
    # Reset start date to today as per rules
    couple.relationship_start = timezone.now().date()
    couple.save()
    
    # Unfreeze TrustScore
    trust_score = getattr(couple, 'trust_score', None)
    if trust_score:
        trust_score.is_frozen = False
        trust_score.save()
        
    return "Relationship successfully reactivated."

def permanently_reset(couple):
    couple.loyalty_score = 0
    couple.status = 'broken'
    couple.save()
    
    trust_score = getattr(couple, 'trust_score', None)
    if trust_score:
        trust_score.score = 0
        trust_score.tier = 'Bronze'
        trust_score.save()
        
    # Update archive
    archive = RelationshipArchive.objects.filter(couple=couple, is_permanently_reset=False).order_by('-relationship_end').first()
    if archive:
        archive.is_permanently_reset = True
        archive.save()
        
    return None

def check_expired_breakups():
    expired_archives = RelationshipArchive.objects.filter(
        can_reactivate_until__lt=timezone.now(),
        is_permanently_reset=False
    )
    
    for archive in expired_archives:
        permanently_reset(archive.couple)
        
    return expired_archives.count()
