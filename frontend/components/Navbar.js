'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Kids', href: '/category/kids' },
  { label: 'Fragrance', href: '/category/fragrance' },
  { label: 'Accessories', href: '/category/accessories' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>

        <Link href="/" className="text-2xl font-bold tracking-widest text-brand">
          SMART-STITCH
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-wide">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-sm">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/orders" className="hover:text-accent">My Orders</Link>
              <span className="text-gray-400">|</span>
              <button onClick={logout} className="hover:text-accent">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-accent">Login</Link>
          )}
          <Link href="/cart" className="relative">
            🛍
            {cart && cart.total_items > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cart.total_items}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col border-t border-gray-200 px-4 py-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="py-2 text-sm uppercase" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
