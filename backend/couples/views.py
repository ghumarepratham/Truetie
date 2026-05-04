from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Couple, RelationshipInvite
from .serializers import CoupleSerializer, RelationshipInviteSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SendInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RelationshipInviteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AcceptInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        invite = get_object_or_404(RelationshipInvite, token=token, status='pending')
        user = request.user

        if invite.receiver_email != user.email:
            return Response({"error": "This invite is not for you."}, status=status.HTTP_403_FORBIDDEN)

        if user.couple and user.couple.status == 'active':
            return Response({"error": "You are already in an active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if sender is already in a relationship
        if invite.sender.couple and invite.sender.couple.status == 'active':
            return Response({"error": "The sender is already in an active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Create the couple
            couple = Couple.objects.create(partner1=invite.sender, partner2=user, status='active')
            
            # Link users to the couple and update status
            user.couple = couple
            user.relationship_status = 'I'
            user.save()

            sender = invite.sender
            sender.couple = couple
            sender.relationship_status = 'I'
            sender.save()

            # Mark invite as accepted
            invite.status = 'accepted'
            invite.save()

        serializer = CoupleSerializer(couple)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RejectInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        invite = get_object_or_404(RelationshipInvite, token=token, status='pending')
        
        if invite.receiver_email != request.user.email:
            return Response({"error": "This invite is not for you."}, status=status.HTTP_403_FORBIDDEN)

        invite.status = 'rejected'
        invite.save()
        return Response({"message": "Invite rejected successfully."}, status=status.HTTP_200_OK)

class MyInvitesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        received_invites = RelationshipInvite.objects.filter(receiver_email=request.user.email, status='pending')
        sent_invites = RelationshipInvite.objects.filter(sender=request.user, status='pending')
        
        return Response({
            "received": RelationshipInviteSerializer(received_invites, many=True).data,
            "sent": RelationshipInviteSerializer(sent_invites, many=True).data
        })

class MyCoupleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.couple or user.couple.status != 'active':
            return Response({"error": "You are not in an active relationship."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CoupleSerializer(user.couple)
        return Response(serializer.data)

class BreakupView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        couple = user.couple

        if not couple or couple.status != 'active':
            return Response({"error": "You are not in an active relationship."}, status=status.HTTP_400_BAD_REQUEST)

        partner = user.partner

        with transaction.atomic():
            # Reset both users
            user.couple = None
            user.relationship_status = 'S'
            user.loyalty_score = 0  # Reset loyalty score
            user.save()

            if partner:
                partner.couple = None
                partner.relationship_status = 'S'
                partner.loyalty_score = 0  # Reset loyalty score
                partner.save()

            # Set couple status to broken
            couple.status = 'broken'
            couple.save()

        return Response({"message": "Relationship ended. Loyalty scores reset to 0."}, status=status.HTTP_200_OK)
