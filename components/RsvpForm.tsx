'use client';

import { useEffect, useRef, useState } from 'react';

type MealOption = 'non_veg' | 'vegetarian' | 'halal' | 'vegan' | 'other';

const MEAL_OPTIONS: { value: MealOption; label: string }[] = [
  { value: 'non_veg', label: 'Non-vegetarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'other', label: 'Other (note in dietary restrictions)' },
];

export default function RsvpForm() {
  const [fullName, setFullName] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no' | ''>('');
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState('');
  const [meal, setMeal] = useState<MealOption | ''>('');
  const [plusOneMeal, setPlusOneMeal] = useState<MealOption | ''>('');
  const [dietary, setDietary] = useState('');
  const [wellWishes, setWellWishes] = useState('');
  const [contact, setContact] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [possibleDup, setPossibleDup] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [done]);

  async function submit(force = false) {
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        attending: attending === 'yes',
        plus_one: attending === 'yes' ? plusOne : false,
        plus_one_name: plusOne ? plusOneName : null,
        meal_preference: attending === 'yes' ? meal || null : null,
        plus_one_meal_preference: plusOne ? plusOneMeal || null : null,
        dietary_restrictions: dietary || null,
        well_wishes: wellWishes || null,
        contact: contact || null,
        force,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (res.status === 409 && data.possibleDuplicate) {
      setPossibleDup(data.possibleDuplicate.full_name);
      return;
    }
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      return;
    }
    setDone(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !attending) {
      setError('Please fill in your name and let us know if you can make it.');
      return;
    }
    setPossibleDup(null);
    submit(false);
  }

  if (done) {
    const firstName = fullName.trim().split(' ')[0];
    const going = attending === 'yes';
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        style={{
          ...card,
          textAlign: 'center',
          border: going ? '2px solid var(--ok)' : '1px solid var(--line)',
        }}
      >
        {going && (
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--ok)',
              color: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 12px',
            }}
          >
            ✓
          </div>
        )}
        <p
          style={{
            fontSize: 24,
            margin: 0,
            color: going ? 'var(--ok)' : 'inherit',
            fontStyle: going ? 'normal' : 'italic',
          }}
        >
          {going ? 'You’re on the list!' : `Thank you, ${firstName}.`}
        </p>
        <p style={{ ...small, fontSize: 14, marginTop: 8 }}>
          {going
            ? `Thank you, ${firstName}. We can’t wait to celebrate with you.`
            : 'You’ll be missed — thank you for letting us know.'}
        </p>
        {going && (
          <p style={{ ...small, marginTop: 12 }}>
            Attending · 6 March 2027 · Heritage Garden
            {plusOne && plusOneName.trim() ? ` · With ${plusOneName.trim()}` : ''}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={card}>
      <Field label="Full name">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="As you'd like it on the guest list"
          style={input}
          required
        />
      </Field>

      <Field label="Will you be attending?">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['yes', 'no'] as const).map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setAttending(v)}
              style={{
                ...pill,
                background: attending === v ? 'var(--ink)' : 'var(--paper-raised)',
                color: attending === v ? 'var(--paper)' : 'var(--ink-soft)',
                borderColor: attending === v ? 'var(--ink)' : 'var(--line)',
              }}
            >
              {v === 'yes' ? 'Joyfully accept' : 'Regretfully decline'}
            </button>
          ))}
        </div>
      </Field>

      {attending === 'yes' && (
        <>
          <Field label="Meal preference">
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value as MealOption)}
              style={input}
            >
              <option value="">Select one</option>
              {MEAL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bringing a plus one?">
            <div style={{ display: 'flex', gap: 8, marginBottom: plusOne ? 12 : 0 }}>
              {[true, false].map((v) => (
                <button
                  type="button"
                  key={String(v)}
                  onClick={() => setPlusOne(v)}
                  style={{
                    ...pill,
                    background: plusOne === v ? 'var(--ink)' : 'var(--paper-raised)',
                    color: plusOne === v ? 'var(--paper)' : 'var(--ink-soft)',
                    borderColor: plusOne === v ? 'var(--ink)' : 'var(--line)',
                  }}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {plusOne && (
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  value={plusOneName}
                  onChange={(e) => setPlusOneName(e.target.value)}
                  placeholder="Plus one's name"
                  style={input}
                />
                <select
                  value={plusOneMeal}
                  onChange={(e) => setPlusOneMeal(e.target.value as MealOption)}
                  style={input}
                >
                  <option value="">Plus one's meal preference</option>
                  {MEAL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Field>
        </>
      )}

      <Field label="Dietary restrictions or allergies">
        <textarea
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          placeholder="Optional"
          rows={2}
          style={{ ...input, resize: 'vertical' }}
        />
      </Field>

      <Field label="Well wishes for the couple">
        <textarea
          value={wellWishes}
          onChange={(e) => setWellWishes(e.target.value)}
          placeholder="Optional"
          rows={3}
          style={{ ...input, resize: 'vertical' }}
        />
      </Field>

      <Field label="Phone or email (so we can reach you about changes)">
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Optional"
          style={input}
        />
      </Field>

      {possibleDup && (
        <div style={dupBox}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5 }}>
            We already have an RSVP from someone named <b>{possibleDup}</b> —
            close to what you entered. If that&rsquo;s not you, tap submit
            again to send yours anyway.
          </p>
          <button
            type="button"
            onClick={() => submit(true)}
            style={{ ...pill, background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}
          >
            Submit anyway
          </button>
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

      <button type="submit" disabled={submitting} style={submitBtn}>
        {submitting ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ ...small, display: 'block', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'var(--paper-raised)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '28px 22px',
  maxWidth: 480,
  margin: '0 auto',
};

const small: React.CSSProperties = {
  fontFamily: "'Jost', Arial, sans-serif",
  fontSize: 12.5,
  color: 'var(--ink-soft)',
  letterSpacing: '0.02em',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: "'Jost', Arial, sans-serif",
  borderRadius: 6,
  border: '1px solid var(--line)',
  background: 'var(--paper)',
  color: 'var(--ink)',
};

const pill: React.CSSProperties = {
  fontFamily: "'Jost', Arial, sans-serif",
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '9px 16px',
  borderRadius: 999,
  border: '1px solid var(--line)',
  cursor: 'pointer',
};

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderRadius: 999,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: "'Jost', Arial, sans-serif",
};

const dupBox: React.CSSProperties = {
  background: 'var(--accent-soft)',
  borderRadius: 8,
  padding: '14px 16px',
  marginBottom: 16,
};
