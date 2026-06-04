# notifications/utils.py
# Fonction utilitaire pour créer une notification depuis n'importe quel module

from .models import Notification

def create_notification(user, notif_type, title, message, data=None):
    """
    Crée une notification pour un utilisateur.
    Utilisé par tous les autres modules.
    """
    Notification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        message=message,
        data=data or {},
    )
