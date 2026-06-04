# users/models.py
# Modèle utilisateur personnalisé
# On étend AbstractUser pour garder toutes les fonctionnalités Django

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur principal de la plateforme.
    Peut être FREELANCE, CLIENT ou ADMIN.
    """
    ROLE_CHOICES = [
        ('FREELANCE', 'Freelance'),
        ('CLIENT', 'Client'),
        ('ADMIN', 'Administrateur'),
    ]

    # On garde email comme identifiant principal (pas username)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FREELANCE')
    is_email_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'           # Connexion par email
    REQUIRED_FIELDS = ['username']     # username requis pour createsuperuser

    def __str__(self):
        return f"{self.email} ({self.role})"

    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'


class FreelanceProfile(models.Model):
    """
    Profil détaillé d'un freelance.
    Lié au User en One-to-One.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelance_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    skills = models.JSONField(default=list)      # ["React", "Python", "Design"]
    languages = models.JSONField(default=list)   # ["Français", "Anglais"]
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Freelance: {self.first_name} {self.last_name}"

    class Meta:
        db_table = 'freelance_profiles'


class ClientProfile(models.Model):
    """
    Profil détaillé d'un client.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    company_name = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Client: {self.first_name} {self.last_name}"

    class Meta:
        db_table = 'client_profiles'


class PortfolioItem(models.Model):
    """
    Élément du portfolio d'un freelance.
    """
    profile = models.ForeignKey(FreelanceProfile, on_delete=models.CASCADE, related_name='portfolio')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='portfolio/', blank=True, null=True)
    project_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'portfolio_items'
