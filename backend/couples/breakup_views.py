from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Couple, BreakupRequest, RelationshipArchive
from .breakup_serializers import BreakupRequestSerializer, RelationshipArchiveSerializer
from .utils import archive_relationship, reactivate_relationship
from django.db import models

class BreakupBaseView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_couple(self, request):
        user = request.user
        return Couple.objects.filter(
            (models.Q(partner1=user) | models.Q(partner2=user))
        ).first()

class InitiateBreakupView(BreakupBaseView):
    def post(self, request):
        couple = self.get_couple(request)
        if not couple or couple.status == 'broken':
            return Response({"error": "No active relationship found."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check for existing pending request
        if BreakupRequest.objects.filter(couple=couple, status='pending').exists():
            return Response({"error": "A breakup request is already pending for this couple."}, status=status.HTTP_400_BAD_REQUEST)
            
        reason = request.data.get('reason', '')
        breakup_request = BreakupRequest.objects.create(
            couple=couple,
            initiated_by=request.user,
            reason=reason,
            status='pending'
        )
        
        return Response({
            "message": "Breakup request sent. Waiting for partner confirmation.",
            "request_id": breakup_request.id
        }, status=status.HTTP_201_CREATED)

class ConfirmBreakupView(BreakupBaseView):
    def post(self, request, request_id):
        breakup_request = get_object_or_404(BreakupRequest, id=request_id, status='pending')
        couple = self.get_couple(request)
        
        if breakup_request.couple != couple:
            return Response({"error": "You are not part of this relationship."}, status=status.HTTP_403_FORBIDDEN)
            
        if breakup_request.initiated_by == request.user:
            return Response({"error": "You cannot confirm your own breakup request."}, status=status.HTTP_400_BAD_REQUEST)
            
        breakup_request.status = 'confirmed'
        breakup_request.confirmed_by = request.user
        breakup_request.confirmed_at = timezone.now()
        breakup_request.save()
        
        archive_relationship(couple, reason=breakup_request.reason)
        
        return Response({"message": "Relationship ended. Data archived for 30 days."})

class CancelBreakupView(BreakupBaseView):
    def post(self, request, request_id):
        breakup_request = get_object_or_404(BreakupRequest, id=request_id, status='pending')
        couple = self.get_couple(request)
        
        if breakup_request.couple != couple:
            return Response({"error": "You are not part of this relationship."}, status=status.HTTP_403_FORBIDDEN)
            
        breakup_request.status = 'cancelled'
        breakup_request.save()
        
        return Response({"message": "Breakup request cancelled."})

class ReactivateRelationshipView(BreakupBaseView):
    def post(self, request):
        couple = self.get_couple(request)
        if not couple or couple.status != 'broken':
            return Response({"error": "No broken relationship found to reactivate."}, status=status.HTTP_400_BAD_REQUEST)
            
        result_message = reactivate_relationship(couple)
        
        if "successfully" in result_message:
            return Response({"message": result_message})
        return Response({"error": result_message}, status=status.HTTP_400_BAD_REQUEST)

class BreakupStatusView(BreakupBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No relationship found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Check for pending request
        pending_request = BreakupRequest.objects.filter(couple=couple, status='pending').first()
        
        # Check for archive (reactivation window)
        archive = RelationshipArchive.objects.filter(couple=couple, is_permanently_reset=False).order_by('-relationship_end').first()
        
        response_data = {
            "couple_status": couple.status,
            "pending_request": BreakupRequestSerializer(pending_request).data if pending_request else None,
            "archive": RelationshipArchiveSerializer(archive).data if archive and couple.status == 'broken' else None
        }
        
        return Response(response_data)
