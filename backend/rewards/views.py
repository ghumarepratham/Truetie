from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Reward, CoupleReward
from .serializers import RewardSerializer, CoupleRewardSerializer, AgreeToUnlockSerializer
from .utils import get_eligible_rewards, check_reward_unlock
from couples.models import Couple
from django.db import models

class RewardBaseView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_couple(self, request):
        user = request.user
        return Couple.objects.filter(
            (models.Q(partner1=user) | models.Q(partner2=user)),
            status='active'
        ).first()

class AvailableRewardsView(RewardBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)
        
        rewards, error_msg = get_eligible_rewards(couple)
        if error_msg:
            return Response({"message": error_msg, "rewards": []})

        # Get existing couple reward states
        couple_rewards = CoupleReward.objects.filter(couple=couple)
        cr_map = {cr.reward_id: cr for cr in couple_rewards}
        
        results = []
        for r in rewards:
            r_data = RewardSerializer(r).data
            cr = cr_map.get(r.id)
            if cr:
                r_data['is_unlocked'] = cr.is_unlocked
                r_data['is_redeemed'] = cr.is_redeemed
                r_data['pending_partner'] = (
                    (request.user == couple.partner1 and cr.unlocked_by_partner1 and not cr.unlocked_by_partner2) or
                    (request.user == couple.partner2 and cr.unlocked_by_partner2 and not cr.unlocked_by_partner1)
                )
                r_data['already_agreed'] = (
                    (request.user == couple.partner1 and cr.unlocked_by_partner1) or
                    (request.user == couple.partner2 and cr.unlocked_by_partner2)
                )
            else:
                r_data['is_unlocked'] = False
                r_data['is_redeemed'] = False
                r_data['pending_partner'] = False
                r_data['already_agreed'] = False
            results.append(r_data)
            
        return Response(results)

class AgreeToUnlockView(RewardBaseView):
    def post(self, request, reward_id):
        couple = self.get_couple(request)
        serializer = AgreeToUnlockSerializer(
            data={'reward_id': reward_id}, 
            context={'request': request, 'couple': couple}
        )
        
        if serializer.is_valid():
            reward = serializer.validated_data['reward']
            couple_reward, created = CoupleReward.objects.get_or_create(
                couple=couple,
                reward=reward
            )
            
            if request.user == couple.partner1:
                couple_reward.unlocked_by_partner1 = True
            else:
                couple_reward.unlocked_by_partner2 = True
                
            couple_reward.save()
            unlocked = check_reward_unlock(couple_reward)
            
            return Response({
                "status": "reward_unlocked" if unlocked else "waiting_for_partner",
                "is_unlocked": unlocked
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyRewardsView(RewardBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "No active relationship."}, status=status.HTTP_400_BAD_REQUEST)
            
        unlocked_rewards = CoupleReward.objects.filter(couple=couple, is_unlocked=True)
        serializer = CoupleRewardSerializer(unlocked_rewards, many=True)
        return Response(serializer.data)

class RedeemRewardView(RewardBaseView):
    def post(self, request):
        couple_reward_id = request.data.get('couple_reward_id')
        couple = self.get_couple(request)
        
        cr = get_object_or_404(CoupleReward, id=couple_reward_id, couple=couple)
        
        if not cr.is_unlocked:
            return Response({"error": "Reward is not unlocked yet."}, status=status.HTTP_400_BAD_REQUEST)
            
        if cr.is_redeemed:
            return Response({"error": "Reward already redeemed."}, status=status.HTTP_400_BAD_REQUEST)
            
        cr.is_redeemed = True
        cr.redeemed_at = timezone.now()
        cr.save()
        
        return Response({"status": "success", "message": "Reward redeemed successfully!"})

class AdminRewardCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        serializer = RewardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
