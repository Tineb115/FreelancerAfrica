# projects/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Project(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Ouvert'),
        ('IN_PROGRESS', 'En cours'),
        ('DELIVERED', 'Livré'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
        ('DISPUTED', 'En litige'),
    ]
    LEVEL_CHOICES = [
        ('BEGINNER', 'Débutant'),
        ('INTERMEDIATE', 'Intermédiaire'),
        ('EXPERT', 'Expert'),
    ]
    BUDGET_TYPE_CHOICES = [
        ('FIXED', 'Fixe'),
        ('HOURLY', 'Horaire'),
    ]
    CATEGORY_CHOICES = [
        ('DEV_WEB', 'Développement Web'),
        ('DEV_MOBILE', 'Développement Mobile'),
        ('DESIGN', 'Design & Graphisme'),
        ('MARKETING', 'Marketing Digital'),
        ('REDACTION', 'Rédaction & Traduction'),
        ('VIDEO', 'Vidéo & Animation'),
        ('DATA', 'Data & IA'),
        ('AUTRE', 'Autre'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects_posted')
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPE_CHOICES, default='FIXED')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    skills_needed = models.JSONField(default=list)   # ["React", "Django"]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='INTERMEDIATE')
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    hired_freelance = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='projects_hired'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']   # Plus récents en premier


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('SUBMITTED', 'Soumise'),
        ('REVISION', 'Révision demandée'),
        ('ACCEPTED', 'Acceptée'),
    ]
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='delivery')
    freelance = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    files = models.JSONField(default=list)    # Liste d'URLs de fichiers
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Livraison - {self.project.title}"

    class Meta:
        db_table = 'deliveries'
