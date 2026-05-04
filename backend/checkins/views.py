from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.utils import timezone
from datetime import date
from .models import CheckIn, Milestone
from .serializers import CheckInSerializer, MilestoneSerializer, LoyaltyScoreSerializer
from .utils import update_couple_loyalty, get_days_together, get_mutual_checkins_count, get_missed_checkins, get_streak
from couples.models import Couple

class CheckInBaseView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_couple(self, request):
        user = request.user
        # Find couple where user is partner1 or partner2
        couple = Couple.objects.filter(
            (models.Q(partner1=user) | models.Q(partner2=user)),
            status='active'
        ).first()
        return couple

# We need to import models.Q for the filter
from django.db import models

class DailyCheckInView(CheckInBaseView):
    def post(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "You must be in an active relationship to check in."}, status=status.HTTP_400_BAD_REQUEST)

        today = date.today()
        user = request.user
        
        if CheckIn.objects.filter(couple=couple, user=user, date=today).exists():
            return Response({"error": "Already checked in today."}, status=status.HTTP_400_BAD_REQUEST)

        checkin = CheckIn.objects.create(
            couple=couple,
            user=user,
            date=today
        )
        
        # Check if partner also checked in today
        partner = couple.partner2 if couple.partner1 == user else couple.partner1
        partner_checkin = CheckIn.objects.filter(couple=couple, user=partner, date=today).first()
        
        message = "Waiting for partner to check in."
        if partner_checkin:
            # Mark both as confirmed
            checkin.confirmed = True
            checkin.save()
            partner_checkin.confirmed = True
            partner_checkin.save()
            
            # Update loyalty
            update_couple_loyalty(couple)
            message = "Mutual check-in achieved! Loyalty score updated."

        return Response({
            "message": message,
            "checkin": CheckInSerializer(checkin).data
        }, status=status.HTTP_201_CREATED)

class CheckInStatusView(CheckInBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        today = date.today()
        p1_checkin = CheckIn.objects.filter(couple=couple, user=couple.partner1, date=today).exists()
        p2_checkin = CheckIn.objects.filter(couple=couple, user=couple.partner2, date=today).exists()
        mutual = CheckIn.objects.filter(couple=couple, date=today, confirmed=True).exists()

        return Response({
            "partner1_checked_in": p1_checkin,
            "partner2_checked_in": p2_checkin,
            "mutual_confirmed": mutual,
            "today": today
        })

class MilestoneListView(CheckInBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        milestones = Milestone.objects.filter(couple=couple).order_by('days_count')
        return Response(MilestoneSerializer(milestones, many=True).data)

class LoyaltyScoreView(CheckInBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure everything is up to date
        update_couple_loyalty(couple)
        
        next_milestone_obj = Milestone.objects.filter(couple=couple, is_achieved=False).order_by('days_count').first()
        next_milestone = None
        if next_milestone_obj:
            next_milestone = {
                "title": next_milestone_obj.title,
                "days_remaining": next_milestone_obj.days_count - get_days_together(couple)
            }

        data = {
            "loyalty_score": couple.loyalty_score,
            "days_together": get_days_together(couple),
            "current_streak": get_streak(couple),
            "mutual_checkins_count": get_mutual_checkins_count(couple),
            "missed_checkins_count": get_missed_checkins(couple),
            "next_milestone": next_milestone
        }
        
        return Response(data)
