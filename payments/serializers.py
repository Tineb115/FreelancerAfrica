from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'project', 'client', 'freelance', 'amount', 'commission', 'freelance_amount', 'method', 'status', 'transaction_ref', 'paid_at', 'released_at', 'created_at']
        read_only_fields = ['id', 'client', 'commission', 'freelance_amount', 'status', 'created_at']
