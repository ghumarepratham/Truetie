from django.utils import timezone
from .models import Reward, CoupleReward
from trust_scores.models import TrustScore
from trust_scores.utils import calculate_trust_score

def get_tier_rank(tier):
    tiers = ['Bronze', 'Silver', 'Gold', 'Platinum']
    try:
        return tiers.index(tier)
    except ValueError:
        return -1

def get_eligible_rewards(couple):
    # Ensure trust score is up to date
    trust_score = calculate_trust_score(couple)
    current_tier_rank = get_tier_rank(trust_score.tier)
    
    # Check days together requirement
    if trust_score.days_together < 30:
        return Reward.objects.none(), "Relationship must be at least 30 days old to unlock rewards."
    
    # Get tiers eligible (current and below)
    tiers = ['Bronze', 'Silver', 'Gold', 'Platinum']
    eligible_tiers = tiers[:current_tier_rank + 1]
    
    rewards = Reward.objects.filter(
        is_active=True,
        tier_required__in=eligible_tiers
    )
    
    return rewards, None

def check_reward_unlock(couple_reward):
    if couple_reward.unlocked_by_partner1 and couple_reward.unlocked_by_partner2:
        if not couple_reward.is_unlocked:
            couple_reward.is_unlocked = True
            couple_reward.unlocked_at = timezone.now()
            couple_reward.save()
        return True
    return False
