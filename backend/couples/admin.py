from django.contrib import admin
from .models import Couple, RelationshipInvite

@admin.register(Couple)
class CoupleAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user1__email', 'user2__email')

@admin.register(RelationshipInvite)
class RelationshipInviteAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver_email', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('sender__email', 'receiver_email')
