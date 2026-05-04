from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import TrustScore
from .serializers import TrustScoreSerializer
from .utils import calculate_trust_score
from couples.models import Couple
from django.db import models

class TrustScoreBaseView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_couple(self, request):
        user = request.user
        # Find active couple for user
        couple = Couple.objects.filter(
            (models.Q(partner1=user) | models.Q(partner2=user)),
            status='active'
        ).first()
        return couple

class TrustScoreView(TrustScoreBaseView):
    def get(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "You must be in an active relationship to view trust score."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Always recalculate to ensure latest logic (like multiplier changes) is applied
        trust_score = calculate_trust_score(couple)
            
        serializer = TrustScoreSerializer(trust_score)
        return Response(serializer.data)

class RefreshTrustScoreView(TrustScoreBaseView):
    def post(self, request):
        couple = self.get_couple(request)
        if not couple:
            return Response({"error": "You must be in an active relationship to refresh trust score."}, status=status.HTTP_400_BAD_REQUEST)
        
        trust_score = calculate_trust_score(couple)
        serializer = TrustScoreSerializer(trust_score)
        return Response(serializer.data)
