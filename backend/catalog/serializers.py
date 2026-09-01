from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductVariant, Review


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'image', 'children']

    def get_children(self, obj):
        qs = obj.children.filter(is_active=True)
        return CategorySerializer(qs, many=True, context=self.context).data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt_text', 'is_primary', 'order']

    def get_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.external_url


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'stock', 'extra_price']


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages / grids."""
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'discount_price', 'current_price',
            'discount_percent', 'primary_image', 'category_name', 'brand_name',
            'is_featured', 'stock',
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not img:
            return None
        if img.image:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return img.external_url


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discount_price',
            'current_price', 'discount_percent', 'sku', 'stock', 'category',
            'brand', 'images', 'variants', 'reviews', 'average_rating',
            'is_featured', 'created_at',
        ]

    def get_average_rating(self, obj):
        ratings = [r.rating for r in obj.reviews.all()]
        return round(sum(ratings) / len(ratings), 1) if ratings else None
