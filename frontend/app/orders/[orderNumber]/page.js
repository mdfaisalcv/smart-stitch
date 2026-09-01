'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getOrder } from '../../../lib/api';

export default function OrderDetailPage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      getOrder(params.orderNumber).then(setOrder).catch((e) => setError(e.message));
    }
  }, [user, params.orderNumber]);

  if (authLoading) return null;
  if (!user) return <div className="max-w-xl mx-auto px-4 py-20 text-center">Please log in.</div>;
  if (error) return <div className="max-w-xl mx-auto px-4 py-20 text-center text-red-600">{error}</div>;
  if (!order) return <div className="max-w-xl mx-auto px-4 py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <p className="text-xs uppercase text-gray-500">Order Confirmed</p>
        <h1 className="text-2xl font-semibold mt-1">{order.order_number}</h1>
        <span className="inline-block mt-2 uppercase text-xs bg-gray-100 px-3 py-1">{order.status}</span>
      </div>

      <div className="space-y-3 border-t border-b py-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.quantity} × {item.product_name}</span>
            <span>৳{Number(item.subtotal).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>৳{Number(order.subtotal).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>৳{Number(order.shipping_fee).toLocaleString()}</span></div>
        <div className="flex justify-between font-semibold text-base"><span>Total</span><span>৳{Number(order.total).toLocaleString()}</span></div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Deliver to: {order.full_name}, {order.address}, {order.city}</p>
        <p>Phone: {order.phone}</p>
        <p className="uppercase mt-1">Payment: {order.payment_method}</p>
      </div>
    </div>
  );
}
