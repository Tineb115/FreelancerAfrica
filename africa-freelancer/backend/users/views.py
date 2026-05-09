# users/views.py
# Vues pour l'authentification et la gestion des profils

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .models import FreelanceProfile, ClientProfile, PortfolioItem
from .serializers import (
    RegisterSerializer, UserSerializer,
    FreelanceProfileSerializer, ClientProfileSerializer,
    PortfolioItemSerializer
)

User = get_user_model()


# ── INSCRIPTION ────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Crée un nouveau compte utilisateur.
    Retourne les tokens JWT directement après inscription.
    """
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    # Générer les tokens JWT pour connecter l'utilisateur directement
    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Compte créé avec succès !',
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    }, status=status.HTTP_201_CREATED)


# ── CONNEXION ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """
    Connecte un utilisateur avec email + mot de passe.
    Retourne les tokens JWT.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email et mot de passe requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Django vérifie le mot de passe hashé automatiquement
    user = authenticate(request, username=email, password=password)

    if user is None:
        return Response(
            {'error': 'Email ou mot de passe incorrect.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if user.is_suspended:
        return Response(
            {'error': 'Votre compte a été suspendu. Contactez le support.'},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Connexion réussie !',
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    })


# ── PROFIL UTILISATEUR CONNECTÉ ────────────────────────
@api_view(['GET'])
def me(request):
    """
    Retourne les informations de l'utilisateur connecté.
    Inclut le profil freelance ou client selon le rôle.
    """
    user = request.user
    data = UserSerializer(user).data

    # Ajouter le profil selon le rôle
    if user.role == 'FREELANCE':
        try:
            profile = FreelanceProfile.objects.get(user=user)
            data['profile'] = FreelanceProfileSerializer(profile).data
        except FreelanceProfile.DoesNotExist:
            data['profile'] = None

    elif user.role == 'CLIENT':
        try:
            profile = ClientProfile.objects.get(user=user)
            data['profile'] = ClientProfileSerializer(profile).data
        except ClientProfile.DoesNotExist:
            data['profile'] = None

    return Response(data)


# ── GESTION PROFIL FREELANCE ───────────────────────────
class FreelanceProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  : Voir un profil freelance (public)
    PUT  : Modifier son propre profil (authentifié)
    PATCH: Modification partielle
    """
    serializer_class = FreelanceProfileSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            # Voir le profil d'un autre utilisateur
            return generics.get_object_or_404(FreelanceProfile, user_id=user_id)
        # Voir/modifier son propre profil
        return generics.get_object_or_404(FreelanceProfile, user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
def create_freelance_profile(request):
    """
    Crée le profil freelance après inscription.
    """
    if request.user.role != 'FREELANCE':
        return Response(
            {'error': 'Seuls les freelances peuvent créer ce type de profil.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if FreelanceProfile.objects.filter(user=request.user).exists():
        return Response(
            {'error': 'Vous avez déjà un profil freelance.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = FreelanceProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── GESTION PROFIL CLIENT ──────────────────────────────
@api_view(['POST'])
def create_client_profile(request):
    """
    Crée le profil client après inscription.
    """
    if request.user.role != 'CLIENT':
        return Response(
            {'error': 'Seuls les clients peuvent créer ce type de profil.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if ClientProfile.objects.filter(user=request.user).exists():
        return Response(
            {'error': 'Vous avez déjà un profil client.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = ClientProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── LISTE DES FREELANCES (pour les clients) ────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def freelance_list(request):
    """
    Liste tous les freelances disponibles.
    Filtrable par compétence, pays, disponibilité.
    """
    profiles = FreelanceProfile.objects.select_related('user').all()

    # Filtres optionnels
    skill = request.query_params.get('skill')
    country = request.query_params.get('country')
    available = request.query_params.get('available')

    if skill:
        # Filtre sur les compétences (JSON field)
        profiles = profiles.filter(skills__icontains=skill)
    if country:
        profiles = profiles.filter(country__icontains=country)
    if available:
        profiles = profiles.filter(is_available=True)

    serializer = FreelanceProfileSerializer(profiles, many=True)
    return Response(serializer.data)
