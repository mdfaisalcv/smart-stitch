import { getProduct } from '../../../lib/api';
import AddToCartForm from './AddToCartForm';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }) {
  let product;
  try {
    product = await getProduct(params.slug);
  } catch (e) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Product not found.</div>;
  }

  const primary = product.images?.find((i) => i.is_primary) || product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="relative aspect-[4/5] bg-gray-100">
        {primary ? (
          <Image src={primary.url} alt={product.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase text-gray-500">{product.brand?.name}</p>
        <h1 className="text-2xl font-semibold mt-1">{product.name}</h1>

        <div className="flex items-center gap-3 mt-3">
          <span className="text-xl font-bold">৳{Number(product.current_price).toLocaleString()}</span>
          {product.discount_price && (
            <>
              <span className="text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
              <span className="text-accent text-sm">-{product.discount_percent}%</span>
            </>
          )}
        </div>

        {product.average_rating && (
          <p className="text-sm text-gray-500 mt-1">★ {product.average_rating} ({product.reviews.length} reviews)</p>
        )}

        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>

        <AddToCartForm product={product} />

        <div className="mt-8 text-xs text-gray-400 border-t pt-4">
          SKU: {product.sku} · {product.stock} in stock
        </div>
      </div>
    </div>
  );
}
