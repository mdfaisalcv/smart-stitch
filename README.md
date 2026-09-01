# SMART-STITCH — Full-Stack E-Commerce

A demo multi-category fashion e-commerce platform, built as:

- **Backend:** Django REST Framework (`/backend`)
- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS (`/frontend`)

> This is an original demo storefront ("URBANA") with placeholder branding and
> dummy product data — it is **not** a copy of any specific live retailer. Use
> it as a starting point and swap in your own branding, product data, and
> payment gateway credentials.

## Features

- JWT authentication (register / login / refresh / profile)
- Nested categories, brands, products with images, size/colour variants, stock
- Cart (add / update / remove, tied to logged-in user)
- Checkout → Order creation with stock deduction and order history
- Payment flow (Cash on Delivery, and a **mock** bKash / Nagad / Card gateway
  that mimics the real init → redirect → callback contract, so it's a drop-in
  point to plug in real SSLCommerz / bKash / Nagad merchant APIs later)
- Django admin for managing all catalog & order data
- Seed script that generates realistic dummy categories, brands and products

## Project Structure

```
project/
├── backend/          Django REST Framework API
│   ├── config/        settings, root urls
│   ├── users/          custom user model + JWT auth
│   ├── catalog/        categories, brands, products, variants, reviews
│   ├── cart/            cart + cart items
│   ├── orders/          checkout + order history
│   └── payments/        mock payment gateway
└── frontend/          Next.js storefront
    ├── app/             pages (home, category, product, cart, checkout, ...)
    ├── components/       Navbar, Footer, ProductCard
    ├── context/           Auth + Cart React context
    └── lib/api.js          API client (fetch wrapper + JWT refresh)
```

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # edit values as needed

python manage.py migrate
python manage.py seed_data --products 60   # loads dummy categories/brands/products
python manage.py createsuperuser           # for /admin/ access

python manage.py runserver 0.0.0.0:8000
```

API will be live at `http://127.0.0.1:8000/api/`. Admin panel at
`http://127.0.0.1:8000/admin/`.

A demo customer account is also created by the seed script:
`username: demo` / `password: DemoPass123!`

### Key endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Get JWT access/refresh tokens |
| GET | `/api/auth/me/` | Current user profile |
| GET | `/api/catalog/categories/` | Category tree |
| GET | `/api/catalog/products/?category=men&search=shirt` | Product list, filter/search/sort |
| GET | `/api/catalog/products/<slug>/` | Product detail |
| GET/POST | `/api/cart/` | View / add to cart (auth required) |
| PATCH/DELETE | `/api/cart/items/<id>/` | Update / remove cart item |
| POST | `/api/orders/checkout/` | Convert cart → order |
| GET | `/api/orders/` | Order history |
| POST | `/api/payments/init/` | Start payment, get gateway redirect URL |
| POST | `/api/payments/callback/` | Confirm payment result |

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local     # points to backend at 127.0.0.1:8000
npm run dev
```

Visit `http://localhost:3000`.

## 3. Going to production

- Swap SQLite for Postgres (`DATABASES` in `config/settings.py`)
- Replace the mock payment gateway in `payments/views.py` with real
  SSLCommerz / bKash / Nagad merchant API calls (the init/callback contract
  is already shaped to match how those gateways work)
- Serve product images via S3/Cloudinary instead of local `MEDIA_ROOT`
- Set `DEBUG=False`, a real `SECRET_KEY`, and proper `ALLOWED_HOSTS`
- Deploy backend behind gunicorn + nginx (or a PaaS), frontend via
  `next build && next start` or Vercel
