# messages_chat/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from notifications.utils import create_notification

User = get_user_model()

@api_view(['POST'])
def send_message(request):
    """Envoyer un message à un utilisateur."""
    receiver_id = request.data.get('receiver_id')
    content = request.data.get('content', '').strip()

    if not receiver_id or not content:
        return Response({'error': 'receiver_id et content sont requis.'}, status=400)

    receiver = get_object_or_404(User, id=receiver_id)

    if receiver == request.user:
        return Response({'error': 'Vous ne pouvez pas vous envoyer un message.'}, status=400)

    message = Message.objects.create(
        sender=request.user,
        receiver=receiver,
        content=content,
        project_id=request.data.get('project_id'),
        file_url=request.data.get('file_url', ''),
    )
    create_notification(
        user=receiver,
        notif_type='NEW_MESSAGE',
        title='Nouveau message',
        message=f'Vous avez reçu un message de {request.user.email}.',
        data={'sender_id': request.user.id}
    )
    return Response(MessageSerializer(message).data, status=201)


@api_view(['GET'])
def conversation(request, user_id):
    """Récupérer la conversation entre l'utilisateur connecté et un autre."""
    other_user = get_object_or_404(User, id=user_id)

    messages = Message.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).order_by('created_at')

    # Marquer les messages reçus comme lus
    messages.filter(receiver=request.user, is_read=False).update(is_read=True)

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def inbox(request):
    """Liste des conversations de l'utilisateur (derniers messages par interlocuteur)."""
    user = request.user
    # Tous les messages envoyés ou reçus
    all_messages = Message.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).order_by('-created_at')

    # Dédupliquer par interlocuteur (garder le dernier message)
    conversations = {}
    for msg in all_messages:
        other = msg.receiver if msg.sender == user else msg.sender
        if other.id not in conversations:
            conversations[other.id] = MessageSerializer(msg).data
            conversations[other.id]['other_user_email'] = other.email

    return Response(list(conversations.values()))


@api_view(['GET'])
def unread_count(request):
    """Nombre de messages non lus."""
    count = Message.objects.filter(receiver=request.user, is_read=False).count()
    return Response({'unread_count': count})
