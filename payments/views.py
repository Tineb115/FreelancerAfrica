# payments/views.py
# Gestion simplifiée des paiements (simulation pour le MVP)
# En production : intégrer Flutterwave ou Paystack via leur API

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from .models import Payment
from .serializers import PaymentSerializer
from projects.models import Project
from notifications.utils import create_notification


COMMISSION_RATE = Decimal('0.10')   # 10% de commission plateforme


@api_view(['POST'])
def initiate_payment(request, project_id):
    """
    Le client initie le paiement pour un projet.
    Les fonds sont mis en escrow (bloqués) jusqu'à la livraison.
    """
    project = get_object_or_404(Project, id=project_id)

    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)

    if project.status != 'IN_PROGRESS':
        return Response({'error': 'Le projet doit être en cours pour effectuer un paiement.'}, status=400)

    if Payment.objects.filter(project=project).exists():
        return Response({'error': 'Un paiement existe déjà pour ce projet.'}, status=400)

    method = request.data.get('method', 'CARD')
    amount = project.budget
    commission = amount * COMMISSION_RATE
    freelance_amount = amount - commission

    # En production, appeler ici l'API Flutterwave/Paystack
    # Pour le MVP, on simule un paiement réussi
    payment = Payment.objects.create(
        project=project,
        client=request.user,
        freelance=project.hired_freelance,
        amount=amount,
        commission=commission,
        freelance_amount=freelance_amount,
        method=method,
        status='ESCROWED',
        transaction_ref=f"AF-{project.id}-{timezone.now().timestamp()}",
        paid_at=timezone.now(),
    )

    create_notification(
        user=project.hired_freelance,
        notif_type='PAYMENT_RECEIVED',
        title='Paiement sécurisé !',
        message=f'Le client a effectué le paiement pour "{project.title}". Les fonds seront libérés à la validation.',
        data={'project_id': project.id, 'amount': str(freelance_amount)}
    )

    return Response({
        'message': 'Paiement effectué. Fonds en escrow jusqu\'à la validation.',
        'payment': PaymentSerializer(payment).data
    }, status=201)


@api_view(['POST'])
def release_payment(request, project_id):
    """
    Libère le paiement au freelance après validation du projet.
    Appelé automatiquement quand le client accepte la livraison.
    """
    project = get_object_or_404(Project, id=project_id)
    payment = get_object_or_404(Payment, project=project)

    if project.client != request.user:
        return Response({'error': 'Accès interdit.'}, status=403)

    if payment.status != 'ESCROWED':
        return Response({'error': 'Le paiement ne peut pas être libéré dans son état actuel.'}, status=400)

    payment.status = 'RELEASED'
    payment.released_at = timezone.now()
    payment.save()

    create_notification(
        user=project.hired_freelance,
        notif_type='PAYMENT_RECEIVED',
        title='Paiement reçu ! 💰',
        message=f'Le paiement de {payment.freelance_amount} XOF a été libéré pour "{project.title}".',
        data={'amount': str(payment.freelance_amount)}
    )

    return Response({'message': f'Paiement de {payment.freelance_amount} libéré au freelance.'})


@api_view(['GET'])
def payment_detail(request, project_id):
    """Détails du paiement d'un projet."""
    project = get_object_or_404(Project, id=project_id)
    if request.user not in [project.client, project.hired_freelance]:
        return Response({'error': 'Accès interdit.'}, status=403)
    payment = get_object_or_404(Payment, project=project)
    return Response(PaymentSerializer(payment).data)
