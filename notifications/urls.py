from django.urls import path
from . import views
urlpatterns = [
    path('', views.my_notifications, name='notifications'),
    path('unread/', views.unread_count, name='notif-unread'),
    path('read-all/', views.mark_all_read, name='notif-read-all'),
    path('<int:notif_id>/read/', views.mark_read, name='notif-read'),
]
