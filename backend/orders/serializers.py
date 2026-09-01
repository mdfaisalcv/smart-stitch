from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'product_name', 'unit_price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'full_name', 'phone', 'email',
            'address', 'city', 'subtotal', 'shipping_fee', 'total',
            'payment_method', 'items', 'created_at',
        ]
        read_only_fields = ['order_number', 'status', 'subtotal', 'total']


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    payment_method = serializers.ChoiceField(choices=['cod', 'bkash', 'nagad', 'card'], default='cod')
