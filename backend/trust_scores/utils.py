from datetime import date
from .models import TrustScore
from checkins.models import CheckIn, Milestone

def get_tier(score):
    if score >= 700:
        return "Platinum"
    elif score >= 300:
        return "Gold"
    elif score >= 100:
        return "Silver"
    else:
        return "Bronze"

def get_next_tier_info(score):
    if score >= 700:
        return {'next_tier': 'Platinum', 'points_needed': 0}
    elif score >= 300:
        return {'next_tier': 'Platinum', 'points_needed': 700 - score}
    elif score >= 100:
        return {'next_tier': 'Gold', 'points_needed': 300 - score}
    else:
        return {'next_tier': 'Silver', 'points_needed': 100 - score}

def calculate_trust_score(couple):
    if couple.status == 'broken':
        # If couple is broken, return existing score or create one if missing but don't recalculate
        trust_score, created = TrustScore.objects.get_or_create(couple=couple)
        return trust_score

    # 1. days_together
    today = date.today()
    delta = today - couple.relationship_start
    days_together = max(0, delta.days)

    # 2. mutual_checkins
    mutual_checkins = CheckIn.objects.filter(couple=couple, confirmed=True).values('date').distinct().count()

    # 3. milestones_achieved
    milestones_achieved = Milestone.objects.filter(couple=couple, is_achieved=True).count()

    # 4. missed_checkins
    # Formula from prompt: days_together - mutual_checkins
    missed_checkins = max(0, days_together - mutual_checkins)

    # Calculate score
    score = (days_together * 2) + (mutual_checkins * 10) + (milestones_achieved * 10) - (missed_checkins * 5)
    score = max(0, score)
    tier = get_tier(score)

    # Create or update TrustScore
    trust_score, created = TrustScore.objects.update_or_create(
        couple=couple,
        defaults={
            'score': score,
            'tier': tier,
            'days_together': days_together,
            'mutual_checkins': mutual_checkins,
            'milestones_achieved': milestones_achieved,
            'missed_checkins': missed_checkins
        }
    )
    
    return trust_score
