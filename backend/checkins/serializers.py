from rest_framework import serializers
from .models import CheckIn, Milestone

class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ['id', 'user', 'couple', 'date', 'confirmed', 'created_at']
        read_only_fields = ['id', 'user', 'couple', 'created_at']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'
