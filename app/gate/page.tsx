'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <GateForm />
    </Suspense>
  );
}

function GateForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get('next') || '/');
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
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          You&rsquo;re Invited
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 6vw, 38px)',
            fontWeight: 500,
            margin: '0 0 8px',
          }}
        >
          Allen &amp; Yoon
        </h1>
        <p
          style={{
            fontFamily: "'Jost', Arial, sans-serif",
            fontSize: 13,
            color: 'var(--ink-soft)',
            margin: '0 0 28px',
          }}
        >
          Enter the password from your invitation to view details and RSVP.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
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
            padding: '12px 14px',
            fontSize: 13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 999,
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--paper)',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  );
}
