'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

export default function AddToCartForm({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const sizes = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];
  const [size, setSize] = useState(sizes[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);

  const selectedVariant = product.variants?.find((v) => v.size === size);

  const handleAdd = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setStatus('loading');
    try {
      await addItem(product.id, quantity, selectedVariant?.id || null);
      setStatus('added');
      setTimeout(() => setStatus(null), 2000);
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase text-gray-500 mb-2">Size</p>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-10 h-10 border text-sm ${size === s ? 'border-brand bg-brand text-white' : 'border-gray-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs uppercase text-gray-500">Qty</p>
        <div className="flex items-center border border-gray-300">
          <button className="px-3 py-1" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
          <span className="px-4">{quantity}</span>
          <button className="px-3 py-1" onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
      </div>

      <button onClick={handleAdd} disabled={status === 'loading' || product.stock === 0} className="btn-primary w-full md:w-auto">
        {product.stock === 0 ? 'Out of stock' : status === 'loading' ? 'Adding...' : status === 'added' ? 'Added ✓' : 'Add to Cart'}
      </button>
      {status === 'error' && <p className="text-red-600 text-sm">Something went wrong. Try again.</p>}
    </div>
  );
}
