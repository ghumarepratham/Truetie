from rest_framework import serializers
from .models import TrustScore
from .utils import get_next_tier_info

class TrustScoreSerializer(serializers.ModelSerializer):
    next_tier = serializers.SerializerMethodField()
    points_needed = serializers.SerializerMethodField()

    class Meta:
        model = TrustScore
        fields = [
            'score', 'tier', 'days_together', 'mutual_checkins', 
            'milestones_achieved', 'missed_checkins', 'next_tier', 
            'points_needed', 'last_updated'
        ]

    def get_next_tier_info_obj(self, obj):
        return get_next_tier_info(obj.score)

    def get_next_tier(self, obj):
        info = self.get_next_tier_info_obj(obj)
        return info['next_tier']

    def get_points_needed(self, obj):
        info = self.get_next_tier_info_obj(obj)
        return info['points_needed']
