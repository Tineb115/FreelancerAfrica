# proposals/models.py
from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

class Proposal(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('ACCEPTED', 'Acceptée'),
        ('REJECTED', 'Refusée'),
        ('WITHDRAWN', 'Retirée'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='proposals')
    freelance = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_days = models.IntegerField()
    cover_letter = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'proposals'
        unique_together = ['project', 'freelance']   # 1 offre par freelance par projet
        ordering = ['-created_at']

    def __str__(self):
        return f"Offre de {self.freelance.email} sur {self.project.title}"
