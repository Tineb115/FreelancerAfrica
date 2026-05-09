from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'project', 'reviewer', 'reviewer_email', 'reviewee', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']
