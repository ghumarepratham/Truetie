from django.urls import path
from .views import (
    SendInviteView, AcceptInviteView, RejectInviteView, 
    MyInvitesView, MyCoupleView
)
from .breakup_views import (
    InitiateBreakupView, ConfirmBreakupView, CancelBreakupView,
    ReactivateRelationshipView, BreakupStatusView
)

urlpatterns = [
    path('invite/', SendInviteView.as_view(), name='send-invite'),
    path('accept/', AcceptInviteView.as_view(), name='accept-invite'),
    path('reject/', RejectInviteView.as_view(), name='reject-invite'),
    path('my-invites/', MyInvitesView.as_view(), name='my-invites'),
    path('my-couple/', MyCoupleView.as_view(), name='my-couple'),
    
    # Breakup System
    path('breakup/initiate/', InitiateBreakupView.as_view(), name='breakup-initiate'),
    path('breakup/confirm/<int:request_id>/', ConfirmBreakupView.as_view(), name='breakup-confirm'),
    path('breakup/cancel/<int:request_id>/', CancelBreakupView.as_view(), name='breakup-cancel'),
    path('reactivate/', ReactivateRelationshipView.as_view(), name='reactivate'),
    path('breakup/status/', BreakupStatusView.as_view(), name='breakup-status'),
]
