from datetime import date, timedelta
from django.utils import timezone
from .models import CheckIn, Milestone
from django.db.models import Count

def get_days_together(couple):
    today = date.today()
    delta = today - couple.relationship_start
    return max(0, delta.days)

def get_mutual_checkins_count(couple):
    # Mutual check-ins are those confirmed (both partners checked in)
    return CheckIn.objects.filter(couple=couple, confirmed=True).values('date').distinct().count()

def get_missed_checkins(couple):
    days_together = get_days_together(couple)
    mutual_checkins = get_mutual_checkins_count(couple)
    # This is a simple calculation. For more accuracy, we could count actual days missed.
    return max(0, days_together - mutual_checkins)

def get_streak(couple):
    today = date.today()
    streak = 0
    current_date = today
    
    # Check if they have a mutual check-in for today or yesterday to start the streak count
    while True:
        if CheckIn.objects.filter(couple=couple, date=current_date, confirmed=True).exists():
            streak += 1
            current_date -= timedelta(days=1)
        else:
            # If current_date is today and no check-in, check yesterday to see if streak is still alive
            if current_date == today:
                current_date -= timedelta(days=1)
                continue
            break
    return streak

def check_and_create_milestones(couple):
    days_together = get_days_together(couple)
    milestone_definitions = [
        (30, "1 Month Together"),
        (90, "3 Months Together"),
        (180, "6 Months Together"),
        (365, "1 Year Together"),
    ]
    
    for days, title in milestone_definitions:
        milestone, created = Milestone.objects.get_or_create(
            couple=couple,
            days_count=days,
            defaults={
                'title': title,
                'milestone_date': couple.relationship_start + timedelta(days=days),
                'is_achieved': False
            }
        )
        
        if not milestone.is_achieved and days_together >= days:
            milestone.is_achieved = True
            milestone.achieved_at = timezone.now()
            milestone.save()

def check_inactivity(couple):
    # If last mutual check-in was 7+ days ago, deduct 10 points
    last_mutual = CheckIn.objects.filter(couple=couple, confirmed=True).order_by('-date').first()
    
    if last_mutual:
        days_since = (date.today() - last_mutual.date).days
        if days_since >= 7:
            # Check if we already deducted in the last 7 days to avoid multiple deductions
            # (Assuming we want to enforce "only applies once per 7-day period")
            # For simplicity, we just deduct if days_since is exactly a multiple of 7 or similar
            # But the requirement says "if last mutual was 7+ days ago"
            # We'll deduct 10 points if the score is > 0.
            couple.loyalty_score = max(0, couple.loyalty_score - 10)
            couple.save()
    else:
        # No mutual check-ins ever, check since relationship start
        days_since_start = get_days_together(couple)
        if days_since_start >= 7:
            couple.loyalty_score = max(0, couple.loyalty_score - 10)
            couple.save()

def calculate_loyalty_score(couple):
    days_together = get_days_together(couple)
    mutual_checkins = get_mutual_checkins_count(couple)
    milestones_achieved = Milestone.objects.filter(couple=couple, is_achieved=True).count()
    missed_checkins = get_missed_checkins(couple)
    
    score = (days_together * 2) + (mutual_checkins * 3) + (milestones_achieved * 10) - (missed_checkins * 5)
    couple.loyalty_score = max(0, score)
    couple.save()
    
    # Sync with users
    couple.partner1.loyalty_score = couple.loyalty_score
    couple.partner1.save()
    couple.partner2.loyalty_score = couple.loyalty_score
    couple.partner2.save()
    
    return couple.loyalty_score

def update_couple_loyalty(couple):
    check_inactivity(couple)
    check_and_create_milestones(couple)
    calculate_loyalty_score(couple)
