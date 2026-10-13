'use client';

import { useEffect, useState } from 'react';

// 6 March 2027, 5:00 PM in Chiang Mai (UTC+7, no daylight saving).
const TARGET = Date.parse('2027-03-06T17:00:00+07:00');

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function Countdown() {
  // null until mounted, so server and client render the same markup.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : TARGET - now;
  const over = diff !== null && diff <= 0;
  const p = diff === null ? null : parts(diff);

  const items: [string, number | null][] = [
    ['Days', p ? p.days : null],
    ['Hours', p ? p.hours : null],
    ['Minutes', p ? p.minutes : null],
    ['Seconds', p ? p.seconds : null],
  ];

  return (
    <div style={{ textAlign: 'center', margin: '34px 0 4px' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        {over ? 'The celebration has begun' : 'Counting down to the big day'}
      </div>
      {!over && (
        <div
          role="timer"
          aria-label="Countdown to 6 March 2027, 5:00 PM"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(8px, 3vw, 18px)',
          }}
        >
          {items.map(([label, value]) => (
            <div
              key={label}
              style={{
                minWidth: 'clamp(58px, 17vw, 84px)',
                padding: '14px 6px 10px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: 'var(--paper-raised)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(26px, 8vw, 40px)',
                  fontWeight: 500,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--ink)',
                }}
              >
                {value === null ? '--' : String(value).padStart(2, '0')}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', Arial, sans-serif",
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-soft)',
                  marginTop: 8,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
