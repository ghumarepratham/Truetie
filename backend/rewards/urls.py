from django.urls import path
from .views import (
    AvailableRewardsView, AgreeToUnlockView, 
    MyRewardsView, RedeemRewardView, AdminRewardCreateView
)

urlpatterns = [
    path('available/', AvailableRewardsView.as_view(), name='available-rewards'),
    path('agree/<int:reward_id>/', AgreeToUnlockView.as_view(), name='agree-to-unlock'),
    path('my-rewards/', MyRewardsView.as_view(), name='my-rewards'),
    path('redeem/', RedeemRewardView.as_view(), name='redeem-reward'),
    path('admin/create/', AdminRewardCreateView.as_view(), name='admin-reward-create'),
]
