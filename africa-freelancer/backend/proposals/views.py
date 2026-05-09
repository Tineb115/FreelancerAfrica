# proposals/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Proposal
from .serializers import ProposalSerializer
from projects.models import Project
from notifications.utils import create_notification


@api_view(['POST'])
def submit_proposal(request, project_id):
    """Le freelance soumet une offre sur un projet."""
    if request.user.role != 'FREELANCE':
        return Response({'error': 'Seuls les freelances peuvent soumettre des offres.'}, status=403)

    project = get_object_or_404(Project, id=project_id)

    if project.status != 'OPEN':
        return Response({'error': 'Ce projet n\'accepte plus d\'offres.'}, status=400)

    if Proposal.objects.filter(project=project, freelance=request.user).exists():
        return Response({'error': 'Vous avez déjà soumis une offre sur ce projet.'}, status=400)

    serializer = ProposalSerializer(data=request.data)
    if serializer.is_valid():
        proposal = serializer.save(project=project, freelance=request.user)
        create_notification(
            user=project.client,
            notif_type='NEW_PROPOSAL',
            title='Nouvelle offre reçue !',
            message=f'Un freelance a soumis une offre sur votre projet "{project.title}".',
            data={'project_id': project.id, 'proposal_id': proposal.id}
        )
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def project_proposals(request, project_id):
    """Liste les offres d'un projet (réservé au client propriétaire)."""
    project = get_object_or_404(Project, id=project_id)
    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)
    proposals = Proposal.objects.filter(project=project).select_related('freelance')
    serializer = ProposalSerializer(proposals, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def accept_proposal(request, proposal_id):
    """Le client accepte une offre. Le projet passe en IN_PROGRESS."""
    proposal = get_object_or_404(Proposal, id=proposal_id)
    project = proposal.project

    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)

    # Accepter cette offre
    proposal.status = 'ACCEPTED'
    proposal.save()

    # Refuser les autres offres automatiquement
    Proposal.objects.filter(project=project).exclude(id=proposal_id).update(status='REJECTED')

    # Assigner le freelance et changer le statut du projet
    project.hired_freelance = proposal.freelance
    project.status = 'IN_PROGRESS'
    project.save()

    create_notification(
        user=proposal.freelance,
        notif_type='PROPOSAL_ACCEPTED',
        title='Offre acceptée ! 🎉',
        message=f'Votre offre pour "{project.title}" a été acceptée. Vous pouvez commencer !',
        data={'project_id': project.id}
    )
    return Response({'message': 'Offre acceptée ! Le freelance peut commencer le travail.'})


@api_view(['POST'])
def reject_proposal(request, proposal_id):
    """Le client refuse une offre."""
    proposal = get_object_or_404(Proposal, id=proposal_id)
    if proposal.project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)
    proposal.status = 'REJECTED'
    proposal.save()
    create_notification(
        user=proposal.freelance,
        notif_type='PROPOSAL_REJECTED',
        title='Offre refusée',
        message=f'Votre offre pour "{proposal.project.title}" n\'a pas été retenue.',
        data={'project_id': proposal.project.id}
    )
    return Response({'message': 'Offre refusée.'})


@api_view(['GET'])
def my_proposals(request):
    """Les offres du freelance connecté."""
    proposals = Proposal.objects.filter(freelance=request.user).select_related('project')
    serializer = ProposalSerializer(proposals, many=True)
    return Response(serializer.data)
