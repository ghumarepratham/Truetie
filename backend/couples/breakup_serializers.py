from rest_framework import serializers
from .models import BreakupRequest, RelationshipArchive
from django.utils import timezone

class BreakupRequestSerializer(serializers.ModelSerializer):
    initiated_by_email = serializers.EmailField(source='initiated_by.email', read_only=True)
    
    class Meta:
        model = BreakupRequest
        fields = '__all__'

class RelationshipArchiveSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = RelationshipArchive
        fields = '__all__'
        
    def get_days_remaining(self, obj):
        if obj.is_permanently_reset:
            return 0
        delta = obj.can_reactivate_until - timezone.now()
        return max(0, delta.days)
