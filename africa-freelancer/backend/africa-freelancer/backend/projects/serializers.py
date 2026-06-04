# projects/serializers.py
from rest_framework import serializers
from .models import Project, Delivery
from users.serializers import ClientProfileSerializer, UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    client_info = serializers.SerializerMethodField()
    proposals_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_info', 'title', 'description',
            'budget', 'budget_type', 'category', 'skills_needed',
            'level', 'deadline', 'status', 'proposals_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client', 'status', 'created_at', 'updated_at']

    def get_client_info(self, obj):
        try:
            profile = obj.client.client_profile
            return {'name': f"{profile.first_name} {profile.last_name}", 'company': profile.company_name}
        except:
            return {'name': obj.client.email, 'company': ''}

    def get_proposals_count(self, obj):
        return obj.proposals.count()


class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ['id', 'project', 'message', 'files', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'project', 'freelance', 'status', 'created_at', 'updated_at']
