'use client';

import { useEffect, useRef, useState } from 'react';
import { FlapSvg, WaxSeal } from './EnvelopeArt';

type Stage = 'closed' | 'lit' | 'opening' | 'invite' | 'leaving' | 'done';

const SEEN_KEY = 'ay_envelope_seen';
const INITIALS = 'A&Y';

// Timing (ms). The gold pattern lights up first, then the four flaps swing open.
const LIGHT_MS = 1700;
const OPEN_MS = 1500;
const LEAVE_MS = 950;

const CSS = `
.env-overlay{
  position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(90% 70% at 50% 45%,#2a0f0c,#0f0504); transition:opacity .9s ease; cursor:pointer;
  overflow:hidden; -webkit-tap-highlight-color:transparent;
}
.env-overlay[data-stage="leaving"]{ opacity:0; pointer-events:none; }

.env-frame{
  position:relative; z-index:1; height:100vh; height:100dvh; width:min(100vw,66vh); width:min(100vw,66dvh);
  perspective:1100px;
}
.env-inside{ position:absolute; inset:0; z-index:1; }
.env-burst{
  position:absolute; inset:-35%; z-index:2; pointer-events:none; opacity:0; transform:scale(.2);
  background:radial-gradient(circle,#fffbe8 0,#f6dc9c 20%,rgba(240,207,133,.55) 40%,rgba(240,207,133,0) 66%);
}
.env-overlay[data-stage="opening"] .env-burst,
.env-overlay[data-stage="invite"] .env-burst,
.env-overlay[data-stage="leaving"] .env-burst{ opacity:0; transform:scale(1.6); transition:opacity 1.2s ease .2s, transform 1.8s ease; }
.env-overlay[data-stage="opening"] .env-burst{ opacity:1; transition:opacity .5s ease, transform 1.8s ease; }

.flap{
  position:absolute; inset:0; z-index:3; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  transition:transform 1.3s cubic-bezier(.5,0,.2,1), opacity .5s ease .95s;
}
.flap-svg{ position:absolute; inset:0; width:100%; height:100%; display:block; }
.flap.t{ clip-path:polygon(0 0,100% 0,50% 50%); transform-origin:50% 0;
  background:linear-gradient(180deg,#5b2724,#3e1816 70%,#44201b); }
.flap.b{ clip-path:polygon(0 100%,100% 100%,50% 50%); transform-origin:50% 100%;
  background:linear-gradient(0deg,#3a150f,#47201a 70%,#4b231d); }
.flap.l{ clip-path:polygon(0 0,50% 50%,0 100%); transform-origin:0 50%;
  background:linear-gradient(90deg,#33100d,#47201b); }
.flap.r{ clip-path:polygon(100% 0,50% 50%,100% 100%); transform-origin:100% 50%;
  background:linear-gradient(270deg,#33100d,#47201b); }
.flap::before{ content:""; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(60% 50% at 50% 50%,rgba(255,225,190,.09),transparent 70%); }
.env-overlay[data-stage="opening"] .flap.t,
.env-overlay[data-stage="invite"] .flap.t,
.env-overlay[data-stage="leaving"] .flap.t{ transform:rotateX(-115deg); opacity:0; }
.env-overlay[data-stage="opening"] .flap.b,
.env-overlay[data-stage="invite"] .flap.b,
.env-overlay[data-stage="leaving"] .flap.b{ transform:rotateX(115deg); opacity:0; }
.env-overlay[data-stage="opening"] .flap.l,
.env-overlay[data-stage="invite"] .flap.l,
.env-overlay[data-stage="leaving"] .flap.l{ transform:rotateY(115deg); opacity:0; }
.env-overlay[data-stage="opening"] .flap.r,
.env-overlay[data-stage="invite"] .flap.r,
.env-overlay[data-stage="leaving"] .flap.r{ transform:rotateY(-115deg); opacity:0; }

/* gold pattern: dim layer always on; bright and glow layers ignite outward from the seal */
.lay .it{ opacity:0; }
.lay-glow .it{ opacity:0; }
.env-overlay:not([data-stage="closed"]) .lay-bright .it{ animation:env-ignite .7s ease-out both; animation-delay:var(--d); }
.env-overlay:not([data-stage="closed"]) .lay-glow .it{ animation:env-glow 1.4s ease-out both; animation-delay:var(--d); }
@keyframes env-ignite{ from{opacity:0} to{opacity:1} }
@keyframes env-glow{ 0%{opacity:0} 35%{opacity:.85} 100%{opacity:.28} }

.env-halo{
  position:absolute; left:50%; top:50%; width:95%; aspect-ratio:1; z-index:7; pointer-events:none; opacity:0;
  transform:translate(-50%,-50%) scale(.4); border-radius:50%;
  background:radial-gradient(circle,rgba(255,226,150,.9),rgba(240,190,90,.4) 40%,rgba(240,190,90,0) 68%);
}
.env-overlay[data-stage="lit"] .env-halo{ animation:env-halo 1.7s ease-out both; }
@keyframes env-halo{ 0%{opacity:0;transform:translate(-50%,-50%) scale(.4)} 30%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)} }

.env-seal{
  position:absolute; left:50%; top:50%; z-index:8; width:36%; aspect-ratio:1; padding:0; border:0; background:none; cursor:pointer;
  transform:translate(-50%,-50%); transition:transform .6s ease, opacity .6s ease;
}
.env-seal-pulse{ display:block; width:100%; height:100%; will-change:transform; animation:env-pulse 2.4s ease-in-out infinite; }
.env-seal svg,.env-seal img{ display:block; width:100%; height:100%; -webkit-user-drag:none; user-select:none; }
.env-seal:focus-visible{ outline:2px solid #f0cf85; outline-offset:6px; border-radius:50%; }
@keyframes env-pulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.045)} }
.env-overlay:not([data-stage="closed"]) .env-seal-pulse{ animation:none; }
.env-overlay[data-stage="lit"] .env-seal{ transform:translate(-50%,-50%) scale(.96); }
.env-overlay[data-stage="opening"] .env-seal,
.env-overlay[data-stage="invite"] .env-seal,
.env-overlay[data-stage="leaving"] .env-seal{ transform:translate(-50%,-50%) scale(1.6); opacity:0; }

.env-hint{
  position:absolute; left:0; right:0; bottom:calc(5% + env(safe-area-inset-bottom,0px)); z-index:8; text-align:center; margin:0;
  font-family:'Jost',Arial,sans-serif; font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:rgba(244,228,206,.85);
  transition:opacity .4s ease;
}
.env-overlay:not([data-stage="closed"]) .env-hint{ opacity:0; }

/* invitation words over the couple's photo, revealed inside the opened envelope */
.env-invite{
  position:absolute; inset:0; z-index:0; pointer-events:none; color:#26231a; opacity:0; transition:opacity .9s ease .3s;
  background:#1b0907 url(/invite-bg.jpg) center/cover no-repeat;
}
.env-overlay[data-stage="opening"] .env-invite,
.env-overlay[data-stage="invite"] .env-invite,
.env-overlay[data-stage="leaving"] .env-invite{ opacity:1; }
.env-invite::after{ content:""; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(255,250,240,.12) 0,rgba(255,250,240,0) 40%,rgba(20,10,6,0) 70%,rgba(20,10,6,.55) 100%); }
.env-invite-top{ position:absolute; z-index:1; left:0; right:0; top:8%; text-align:center; padding:0 6%; }
.env-invite-bot{ position:absolute; z-index:1; left:0; right:0; bottom:11%; text-align:center; padding:0 6%; }
.env-invite p{ margin:0; opacity:0; transform:translateY(10px); }
.env-overlay[data-stage="opening"] .env-invite p,
.env-overlay[data-stage="invite"] .env-invite p,
.env-overlay[data-stage="leaving"] .env-invite p{ animation:env-rise 1.1s ease-out forwards; animation-delay:calc(.7s + var(--i)*.55s); }
@keyframes env-rise{ to{ opacity:1; transform:none } }
.env-invite .k{ font-family:'Jost',Arial,sans-serif; font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:#26231a; }
.env-invite .c{ font-family:'Jost',Arial,sans-serif; font-size:clamp(14px,4vw,17px); letter-spacing:.04em; color:#26231a; margin-top:10px; }
.env-invite .n{ font-family:'Alex Brush','Great Vibes',cursive; font-size:clamp(44px,14vw,66px); line-height:1.15; white-space:nowrap; margin-top:6px;
  color:#6b6049; background:linear-gradient(90deg,#5a5342,#a8987a 50%,#5a5342); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.env-invite .d{ font-family:'Jost',Arial,sans-serif; font-size:13px; letter-spacing:.24em; text-transform:uppercase; color:#efd9be; text-shadow:0 1px 10px rgba(0,0,0,.45); }
.env-invite .v{ font-family:'Jost',Arial,sans-serif; font-size:12px; letter-spacing:.12em; color:#efd9be; opacity:.9; margin-top:6px; text-shadow:0 1px 10px rgba(0,0,0,.45); }
.env-skip{ position:absolute; left:0; right:0; bottom:calc(4% + env(safe-area-inset-bottom,0px)); z-index:9; text-align:center; margin:0;
  font-family:'Jost',Arial,sans-serif; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:rgba(244,228,206,.55); opacity:0; }
.env-overlay[data-stage="invite"] .env-skip{ animation:env-rise 1s ease 1.2s forwards; color:#efd9be; text-shadow:0 1px 8px rgba(0,0,0,.5); }

@media (prefers-reduced-motion: reduce){
  .flap,.env-seal,.env-burst,.env-overlay{ transition-duration:.01s !important; transition-delay:0s !important; }
  .env-seal-pulse,.env-halo,.lay .it{ animation:none !important; }
  .lay .it{ opacity:1 !important; }
}
`;

