'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../lib/api';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (user) getOrders().then(setOrders).catch(() => setOrders([]));
  }, [user]);

  if (authLoading) return null;
  if (!user) return <div className="max-w-xl mx-auto px-4 py-20 text-center">Please log in to view your orders.</div>;
  if (!orders) return <div className="max-w-xl mx-auto px-4 py-20 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.order_number} href={`/orders/${o.order_number}`} className="block border p-4 hover:border-brand">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{o.order_number}</span>
                <span className="uppercase text-xs bg-gray-100 px-2 py-1">{o.status}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                <span>৳{Number(o.total).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
