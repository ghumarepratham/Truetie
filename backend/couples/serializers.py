from rest_framework import serializers
from .models import Couple, RelationshipInvite
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture', 'loyalty_score']

class CoupleSerializer(serializers.ModelSerializer):
    user1 = UserSimpleSerializer(read_only=True)
    user2 = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Couple
        fields = ['id', 'user1', 'user2', 'status', 'created_at']

class RelationshipInviteSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True)

    class Meta:
        model = RelationshipInvite
        fields = ['id', 'sender', 'receiver_email', 'token', 'status', 'created_at']
        read_only_fields = ['token', 'status', 'created_at']

    def validate_receiver_email(self, value):
        user = self.context['request'].user
        if user.email == value:
            raise serializers.ValidationError("You cannot invite yourself.")
        
        if user.couple and user.couple.status == 'active':
            raise serializers.ValidationError("You are already in an active relationship.")

        # Check if receiver exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
            
        receiver = User.objects.get(email=value)
        if receiver.couple and receiver.couple.status == 'active':
            raise serializers.ValidationError("The person you are inviting is already in a relationship.")

        return value
