'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong.');
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'var(--paper)',
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Admin
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 500, margin: '0 0 18px' }}>
          Guest list dashboard
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 13px',
            fontSize: 15,
            borderRadius: 6,
            border: '1px solid var(--line)',
            background: 'var(--paper-raised)',
            color: 'var(--ink)',
            marginBottom: 12,
          }}
        />
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 13px',
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: 8,
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--paper)',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Checking…' : 'Enter dashboard'}
        </button>
      </form>
    </main>
  );
}
