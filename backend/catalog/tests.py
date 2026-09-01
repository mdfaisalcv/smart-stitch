from django.test import TestCase
from rest_framework.test import APIClient
from .models import Category, Product


class CatalogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Shirts")
        self.product = Product.objects.create(
            name="Test Shirt",
            category=self.category,
            price=1990,
            sku="TEST-0001",
            stock=10,
        )

    def test_category_list(self):
        response = self.client.get("/api/catalog/categories/")
        self.assertEqual(response.status_code, 200)

    def test_product_list(self):
        response = self.client.get("/api/catalog/products/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_product_detail(self):
        response = self.client.get(f"/api/catalog/products/{self.product.slug}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test Shirt")
