from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from .models import Project, Delivery
from payments.models import Payment

User = get_user_model()

class ProjectsTests(APITestCase):
    def setUp(self):
        # Création des utilisateurs
        self.client_user = User.objects.create_user(
            email='client@example.com',
            username='client@example.com',
            password='password123',
            role='CLIENT'
        )
        self.freelance_user = User.objects.create_user(
            email='freelance@example.com',
            username='freelance@example.com',
            password='password123',
            role='FREELANCE'
        )
        
        # Création du projet
        self.project = Project.objects.create(
            client=self.client_user,
            hired_freelance=self.freelance_user,
            title='Projet Test',
            description='Description du projet test',
            budget=1000.00,
            status='IN_PROGRESS'
        )
        
        # Création de la livraison
        self.delivery = Delivery.objects.create(
            project=self.project,
            freelance=self.freelance_user,
            message='Travail terminé',
            status='SUBMITTED'
        )
        
        # Création du paiement en escrow
        self.payment = Payment.objects.create(
            project=self.project,
            client=self.client_user,
            freelance=self.freelance_user,
            amount=1000.00,
            commission=100.00,
            freelance_amount=900.00,
            method='CARD',
            status='ESCROWED'
        )

    def test_accept_delivery_releases_payment_automatically(self):
        # Authentification du client
        self.client.force_authenticate(user=self.client_user)
        
        # Appel de l'endpoint pour accepter la livraison
        url = reverse('accept-delivery', kwargs={'project_id': self.project.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérification du statut du projet (COMPLETED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, 'COMPLETED')
        
        # Vérification du statut de la livraison (ACCEPTED)
        self.delivery.refresh_from_db()
        self.assertEqual(self.delivery.status, 'ACCEPTED')
        
        # Vérification du statut du paiement (RELEASED) et de la date de libération
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'RELEASED')
        self.assertIsNotNone(self.payment.released_at)
