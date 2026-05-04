from rest_framework import serializers
from .models import Reward, CoupleReward
from trust_scores.utils import calculate_trust_score
from .utils import get_tier_rank

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'

class CoupleRewardSerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)
    
    class Meta:
        model = CoupleReward
        fields = '__all__'

class AgreeToUnlockSerializer(serializers.Serializer):
    reward_id = serializers.IntegerField()

    def validate(self, data):
        reward_id = data.get('reward_id')
        user = self.context['request'].user
        
        # 1. Reward exists and is active
        try:
            reward = Reward.objects.get(id=reward_id, is_active=True)
        except Reward.DoesNotExist:
            raise serializers.ValidationError("Reward not found or is inactive.")
            
        # 2. Couple is active
        couple = self.context.get('couple')
        if not couple or couple.status != 'active':
            raise serializers.ValidationError("You must be in an active relationship.")
            
        # 3. Trust score and eligibility
        trust_score = calculate_trust_score(couple)
        
        # Relationship must be > 30 days
        if trust_score.days_together < 30:
            raise serializers.ValidationError("Relationship must be at least 30 days old.")
            
        # Tier must match or be below
        reward_rank = get_tier_rank(reward.tier_required)
        current_rank = get_tier_rank(trust_score.tier)
        
        if reward_rank > current_rank:
            raise serializers.ValidationError(f"Your current tier ({trust_score.tier}) is too low for this reward ({reward.tier_required}).")
            
        data['reward'] = reward
        return data
