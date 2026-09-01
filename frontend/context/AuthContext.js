'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      api.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    api.setTokens(data);
    const me = await api.getMe();
    setUser(me);
    return me;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    api.setTokens(data);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
