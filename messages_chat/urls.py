from django.urls import path
from . import views
urlpatterns = [
    path('send/', views.send_message, name='send-message'),
    path('inbox/', views.inbox, name='inbox'),
    path('unread/', views.unread_count, name='unread-count'),
    path('<int:user_id>/', views.conversation, name='conversation'),
]
