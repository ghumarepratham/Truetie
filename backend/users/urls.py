from django.urls import path
from .views import UserDetailView, UserCreateView, RequestOTPView, ResetPasswordView, LoginView, UserSearchView, UserPublicProfileView

urlpatterns = [
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('register/', UserCreateView.as_view(), name='user-create'),
    path('login/', LoginView.as_view(), name='login'),
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('<int:id>/', UserPublicProfileView.as_view(), name='user-public-profile'),
]
