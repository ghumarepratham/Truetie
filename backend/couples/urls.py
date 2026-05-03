from django.urls import path
from .views import (
    SendInviteView, AcceptInviteView, RejectInviteView, 
    MyInvitesView, MyCoupleView, BreakupView
)

urlpatterns = [
    path('invite/', SendInviteView.as_view(), name='send-invite'),
    path('accept/', AcceptInviteView.as_view(), name='accept-invite'),
    path('reject/', RejectInviteView.as_view(), name='reject-invite'),
    path('my-invites/', MyInvitesView.as_view(), name='my-invites'),
    path('my-couple/', MyCoupleView.as_view(), name='my-couple'),
    path('breakup/', BreakupView.as_view(), name='breakup'),
]