/**
 * Full-screen wax-sealed envelope shown once per browser session after the
 * password gate. Tap the seal (or anywhere): the gold pattern lights up from
 * the seal outward, the four flaps swing open, then the page fades in.
 */
export default function EnvelopeIntro() {
  const [stage, setStage] = useState<Stage>('closed');
  // The seal is a pre-rendered image (/seal.webp). If it fails to load, draw it in code instead.
  const [sealImg, setSealImg] = useState(true);
  const sealRef = useRef<HTMLImageElement>(null);

  // The image can fail before React attaches onError (server-rendered HTML), so check once on mount too.
  useEffect(() => {
    const el = sealRef.current;
    if (el && el.complete && el.naturalWidth === 0) setSealImg(false);
  }, []);

  // Skip for returning visitors in the same session, and for people who
  // asked their device to reduce motion.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      /* storage unavailable: just show the envelope */
    }
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce) setStage('done');
  }, []);

  // Lock page scroll while the envelope is up.
  useEffect(() => {
    if (stage === 'done') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  // lit -> opening -> leaving -> done
  useEffect(() => {
    if (stage === 'lit') {
      const t = setTimeout(() => setStage('opening'), LIGHT_MS);
      return () => clearTimeout(t);
    }
    if (stage === 'opening') {
      const t = setTimeout(() => setStage('invite'), OPEN_MS);
      return () => clearTimeout(t);
    }
    if (stage === 'leaving') {
      const t = setTimeout(() => {
        try {
          sessionStorage.setItem(SEEN_KEY, '1');
        } catch {
          /* ignore */
        }
        setStage('done');
      }, LEAVE_MS);
      return () => clearTimeout(t);
    }
  }, [stage]);

  if (stage === 'done') return null;

  // First tap lights the seal; a tap while the invitation is showing skips ahead.
  const start = () => setStage((s) => (s === 'closed' ? 'lit' : s === 'invite' ? 'leaving' : s));

  return (
    <div
      className="env-overlay"
      data-stage={stage}
      role="dialog"
      aria-label="Wedding invitation. Tap the seal to open."
      onClick={start}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="env-invite" aria-hidden={stage === 'closed' || stage === 'lit'}>
        <div className="env-invite-top">
          <p className="k" style={{ ['--i' as string]: 0 }}>You are cordially invited</p>
          <p className="c" style={{ ['--i' as string]: 1 }}>to celebrate the wedding of</p>
          <p className="n" style={{ ['--i' as string]: 2 }}>Allen &amp; Yoon</p>
        </div>
        <div className="env-invite-bot">
          <p className="d" style={{ ['--i' as string]: 3 }}>Saturday, 6 March 2027</p>
          <p className="v" style={{ ['--i' as string]: 4 }}>Heritage Garden, Chiang Mai</p>
        </div>
      </div>
      <div className="env-frame">
        <div className="env-inside" />
        <div className="env-burst" />
        <div className="flap t"><FlapSvg flap="t" /></div>
        <div className="flap b"><FlapSvg flap="b" /></div>
        <div className="flap l"><FlapSvg flap="l" /></div>
        <div className="flap r"><FlapSvg flap="r" /></div>
        <div className="env-halo" />
        <button
          type="button"
          className="env-seal"
          aria-label="Open the invitation"
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
        >
          <span className="env-seal-pulse">
            {sealImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={sealRef} src="/seal.webp" alt="" width={420} height={420} draggable={false} onError={() => setSealImg(false)} />
            ) : (
              <WaxSeal initials={INITIALS} />
            )}
          </span>
        </button>
        <p className="env-hint">Tap the seal to open</p>
        <p className="env-skip">Tap to continue</p>
      </div>
    </div>
  );
}
