from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    receiver_email = serializers.EmailField(source='receiver.email', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'receiver', 'receiver_email', 'project_id', 'content', 'file_url', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']
