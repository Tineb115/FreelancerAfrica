# config/urls.py
# Routes principales de l'API - toutes les URLs de l'application

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),

    # Auth JWT : login, register, refresh token
    path('api/auth/', include('users.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Modules métier
    path('api/projects/', include('projects.urls')),
    path('api/proposals/', include('proposals.urls')),
    path('api/messages/', include('messages_chat.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
