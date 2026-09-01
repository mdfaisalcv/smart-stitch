from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer
from cart.models import Cart


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CheckoutView(APIView):
    """Convert the user's cart into an Order. Stock is decremented, cart is cleared."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        shipping_fee = 60
        subtotal = cart.total
        total = subtotal + shipping_fee

        order = Order.objects.create(
            user=request.user,
            full_name=data['full_name'],
            phone=data['phone'],
            email=data.get('email', ''),
            address=data['address'],
            city=data['city'],
            payment_method=data['payment_method'],
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
            status='pending',
        )

        for item in cart.items.select_related('product', 'variant'):
            if item.product.stock < item.quantity:
                raise ValueError(f"Insufficient stock for {item.product.name}")
            OrderItem.objects.create(
                order=order,
                product=item.product,
                variant=item.variant,
                product_name=item.product.name,
                unit_price=item.unit_price,
                quantity=item.quantity,
            )
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        # Cash on delivery orders are confirmed immediately; others wait for payment callback
        if data['payment_method'] == 'cod':
            order.status = 'processing'
            order.save(update_fields=['status'])

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
