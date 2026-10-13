'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/* ---- Edit these when the exact venue details are confirmed ---- */
const VENUE_NAME = 'Heritage Garden';
const VENUE_PHOTO = '/photos/venue.jpg';
const VENUE_ADDRESS = '120 Nam Phrae, Hang Dong District, Chiang Mai 50230, Thailand';
const ADDRESS_LINES = ['120 Nam Phrae, Hang Dong District', 'Chiang Mai 50230, Thailand'];
// What Google Maps searches for. Replace with the full street address
// (or the venue's exact name as it appears on Google Maps) for a precise pin.
const MAP_QUERY = '120 Nam Phrae, Hang Dong District, Chiang Mai 50230, Thailand';
const EVENT_TITLE = 'Allen & Yoon Wedding Banquet';
// 6 March 2027, 5:00 PM to 10:00 PM in Chiang Mai (UTC+7) = 10:00Z to 15:00Z.
const START_UTC = '20270306T100000Z';
const END_UTC = '20270306T150000Z';
const DATE_LINE = 'Saturday, 6th March 2027 · 5:00 PM onward';
/* --------------------------------------------------------------- */

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;
const GOOGLE_CAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  `&dates=${START_UTC}/${END_UTC}` +
  `&location=${encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`)}` +
  `&details=${encodeURIComponent('Evening banquet. Kindly RSVP by 30 December 2026.')}`;

const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

function downloadIcs() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Allen and Yoon//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:allen-yoon-2027@allenonghh.com',
    `DTSTAMP:${stamp}`,
    `DTSTART:${START_UTC}`,
    `DTEND:${END_UTC}`,
    `SUMMARY:${esc(EVENT_TITLE)}`,
    `LOCATION:${esc(`${VENUE_NAME}, ${VENUE_ADDRESS}`)}`,
    `DESCRIPTION:${esc('Evening banquet. Kindly RSVP by 30 December 2026.')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'allen-and-yoon-wedding.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const CSS = `
.venue-sec{--v-display:'Cinzel',Georgia,serif;--v-body:'Lato',system-ui,sans-serif;--v-script:'Pinyon Script','Snell Roundhand',cursive;
  display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 0 88px}
.venue-banner{position:relative;width:100%;height:clamp(380px,68vh,600px);overflow:hidden;background:#1b1530}
.venue-banner .zoom{position:absolute;inset:0;will-change:transform}
.venue-banner img{width:100%;height:100%;object-fit:cover;object-position:46% 50%;display:block}
.venue-banner .fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,24,.38) 0,rgba(10,8,24,0) 34%,rgba(20,10,8,.55) 68%,rgba(20,10,8,.86) 100%)}
.venue-head{position:absolute;left:0;right:0;bottom:84px;padding:0 20px}
.venue-eyebrow{font-family:var(--v-body);font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#e9d3a2;margin:0 0 10px}
.venue-title{font-family:var(--v-display);font-weight:400;font-size:clamp(30px,8vw,48px);letter-spacing:.08em;text-transform:uppercase;margin:0;color:#f6ecd9;line-height:1.15;text-shadow:0 2px 18px rgba(0,0,0,.5)}
.venue-card{position:relative;z-index:2;width:min(calc(100% - 40px),440px);margin-top:-56px;padding:30px 22px 26px;background:var(--paper);
  border:1px solid var(--line);box-shadow:0 18px 44px rgba(40,26,16,.24);display:flex;flex-direction:column;align-items:center}
.venue-name{font-family:var(--v-display);font-weight:400;font-size:clamp(22px,6vw,30px);letter-spacing:.06em;text-transform:uppercase;margin:0 0 8px;color:var(--ink)}
.venue-addr{font-family:var(--v-body);font-size:14px;color:var(--ink-soft);margin:0}
.venue-date{font-family:var(--v-body);font-size:13px;letter-spacing:.06em;color:var(--ink-soft);margin:10px 0 0}
.venue-names{font-family:var(--v-script);font-size:clamp(36px,10vw,50px);line-height:1.1;margin:16px 0 0;color:var(--ink)}
.venue-btns{display:flex;flex-direction:column;gap:10px;width:100%;margin-top:22px}
.venue-btn{font-family:var(--v-body);font-size:12px;letter-spacing:.24em;text-transform:uppercase;text-decoration:none;
  padding:14px 12px;border:1px solid var(--ink);border-radius:2px;background:transparent;color:var(--ink);cursor:pointer;
  display:block;text-align:center;transition:background .2s,color .2s}
.venue-btn:hover,.venue-btn:focus-visible{background:var(--ink);color:var(--paper);outline:none}
.venue-alt{font-family:var(--v-body);font-size:12px;color:var(--ink-soft);margin:12px 0 0}
.venue-alt a{color:var(--accent)}
.venue-arch{position:relative;width:min(calc(100% - 40px),340px);aspect-ratio:4/5;margin:40px 0 0;border-radius:999px 999px 6px 6px;overflow:hidden;border:1px solid var(--line);background:var(--accent-soft)}
.venue-arch iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.venue-arch .cover{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:18px;background:transparent;border:0;cursor:pointer}
.venue-arch .cover span{font-family:var(--v-body);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;background:var(--paper);color:var(--ink);padding:7px 12px;border-radius:999px;opacity:.92}
`;

export default function Venue() {
  const [interactive, setInteractive] = useState(false);
  const reduce = useReducedMotion();
  const bannerRef = useRef<HTMLDivElement>(null);
  // The photo drifts from a close crop out to the full frame as the banner scrolls past.
  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1.02]);

  return (
    <section className="venue-sec" aria-labelledby="venue-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="venue-banner" ref={bannerRef}>
        <motion.div className="zoom" style={reduce ? undefined : { scale }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VENUE_PHOTO} alt={`${VENUE_NAME} by night`} loading="lazy" draggable={false} />
        </motion.div>
        <div className="fade" />
        <div className="venue-head">
          <p className="venue-eyebrow">Where we&rsquo;ll celebrate our love</p>
          <h2 id="venue-title" className="venue-title">The Venue</h2>
        </div>
      </div>

      <div className="venue-card">
        <p className="venue-name">{VENUE_NAME}</p>
        <p className="venue-addr">
          {ADDRESS_LINES[0]}
          <br />
          {ADDRESS_LINES[1]}
        </p>
        <p className="venue-date">{DATE_LINE}</p>
        <p className="venue-names">Allen &amp; Yoon</p>

        <div className="venue-btns">
          <a className="venue-btn" href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
          <button type="button" className="venue-btn" onClick={downloadIcs}>
            Add to calendar
          </button>
        </div>
        <p className="venue-alt">
          Using Google Calendar?{' '}
          <a href={GOOGLE_CAL_URL} target="_blank" rel="noopener noreferrer">
            Add it here
          </a>
        </p>
      </div>

      <div className="venue-arch">
        <iframe
          title={`Map of ${VENUE_NAME}`}
          src={MAP_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        />
        {!interactive && (
          <button
            type="button"
            className="cover"
            aria-label="Tap to explore the map"
            onClick={() => setInteractive(true)}
          >
            <span>Tap to explore</span>
          </button>
        )}
      </div>
    </section>
  );
}
