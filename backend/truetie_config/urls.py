"""
URL configuration for truetie_config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def home(request):
    return Response({"message": "Welcome to TrueTie API"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", home, name="home"),
    path("api/users/", include("users.urls")),
    path("api/couples/", include("couples.urls")),
    path("api/checkins/", include("checkins.urls")),
    path("api/trust-score/", include("trust_scores.urls")),
]
