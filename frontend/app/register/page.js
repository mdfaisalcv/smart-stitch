'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', phone: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" className="input" placeholder="Full Name" value={form.first_name} onChange={handleChange} />
        <input name="username" className="input" placeholder="Username" required value={form.username} onChange={handleChange} />
        <input name="email" type="email" className="input" placeholder="Email" required value={form.email} onChange={handleChange} />
        <input name="phone" className="input" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="password" type="password" className="input" placeholder="Password" required value={form.password} onChange={handleChange} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-center mt-6 text-gray-500">
        Already have an account? <Link href="/login" className="underline">Log In</Link>
      </p>
    </div>
  );
}
