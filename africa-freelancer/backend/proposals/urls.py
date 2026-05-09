from django.urls import path
from . import views
urlpatterns = [
    path('project/<int:project_id>/', views.submit_proposal, name='submit-proposal'),
    path('project/<int:project_id>/list/', views.project_proposals, name='project-proposals'),
    path('<int:proposal_id>/accept/', views.accept_proposal, name='accept-proposal'),
    path('<int:proposal_id>/reject/', views.reject_proposal, name='reject-proposal'),
    path('mine/', views.my_proposals, name='my-proposals'),
]
