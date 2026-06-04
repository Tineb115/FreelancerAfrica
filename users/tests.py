from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from django.core import mail
from django.core.signing import Signer

User = get_user_model()

class UsersAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='test@example.com',
            password='password123',
            role='FREELANCE'
        )

    def test_google_oauth_login_existing_user(self):
        url = reverse('google-oauth')
        data = {'email': 'test@example.com'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')

    def test_google_oauth_register_new_user(self):
        url = reverse('google-oauth')
        data = {
            'email': 'newgoogle@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'FREELANCE'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertTrue(User.objects.filter(email='newgoogle@example.com').exists())
        
        # Vérification de la création du profil
        new_user = User.objects.get(email='newgoogle@example.com')
        self.assertTrue(hasattr(new_user, 'freelance_profile'))
        self.assertEqual(new_user.freelance_profile.first_name, 'New')

    def test_request_email_verification(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('request-email-verification')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Vérifiez votre adresse email", mail.outbox[0].subject)

    def test_verify_email(self):
        # Génération du token signé
        signer = Signer()
        token = signer.sign(self.user.email)
        
        url = reverse('verify-email')
        response = self.client.post(url, {'token': token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    def test_password_reset_flow(self):
        # 1. Demande de réinitialisation
        url_request = reverse('password-reset-request')
        response_request = self.client.post(url_request, {'email': 'test@example.com'})
        self.assertEqual(response_request.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        
        # Extraction du token dans le corps du message
        email_content = mail.outbox[0].body
        token = email_content.split("Utilisez ce token pour réinitialiser votre mot de passe : ")[1].split("\n")[0].strip()
        
        # 2. Confirmation de réinitialisation
        url_confirm = reverse('password-reset-confirm')
        response_confirm = self.client.post(url_confirm, {
            'email': 'test@example.com',
            'token': token,
            'new_password': 'newpassword123'
        })
        self.assertEqual(response_confirm.status_code, status.HTTP_200_OK)
        
        # 3. Vérification de la connexion avec le nouveau mot de passe
        url_login = reverse('login')
        response_login = self.client.post(url_login, {
            'email': 'test@example.com',
            'password': 'newpassword123'
        })
        self.assertEqual(response_login.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response_login.data)
