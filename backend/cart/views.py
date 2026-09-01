from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer
from catalog.models import Product, ProductVariant


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    def get(self, request):
        cart = self.get_cart(request)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        """Add an item to the cart. Body: {product_id, variant_id?, quantity}"""
        cart = self.get_cart(request)
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        product = Product.objects.filter(id=product_id, is_active=True).first()
        if not product:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        variant = None
        if variant_id:
            variant = ProductVariant.objects.filter(id=variant_id, product=product).first()

        item, created = CartItem.objects.get_or_create(cart=cart, product=product, variant=variant)
        item.quantity = item.quantity + quantity if not created else quantity
        item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        """Update quantity of a cart item."""
        item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if not item:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        quantity = int(request.data.get('quantity', item.quantity))
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(item.cart).data if quantity > 0 else CartSerializer(Cart.objects.get(user=request.user)).data)

    def delete(self, request, item_id):
        item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if item:
            cart = item.cart
            item.delete()
            return Response(CartSerializer(cart).data)
        return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
