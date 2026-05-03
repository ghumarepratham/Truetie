from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import CheckIn
from .serializers import CheckInSerializer
from django.db import transaction

class CheckInView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Check if user already checked in today
        checkin = CheckIn.objects.filter(user=user, date=today).first()
        if checkin:
            return Response(CheckInSerializer(checkin).data)
        return Response({"message": "Not checked in today"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        user = request.user
        if not user.couple or user.couple.status != 'active':
            return Response({"error": "You must be in an active relationship to check in."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()
        
        if CheckIn.objects.filter(user=user, date=today).exists():
            return Response({"error": "Already checked in today."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            checkin = CheckIn.objects.create(
                user=user,
                couple=user.couple,
                date=today,
                confirmed=True
            )
            
            # Increase loyalty score by 10 for each check-in
            user.loyalty_score += 10
            user.save()

        return Response(CheckInSerializer(checkin).data, status=status.HTTP_201_CREATED)

class CheckInStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.couple or user.couple.status != 'active':
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()
        partner = user.partner
        
        user_checked_in = CheckIn.objects.filter(user=user, date=today).exists()
        partner_checked_in = False
        if partner:
            partner_checked_in = CheckIn.objects.filter(user=partner, date=today).exists()

        return Response({
            "user_checked_in": user_checked_in,
            "partner_checked_in": partner_checked_in,
            "today": today
        })
