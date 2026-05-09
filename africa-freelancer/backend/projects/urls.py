from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('mine/', views.my_projects, name='my-projects'),
    path('<int:project_id>/deliver/', views.submit_delivery, name='submit-delivery'),
    path('<int:project_id>/accept/', views.accept_delivery, name='accept-delivery'),
    path('<int:project_id>/revision/', views.request_revision, name='request-revision'),
]
