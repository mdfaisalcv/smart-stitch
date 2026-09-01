'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId, quantity = 1, variantId = null) => {
    const data = await api.addToCart(productId, quantity, variantId);
    setCart(data);
  };

  const updateItem = async (itemId, quantity) => {
    const data = await api.updateCartItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const data = await api.removeCartItem(itemId);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
