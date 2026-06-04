from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FreelanceProfile, ClientProfile, PortfolioItem

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'role', 'is_email_verified', 'is_suspended', 'created_at']
    list_filter = ['role', 'is_suspended', 'is_email_verified']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Africa Freelancer', {'fields': ('role', 'is_email_verified', 'is_suspended')}),
    )

admin.register(FreelanceProfile)(admin.ModelAdmin)
admin.register(ClientProfile)(admin.ModelAdmin)
admin.register(PortfolioItem)(admin.ModelAdmin)
