from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Review
from .serializers import ReviewSerializer
from projects.models import Project
from users.models import FreelanceProfile

User = get_user_model()

@api_view(['POST'])
def create_review(request, project_id):
    """Le client laisse un avis sur le freelance après la fin du projet."""
    project = get_object_or_404(Project, id=project_id)

    if project.client != request.user:
        return Response({'error': 'Seul le client peut laisser un avis.'}, status=403)
    if project.status != 'COMPLETED':
        return Response({'error': 'Le projet doit être terminé pour laisser un avis.'}, status=400)
    if Review.objects.filter(project=project).exists():
        return Response({'error': 'Un avis a déjà été laissé pour ce projet.'}, status=400)

    serializer = ReviewSerializer(data={**request.data, 'project': project.id, 'reviewee': project.hired_freelance.id})
    if serializer.is_valid():
        review = serializer.save(reviewer=request.user, reviewee=project.hired_freelance, project=project)

        # Recalculer la note moyenne du freelance
        try:
            profile = project.hired_freelance.freelance_profile
            all_reviews = Review.objects.filter(reviewee=project.hired_freelance)
            profile.rating = round(sum(r.rating for r in all_reviews) / all_reviews.count(), 1)
            profile.total_reviews = all_reviews.count()
            profile.save()
        except FreelanceProfile.DoesNotExist:
            pass

        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def freelance_reviews(request, user_id):
    """Tous les avis reçus par un freelance."""
    reviews = Review.objects.filter(reviewee_id=user_id).select_related('reviewer')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)
