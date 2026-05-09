from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

class Payment(models.Model):
    METHOD_CHOICES = [
        ('ORANGE_MONEY', 'Orange Money'),
        ('AIRTEL_MONEY', 'Airtel Money'),
        ('MPESA', 'M-Pesa'),
        ('FLUTTERWAVE', 'Flutterwave'),
        ('PAYSTACK', 'Paystack'),
        ('CARD', 'Carte bancaire'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('ESCROWED', 'Fonds bloqués'),
        ('RELEASED', 'Libéré au freelance'),
        ('REFUNDED', 'Remboursé'),
        ('FAILED', 'Échoué'),
    ]

    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='payment')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_as_client')
    freelance = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_as_freelance')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2)      # 10%
    freelance_amount = models.DecimalField(max_digits=10, decimal_places=2) # 90%
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_ref = models.CharField(max_length=200, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
