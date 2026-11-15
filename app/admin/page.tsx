'use client';

import { useEffect, useState } from 'react';

const MEAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'non_veg', label: 'Non-vegetarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'other', label: 'Other (see dietary)' },
];

function mealLabel(v: string | null) {
  if (!v) return '—';
  return MEAL_OPTIONS.find((m) => m.value === v)?.label ?? v;
}

type Guest = {
  id: string;
  full_name: string;
  attending: boolean;
  plus_one: boolean;
  plus_one_name: string | null;
  meal_preference: string | null;
  plus_one_meal_preference: string | null;
  dietary_restrictions: string | null;
  well_wishes: string | null;
  contact: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Guest>>({});

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/guests');
    const data = await res.json();
    setGuests(data.guests || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const attendingCount = guests.filter((g) => g.attending).length;
  const plusOnes = guests.filter((g) => g.attending && g.plus_one).length;
  const totalPax = attendingCount + plusOnes;
  const declined = guests.filter((g) => !g.attending).length;

  function startEdit(g: Guest) {
    setEditingId(g.id);
    setDraft(g);
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch('/api/admin/guests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        ...draft,
        plus_one_meal_preference: draft.plus_one ? draft.plus_one_meal_preference || null : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Couldn’t save changes: ${data.error || res.statusText}`);
      return;
    }
    setEditingId(null);
    load();
  }

  async function removeGuest(id: string) {
    if (!confirm('Remove this guest from the list? This cannot be undone.')) return;
    const res = await fetch('/api/admin/guests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Couldn’t delete guest: ${data.error || res.statusText}`);
      return;
    }
    load();
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--paper)', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div className="eyebrow">Admin</div>
            <h1 style={{ fontSize: 28, fontWeight: 500, margin: '4px 0 0' }}>Guest list</h1>
          </div>
          <a
            href="/api/admin/export"
            style={{
              padding: '11px 18px',
              borderRadius: 999,
              background: 'var(--accent)',
              color: '#fff',
              fontFamily: "'Jost', Arial, sans-serif",
              fontSize: 13,
              letterSpacing: '0.05em',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Export to Excel
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
          <Stat label="Attending" value={attendingCount} color="var(--ok)" />
          <Stat label="Plus ones" value={plusOnes} color="var(--gold)" />
          <Stat label="Total pax" value={totalPax} color="var(--accent)" />
          <Stat label="Declined" value={declined} color="var(--danger)" />
        </div>

        {loading ? (
          <p style={{ fontFamily: "'Jost', Arial, sans-serif", color: 'var(--ink-soft)' }}>Loading…</p>
        ) : guests.length === 0 ? (
          <p style={{ fontFamily: "'Jost', Arial, sans-serif", color: 'var(--ink-soft)' }}>No RSVPs yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Jost', Arial, sans-serif", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--paper-raised)', textAlign: 'left' }}>
                  {['Name', 'Status', '+1', 'Meal', 'Dietary', 'Well wishes', 'Contact', ''].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} style={{ borderTop: '1px solid var(--line)' }}>
                    {editingId === g.id ? (
                      <>
                        <td style={td}><input value={draft.full_name || ''} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} style={editInput} /></td>
                        <td style={td}>
                          <select value={draft.attending ? 'yes' : 'no'} onChange={(e) => setDraft({ ...draft, attending: e.target.value === 'yes' })} style={editInput}>
                            <option value="yes">Attending</option>
                            <option value="no">Declined</option>
                          </select>
                        </td>
                        <td style={td}>
                          <input value={draft.plus_one_name || ''} onChange={(e) => setDraft({ ...draft, plus_one_name: e.target.value, plus_one: !!e.target.value })} style={editInput} placeholder="+1 name" />
                        </td>
                        <td style={td}>
                          <select value={draft.meal_preference || ''} onChange={(e) => setDraft({ ...draft, meal_preference: e.target.value || null })} style={editInput}>
                            <option value="">Select one</option>
                            {MEAL_OPTIONS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                          {draft.plus_one && (
                            <select value={draft.plus_one_meal_preference || ''} onChange={(e) => setDraft({ ...draft, plus_one_meal_preference: e.target.value || null })} style={{ ...editInput, marginTop: 6 }}>
                              <option value="">+1 meal</option>
                              {MEAL_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td style={td}><input value={draft.dietary_restrictions || ''} onChange={(e) => setDraft({ ...draft, dietary_restrictions: e.target.value })} style={editInput} /></td>
                        <td style={td}><input value={draft.well_wishes || ''} onChange={(e) => setDraft({ ...draft, well_wishes: e.target.value })} style={editInput} /></td>
                        <td style={td}><input value={draft.contact || ''} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} style={editInput} /></td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <button onClick={saveEdit} style={linkBtn}>Save</button>{' '}
                          <button onClick={() => setEditingId(null)} style={linkBtn}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={td}>{g.full_name}</td>
                        <td style={td}>
                          <span style={{ color: g.attending ? 'var(--ok)' : 'var(--danger)', fontWeight: 600 }}>
                            {g.attending ? 'Attending' : 'Declined'}
                          </span>
                        </td>
                        <td style={td}>{g.plus_one_name || (g.plus_one ? 'Yes' : '—')}</td>
                        <td style={td}>
                          <div>{mealLabel(g.meal_preference)}</div>
                          {g.plus_one && (
                            <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                              +1: {mealLabel(g.plus_one_meal_preference)}
                            </div>
                          )}
                        </td>
                        <td style={td}>{g.dietary_restrictions || '—'}</td>
                        <td style={{ ...td, maxWidth: 220 }}>{g.well_wishes || '—'}</td>
                        <td style={td}>{g.contact || '—'}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <button onClick={() => startEdit(g)} style={linkBtn}>Edit</button>{' '}
                          <button onClick={() => removeGuest(g.id)} style={{ ...linkBtn, color: 'var(--danger)' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 26, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontFamily: "'Jost', Arial, sans-serif", fontSize: 11.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 12px', fontWeight: 600, fontSize: 11.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' };
const editInput: React.CSSProperties = { width: '100%', padding: '6px 8px', fontSize: 13, borderRadius: 5, border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' };
const linkBtn: React.CSSProperties = { border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12.5, padding: 0, fontFamily: "'Jost', Arial, sans-serif" };
