from django.urls import path
from .views import TrustScoreView, RefreshTrustScoreView

urlpatterns = [
    path('', TrustScoreView.as_view(), name='trust-score'),
    path('refresh/', RefreshTrustScoreView.as_view(), name='trust-score-refresh'),
]
