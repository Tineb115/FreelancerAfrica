# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.me, name='me'),
    path('profile/freelance/create/', views.create_freelance_profile, name='create-freelance-profile'),
    path('profile/freelance/', views.FreelanceProfileView.as_view(), name='my-freelance-profile'),
    path('profile/freelance/<int:user_id>/', views.FreelanceProfileView.as_view(), name='freelance-profile'),
    path('profile/client/create/', views.create_client_profile, name='create-client-profile'),
    path('freelances/', views.freelance_list, name='freelance-list'),
]
