from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Brand, Product, Review
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer,
    ProductDetailSerializer, ReviewSerializer,
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'brand__slug', 'is_featured']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            # include products from the category and all its descendant categories
            cat_ids = [c.id for c in Category.objects.filter(
                Q(slug=category_slug) | Q(parent__slug=category_slug)
            )]
            qs = qs.filter(category_id__in=cat_ids)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'


class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True)[:12]
    serializer_class = ProductListSerializer


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, product_id=self.kwargs['product_id'])
