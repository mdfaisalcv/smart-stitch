from django.urls import path
from .views import (
    CategoryListView, BrandListView, ProductListView, ProductDetailView,
    FeaturedProductsView, ReviewCreateView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/reviews/', ReviewCreateView.as_view(), name='review-create'),
]
