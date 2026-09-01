'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { checkout, initPayment } from '../../lib/api';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'bkash', label: 'bKash' },
  { id: 'nagad', label: 'Nagad' },
  { id: 'card', label: 'Credit / Debit Card' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({ full_name: '', phone: '', email: '', address: '', city: '', payment_method: 'cod' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center">Please log in to check out.</div>;
  }
  if (!cart || cart.items.length === 0) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center">Your cart is empty.</div>;
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await checkout(form);
      await refresh();

      if (form.payment_method === 'cod') {
        router.push(`/orders/${order.order_number}`);
        return;
      }

      const payment = await initPayment(order.order_number, form.payment_method);
      window.location.href = payment.gateway_url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <input name="full_name" placeholder="Full Name" required className="input" value={form.full_name} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" required className="input" value={form.phone} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email (optional)" className="input md:col-span-2" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Delivery Address" required className="input md:col-span-2" value={form.address} onChange={handleChange} />
        <input name="city" placeholder="City" required className="input" value={form.city} onChange={handleChange} />

        <div className="md:col-span-2">
          <p className="text-xs uppercase text-gray-500 mb-2">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`border px-4 py-3 text-sm cursor-pointer flex items-center gap-2 ${form.payment_method === m.id ? 'border-brand' : 'border-gray-300'}`}>
                <input type="radio" name="payment_method" value={m.id} checked={form.payment_method === m.id} onChange={handleChange} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border-t pt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>৳{Number(cart.total).toLocaleString()}</span>
        </div>
        <div className="md:col-span-2 flex justify-between text-sm text-gray-500">
          <span>Shipping</span>
          <span>৳60</span>
        </div>
        <div className="md:col-span-2 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>৳{(Number(cart.total) + 60).toLocaleString()}</span>
        </div>

        {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary md:col-span-2">
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
