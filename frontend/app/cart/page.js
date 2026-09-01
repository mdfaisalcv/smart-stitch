'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, updateItem, removeItem } = useCart();

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="mb-4">Please log in to view your cart.</p>
        <Link href="/login" className="btn-primary inline-block">Log In</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Link href="/" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Your Cart</h1>

      <div className="space-y-6">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-6">
            <div className="relative w-24 h-28 bg-gray-100 flex-shrink-0">
              {item.product_detail.primary_image && (
                <Image src={item.product_detail.primary_image} alt={item.product_detail.name} fill className="object-cover" unoptimized />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.product_detail.name}</h3>
              {item.variant_detail && (
                <p className="text-xs text-gray-500">
                  {item.variant_detail.size} {item.variant_detail.color && `/ ${item.variant_detail.color}`}
                </p>
              )}
              <p className="text-sm mt-1">৳{Number(item.unit_price).toLocaleString()}</p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-gray-300">
                  <button className="px-3 py-1" onClick={() => updateItem(item.id, item.quantity - 1)}>-</button>
                  <span className="px-4">{item.quantity}</span>
                  <button className="px-3 py-1" onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="text-xs text-red-600 underline" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
            <div className="font-semibold">৳{Number(item.subtotal).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({cart.total_items} items)</span>
            <span>৳{Number(cart.total).toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400">Shipping calculated at checkout.</p>
          <Link href="/checkout" className="btn-primary block text-center mt-4">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
