from django.urls import path
from .views import CheckInView, CheckInStatusView

urlpatterns = [
    path('', CheckInView.as_view(), name='checkin'),
    path('status/', CheckInStatusView.as_view(), name='checkin-status'),
]
