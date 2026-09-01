import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
        {product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1">
            -{product.discount_percent}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 uppercase">{product.brand_name}</p>
        <h3 className="text-sm font-medium text-brand truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">৳{Number(product.current_price).toLocaleString()}</span>
          {product.discount_price && (
            <span className="text-xs text-gray-400 line-through">
              ৳{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
