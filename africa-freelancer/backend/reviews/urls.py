from django.urls import path
from . import views
urlpatterns = [
    path('project/<int:project_id>/', views.create_review, name='create-review'),
    path('freelance/<int:user_id>/', views.freelance_reviews, name='freelance-reviews'),
]
