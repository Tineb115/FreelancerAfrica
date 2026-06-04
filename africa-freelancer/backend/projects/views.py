# projects/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project, Delivery
from .serializers import ProjectSerializer, DeliverySerializer
from notifications.utils import create_notification


class IsClientOrReadOnly(permissions.BasePermission):
    """Seuls les clients peuvent créer/modifier des projets."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'CLIENT'


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  : Liste tous les projets ouverts (public)
    POST : Créer un projet (client uniquement)
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsClientOrReadOnly]

    def get_queryset(self):
        queryset = Project.objects.select_related('client').all()
        # Filtres
        category = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status', 'OPEN')
        skill = self.request.query_params.get('skill')
        min_budget = self.request.query_params.get('min_budget')
        max_budget = self.request.query_params.get('max_budget')

        if category:
            queryset = queryset.filter(category=category)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if skill:
            queryset = queryset.filter(skills_needed__icontains=skill)
        if min_budget:
            queryset = queryset.filter(budget__gte=min_budget)
        if max_budget:
            queryset = queryset.filter(budget__lte=max_budget)

        return queryset

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    : Voir un projet
    PUT    : Modifier (propriétaire uniquement)
    DELETE : Supprimer (propriétaire uniquement)
    """
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        project = self.get_object()
        if project.client != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez modifier que vos propres projets.")
        serializer.save()


@api_view(['GET'])
def my_projects(request):
    """Projets de l'utilisateur connecté (client = ses projets, freelance = projets où il travaille)."""
    user = request.user
    if user.role == 'CLIENT':
        projects = Project.objects.filter(client=user)
    else:
        projects = Project.objects.filter(hired_freelance=user)
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def submit_delivery(request, project_id):
    """Le freelance soumet sa livraison."""
    project = get_object_or_404(Project, id=project_id)

    if project.hired_freelance != request.user:
        return Response({'error': 'Vous n\'êtes pas le freelance assigné à ce projet.'}, status=403)

    if project.status != 'IN_PROGRESS':
        return Response({'error': 'Ce projet n\'est pas en cours.'}, status=400)

    serializer = DeliverySerializer(data=request.data)
    if serializer.is_valid():
        delivery = serializer.save(project=project, freelance=request.user)
        project.status = 'DELIVERED'
        project.save()
        # Notifier le client
        create_notification(
            user=project.client,
            notif_type='PROJECT_DELIVERED',
            title='Livraison reçue !',
            message=f'Le freelance a livré le projet "{project.title}".',
            data={'project_id': project.id}
        )
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def accept_delivery(request, project_id):
    """Le client accepte la livraison."""
    project = get_object_or_404(Project, id=project_id)
    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)

    delivery = get_object_or_404(Delivery, project=project)
    delivery.status = 'ACCEPTED'
    delivery.save()
    project.status = 'COMPLETED'
    project.save()

    create_notification(
        user=project.hired_freelance,
        notif_type='PROJECT_COMPLETED',
        title='Projet terminé !',
        message=f'Le client a accepté votre livraison pour "{project.title}".',
        data={'project_id': project.id}
    )
    return Response({'message': 'Livraison acceptée. Projet terminé !'})


@api_view(['POST'])
def request_revision(request, project_id):
    """Le client demande une révision."""
    project = get_object_or_404(Project, id=project_id)
    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)

    delivery = get_object_or_404(Delivery, project=project)
    delivery.status = 'REVISION'
    delivery.save()
    project.status = 'IN_PROGRESS'
    project.save()

    create_notification(
        user=project.hired_freelance,
        notif_type='REVISION_REQUESTED',
        title='Révision demandée',
        message=f'Le client demande des modifications pour "{project.title}".',
        data={'project_id': project.id}
    )
    return Response({'message': 'Révision demandée au freelance.'})
