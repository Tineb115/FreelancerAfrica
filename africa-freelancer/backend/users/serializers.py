# users/serializers.py
# Sérialiseurs : convertissent les objets Python en JSON et valident les données

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FreelanceProfile, ClientProfile, PortfolioItem

User = get_user_model()


# ── Inscription ────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'role']

    def validate(self, data):
        # Vérifier que les deux mots de passe correspondent
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Utiliser create_user pour hasher le mot de passe automatiquement
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'FREELANCE'),
        )
        return user


# ── Profil utilisateur simple ──────────────────────────
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_email_verified', 'is_suspended', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Portfolio ──────────────────────────────────────────
class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = ['id', 'title', 'description', 'image', 'project_url', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Profil Freelance ───────────────────────────────────
class FreelanceProfileSerializer(serializers.ModelSerializer):
    portfolio = PortfolioItemSerializer(many=True, read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = FreelanceProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'bio', 'avatar',
            'skills', 'languages', 'country', 'city', 'hourly_rate',
            'is_available', 'rating', 'total_reviews', 'portfolio',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'total_reviews', 'created_at', 'updated_at']


# ── Profil Client ──────────────────────────────────────
class ClientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ClientProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'company_name',
            'bio', 'avatar', 'country', 'city', 'website',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
