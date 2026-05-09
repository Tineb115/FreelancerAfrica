from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    TYPE_CHOICES = [
        ('NEW_MESSAGE', 'Nouveau message'),
        ('NEW_PROPOSAL', 'Nouvelle offre'),
        ('PROPOSAL_ACCEPTED', 'Offre acceptée'),
        ('PROPOSAL_REJECTED', 'Offre refusée'),
        ('PAYMENT_RECEIVED', 'Paiement reçu'),
        ('PROJECT_DELIVERED', 'Projet livré'),
        ('REVISION_REQUESTED', 'Révision demandée'),
        ('PROJECT_COMPLETED', 'Projet terminé'),
        ('NEW_REVIEW', 'Nouvel avis'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
