import { getProducts } from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = params;
  let data = { results: [], count: 0 };

  try {
    data = await getProducts({ category: slug, ordering: searchParams?.sort || '-created_at' });
  } catch (e) {
    // ignore — render empty state below
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold capitalize">{slug.replace(/-/g, ' ')}</h1>
        <p className="text-sm text-gray-500">{data.count} products</p>
      </div>

      {data.results?.length === 0 ? (
        <p className="text-gray-500 text-sm">No products found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.results?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
