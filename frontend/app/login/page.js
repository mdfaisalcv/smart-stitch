'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.username, form.password);
      router.push('/');
    } catch (err) {
      setError('Invalid username or password.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold mb-6 text-center">Log In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" placeholder="Username" required value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
        <input className="input" type="password" placeholder="Password" required value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="text-sm text-center mt-6 text-gray-500">
        No account? <Link href="/register" className="underline">Register</Link>
      </p>
      <p className="text-xs text-center mt-2 text-gray-400">
        Demo login: <b>demo</b> / <b>DemoPass123!</b>
      </p>
    </div>
  );
}
