from rest_framework import serializers
from .models import CheckIn, Milestone

class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ['id', 'couple', 'user', 'date', 'confirmed', 'created_at']
        read_only_fields = ['id', 'created_at', 'confirmed']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'

class LoyaltyScoreSerializer(serializers.Serializer):
    loyalty_score = serializers.IntegerField()
    days_together = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    mutual_checkins_count = serializers.IntegerField()
    missed_checkins_count = serializers.IntegerField()
    next_milestone = serializers.JSONField()
