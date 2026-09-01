import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalog.models import Category, Brand, Product, ProductImage, ProductVariant

User = get_user_model()

CATEGORY_TREE = {
    "Men": ["Panjabi", "Shirts", "T-Shirts & Polos", "Jeans & Trousers", "Footwear"],
    "Women": ["Abaya", "Tops & Dresses", "Scarf", "Footwear", "Handbags"],
    "Kids": ["Boys Wear", "Girls Wear", "Kids Footwear"],
    "Fragrance": ["Premium", "Luxury"],
    "Accessories": ["Watches", "Wallets", "Belts", "Bags"],
}

BRANDS = ["URBANA Signature", "URBANA Classic", "Max Denim Co.", "Nordica", "Bengal Heritage"]

ADJECTIVES = ["Classic", "Premium", "Slim-Fit", "Regular-Fit", "Embroidered", "Printed", "Solid", "Textured"]

# LoremFlickr: pulls real, category-relevant Creative Commons photos from
# Flickr, so demo products get an actual fashion photo instead of a random
# unrelated image. Falls back to "fashion" if a category isn't mapped below.
PLACEHOLDER_IMG = "https://loremflickr.com/800/1000/{keywords}/all?lock={seed}"

CATEGORY_KEYWORDS = {
    "Panjabi": "panjabi,kurta,mensfashion",
    "Shirts": "mens,shirt,fashion",
    "T-Shirts & Polos": "tshirt,mensfashion",
    "Jeans & Trousers": "jeans,denim,mensfashion",
    "Footwear": "shoes,sneakers,footwear",
    "Abaya": "abaya,modestfashion",
    "Tops & Dresses": "dress,womensfashion",
    "Scarf": "scarf,hijab,fashion",
    "Handbags": "handbag,purse,fashion",
    "Boys Wear": "boy,kidsfashion",
    "Girls Wear": "girl,kidsfashion",
    "Kids Footwear": "kids,shoes",
    "Premium": "perfume,fragrance,bottle",
    "Luxury": "perfume,luxury,fragrance",
    "Watches": "wristwatch,luxury",
    "Wallets": "wallet,leather",
    "Belts": "leatherbelt,fashion",
    "Bags": "bag,leather,fashion",
}


class Command(BaseCommand):
    help = "Seed the database with demo categories, brands and products."

    def add_arguments(self, parser):
        parser.add_argument('--products', type=int, default=60, help='Number of products to create')

    def handle(self, *args, **options):
        self.stdout.write("Seeding brands...")
        brand_objs = [Brand.objects.get_or_create(name=b)[0] for b in BRANDS]

        self.stdout.write("Seeding categories...")
        cat_objs = []
        for parent_name, children in CATEGORY_TREE.items():
            parent, _ = Category.objects.get_or_create(name=parent_name)
            for child_name in children:
                child, _ = Category.objects.get_or_create(name=child_name, parent=parent)
                cat_objs.append(child)

        self.stdout.write(f"Seeding {options['products']} products...")
        sizes = ["S", "M", "L", "XL", "XXL"]
        colors = ["Black", "White", "Navy", "Beige", "Maroon"]

        for i in range(options['products']):
            category = random.choice(cat_objs)
            brand = random.choice(brand_objs)
            adj = random.choice(ADJECTIVES)
            name = f"{adj} {category.name} #{i+1}"
            price = random.choice([1290, 1590, 1990, 2490, 2990, 3490, 4990])
            has_discount = random.random() < 0.35
            discount_price = round(price * random.uniform(0.7, 0.9)) if has_discount else None

            product, created = Product.objects.get_or_create(
                sku=f"SKU-{category.id}-{i+1:04d}",
                defaults=dict(
                    name=name,
                    category=category,
                    brand=brand,
                    description=(
                        f"{name} from the {brand.name} collection. Crafted with premium "
                        f"materials for everyday comfort and a refined silhouette."
                    ),
                    price=price,
                    discount_price=discount_price,
                    stock=random.randint(5, 100),
                    is_featured=random.random() < 0.2,
                ),
            )
            if not created:
                continue

            for size in random.sample(sizes, k=random.randint(2, len(sizes))):
                ProductVariant.objects.get_or_create(
                    product=product, size=size, color=random.choice(colors),
                    defaults=dict(stock=random.randint(0, 20)),
                )

            # NOTE: these are category-matched Creative Commons demo photos
            # (via LoremFlickr), purely for demo purposes. Replace with real
            # product photography before going to production.
            ProductImage.objects.get_or_create(
                product=product,
                external_url=PLACEHOLDER_IMG.format(
                    keywords=CATEGORY_KEYWORDS.get(category.name, "fashion,premium"),
                    seed=product.sku,
                ),
                defaults=dict(is_primary=True, order=0, alt_text=name),
            )

        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(username='demo', email='demo@example.com', password='DemoPass123!')
            self.stdout.write(self.style.SUCCESS("Created demo user -> username: demo / password: DemoPass123!"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
