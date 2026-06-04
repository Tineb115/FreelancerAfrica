from rest_framework import serializers
from .models import Proposal

class ProposalSerializer(serializers.ModelSerializer):
    freelance_info = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = ['id', 'project', 'freelance', 'freelance_info', 'price', 'delivery_days', 'cover_letter', 'status', 'created_at']
        read_only_fields = ['id', 'project', 'freelance', 'status', 'created_at']

    def get_freelance_info(self, obj):
        try:
            p = obj.freelance.freelance_profile
            return {'name': f"{p.first_name} {p.last_name}", 'rating': p.rating, 'avatar': p.avatar.url if p.avatar else None}
        except:
            return {'name': obj.freelance.email, 'rating': 0, 'avatar': None}
