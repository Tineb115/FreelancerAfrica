from django.urls import path
from . import views
urlpatterns = [
    path('project/<int:project_id>/pay/', views.initiate_payment, name='initiate-payment'),
    path('project/<int:project_id>/release/', views.release_payment, name='release-payment'),
    path('project/<int:project_id>/', views.payment_detail, name='payment-detail'),
]
