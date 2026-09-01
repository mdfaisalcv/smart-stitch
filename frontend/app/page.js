import Link from 'next/link';
import { getCategories, getFeaturedProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories = [];
  let featured = { results: [] };

  try {
    [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);
  } catch (e) {
    // Backend not reachable — page still renders with empty state.
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-widest">URBANA</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            High-end lifestyle retail. Demo storefront built with Next.js + Django REST Framework.
          </p>
          <Link href="/category/men" className="btn-primary inline-block mt-8 bg-white text-brand hover:bg-gray-200">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(categories.results || categories || []).map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="border border-gray-200 p-6 text-center hover:border-brand transition-colors"
            >
              <span className="text-sm font-medium uppercase">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8">Featured Products</h2>
        {(featured.results || featured || []).length === 0 ? (
          <p className="text-gray-500 text-sm">
            No products yet — run <code>python manage.py seed_data</code> on the backend.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(featured.results || featured).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
