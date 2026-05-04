from django.urls import path
from .views import DailyCheckInView, CheckInStatusView, MilestoneListView, LoyaltyScoreView

urlpatterns = [
    path('today/', DailyCheckInView.as_view(), name='daily-checkin'),
    path('status/', CheckInStatusView.as_view(), name='checkin-status'),
    path('milestones/', MilestoneListView.as_view(), name='milestone-list'),
    path('loyalty-score/', LoyaltyScoreView.as_view(), name='loyalty-score'),
]
