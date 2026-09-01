'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentCallback } from '../../../lib/api';

/**
 * Stand-in for the bKash / Nagad / SSLCommerz hosted checkout page.
 * In production the user would be redirected to the real gateway's domain;
 * here we simulate that same "confirm or cancel" step and then hit our own
 * /api/payments/callback/ endpoint, exactly as a real gateway redirect would.
 */
export default function MockPaymentPage() {
  return (
    <Suspense fallback={null}>
      <MockPaymentInner />
    </Suspense>
  );
}

function MockPaymentInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const txn = params.get('txn');
  const order = params.get('order');
  const amount = params.get('amount');
  const method = params.get('method');

  const resolve = async (result) => {
    setProcessing(true);
    await paymentCallback(txn, result);
    router.push(`/orders/${order}`);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-24 text-center border mt-10">
      <p className="text-xs uppercase text-gray-500">Sandbox Gateway</p>
      <h1 className="text-xl font-semibold mt-2 capitalize">{method} Payment</h1>
      <p className="text-3xl font-bold mt-4">৳{amount}</p>
      <p className="text-xs text-gray-400 mt-1">Order {order}</p>

      <div className="mt-8 space-y-3">
        <button disabled={processing} onClick={() => resolve('success')} className="btn-primary w-full">
          {processing ? 'Processing...' : 'Confirm Payment'}
        </button>
        <button disabled={processing} onClick={() => resolve('cancelled')} className="btn-outline w-full">
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-6">
        This is a simulated gateway for demo purposes — no real transaction occurs.
      </p>
    </div>
  );
}
