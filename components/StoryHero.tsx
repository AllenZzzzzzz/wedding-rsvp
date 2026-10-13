'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion';

export type StoryChapter = {
  heading: string;
  text: string;
  /** Optional small gold line under the text, for example a date or venue. */
  meta?: string;
  src: string;
  /** CSS object-position for the photo, for example "50% 20%". */
  position?: string;
};

/* ------------------------------------------------------------------ *
 * Geometry. The finished composition is a poster, 100 wide by 160 high
 * (units are % of poster width / height). Four panels sit in a 2 x 2 grid
 * under a title band, like the reference image.
 * ------------------------------------------------------------------ */
const PW = 47.5; // panel width, % of poster width
const PH = 38; // panel height, % of poster height
const COL_LEFT = [2, 50.5]; // % of poster width
const ROW_TOP = [16, 56]; // % of poster height
const FEATURE_SCALE = 1.45;

// Scroll timeline (0 to 1). Each chapter enters, is held, then settles into its cell
// while the next chapter enters. The last chapter settles, then the finished poster holds.
const SCROLL_VH = 650; // total height of the pinned section
const OPEN_FADE: [number, number] = [0.05, 0.13];
const ENTER_START = (i: number) => 0.12 + 0.18 * i;
const ENTER_END = (i: number) => 0.21 + 0.18 * i;
const SETTLE_START = (i: number) => (i < 3 ? 0.3 + 0.18 * i : 0.84);
const SETTLE_END = (i: number) => (i < 3 ? 0.39 + 0.18 * i : 0.93);
const POSTER_FADE: [number, number] = [0.82, 0.93];

const GOLD = '#a98a4f';

const CSS = `
.sh-section{ position:relative; background:#f4efe4; }
.sh-stage{
  position:sticky; top:0; height:100vh; height:100dvh; overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0%,#fbf8f1 0,#f3eddf 70%,#eee6d4 100%);
}
.sh-open{ position:absolute; inset:0; z-index:5; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 8%; pointer-events:none; }
.sh-eyebrow{ font-family:'Jost',Arial,sans-serif; font-size:11px; letter-spacing:.32em; text-transform:uppercase; color:#7a6a4c; margin:0 0 18px; }
.sh-title{ font-family:'Cinzel','Cormorant Garamond',Georgia,serif; font-weight:500; text-transform:uppercase; line-height:1.18; letter-spacing:.06em;
  font-size:clamp(28px,8.2vw,58px); color:${GOLD}; margin:0; max-width:14em; text-wrap:balance; }
.sh-scroll{ font-family:'Jost',Arial,sans-serif; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:#8a7b5c; margin-top:34px; }
.sh-scroll i{ display:block; width:1px; height:34px; background:linear-gradient(#a98a4f,transparent); margin:10px auto 0; }
.sh-sprig{ position:absolute; pointer-events:none; }
.sh-cue{ position:absolute; left:0; right:0; bottom:calc(20px + env(safe-area-inset-bottom,0px)); z-index:6; display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; }
.sh-cue span{ font-family:'Jost',Arial,sans-serif; font-size:10px; letter-spacing:.34em; text-transform:uppercase; color:#6f6044; padding-left:.34em; }
.sh-cue i{ display:block; position:relative; width:1px; height:32px; background:rgba(111,96,68,.28); overflow:hidden; }
.sh-cue i::after{ content:''; position:absolute; left:0; top:-40%; width:1px; height:40%; background:${GOLD}; animation:sh-run 1.8s ease-in infinite; }
@keyframes sh-run{ to{ top:110%; } }

.sh-poster{
  position:absolute; left:50%; top:50%; width:min(100vw,60vh); width:min(100vw,60dvh); aspect-ratio:100/160;
  transform:translate(-50%,-50%); container-type:inline-size;
}
.sh-head{ position:absolute; left:0; right:0; top:0; height:14%; display:flex; align-items:center; justify-content:center; text-align:center; padding:0 8%; }
.sh-head h2{ margin:0; font-family:'Cinzel','Cormorant Garamond',Georgia,serif; font-weight:500; text-transform:uppercase; letter-spacing:.07em;
  font-size:5.2cqw; line-height:1.25; color:${GOLD}; text-wrap:balance; }

.sh-panel{
  position:absolute; width:${PW}%; height:${PH}%; display:flex; flex-direction:column; overflow:hidden;
  background:#fbf9f4; box-shadow:0 1.2cqw 3.2cqw rgba(70,55,30,.2), 0 0 0 1px rgba(169,138,79,.18); will-change:transform,opacity;
}
.sh-panel[data-text="bottom"]{ flex-direction:column-reverse; }
.sh-text{ flex:none; padding:3cqw 2.6cqw 2.6cqw; text-align:center; }
.sh-text h3{ margin:0; font-family:'Cinzel','Cormorant Garamond',Georgia,serif; font-weight:500; text-transform:uppercase; letter-spacing:.08em;
  font-size:3.4cqw; line-height:1.2; color:${GOLD}; }
.sh-text p{ margin:1.2cqw 0 0; font-family:'Jost',Arial,sans-serif; text-transform:uppercase; letter-spacing:.05em;
  font-size:2.4cqw; line-height:1.5; color:#4a4034; }
.sh-text .m{ color:${GOLD}; letter-spacing:.1em; font-size:2.2cqw; margin-top:1.4cqw; }
.sh-photo{ position:relative; flex:1 1 0; min-height:0; }
.sh-photo img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }

@media (prefers-reduced-motion: reduce){
  .sh-open{ display:none; }
}
`;

function pct(n: number) {
  return `${n}%`;
}

/** Cubic bezier point and tangent angle, used to lay leaves along a stem. */
function leafPlacement() {
  const P = [
    [10, 150],
    [40, 110],
    [62, 66],
    [106, 10],
  ];
  const bez = (t: number, k: 0 | 1) =>
    (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t ** 2 * P[2][k] + t ** 3 * P[3][k];
  const dbez = (t: number, k: 0 | 1) =>
    3 * (1 - t) ** 2 * (P[1][k] - P[0][k]) + 6 * (1 - t) * t * (P[2][k] - P[1][k]) + 3 * t ** 2 * (P[3][k] - P[2][k]);
  const out: { x: number; y: number; a: number; s: number }[] = [];
  for (let k = 1; k <= 8; k++) {
    const t = k / 9;
    const ang = (Math.atan2(dbez(t, 1), dbez(t, 0)) * 180) / Math.PI;
    const side = k % 2 === 0 ? -1 : 1;
    out.push({ x: bez(t, 0), y: bez(t, 1), a: ang + side * 48, s: 0.55 + 0.5 * (1 - Math.abs(t - 0.45)) });
  }
  return out;
}
const LEAVES = leafPlacement();

function Sprig({ style }: { style: React.CSSProperties }) {
  return (
    <svg className="sh-sprig" viewBox="0 0 120 160" style={style} aria-hidden="true" focusable="false">
      <path d="M10 150 C 40 110, 62 66, 106 10" fill="none" stroke={GOLD} strokeWidth="0.9" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.a.toFixed(1)}) scale(${l.s.toFixed(2)})`}>
          <path d="M0 0 C 7 -9, 20 -9, 28 0 C 20 9, 7 9, 0 0 Z" fill="none" stroke={GOLD} strokeWidth="0.8" />
          <path d="M0 0 L 26 0" fill="none" stroke={GOLD} strokeWidth="0.6" />
        </g>
      ))}
    </svg>
  );
}

function Panel({
  chapter,
  index,
  progress,
}: {
  chapter: StoryChapter;
  index: number;
  progress: MotionValue<number>;
}) {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const left = COL_LEFT[col];
  const top = ROW_TOP[row];
  const textAt = (col + row) % 2 === 0 ? 'top' : 'bottom';

  // Distance from this cell's centre to the poster centre, in % of the panel's own size.
  const cx = left + PW / 2;
  const cy = top + PH / 2;
  const dx = ((50 - cx) / PW) * 100;
  const dy = ((49 - cy) / PH) * 100;

  const es = ENTER_START(index);
  const ee = ENTER_END(index);
  const ss = SETTLE_START(index);
  const se = SETTLE_END(index);

  // Where each chapter comes from: 1 from the right, 2 from the left, 3 from below, 0 simply appears.
  const fromX = index === 1 ? dx + 170 : index === 2 ? dx - 170 : dx;
  const fromY = index === 3 ? dy + 90 : dy;

  const x = useTransform(progress, [es, ee, ss, se], [pct(fromX), pct(dx), pct(dx), pct(0)]);
  const y = useTransform(progress, [es, ee, ss, se], [pct(fromY), pct(dy), pct(dy), pct(0)]);
  const scale = useTransform(
    progress,
    [es, ee, ss, se],
    [FEATURE_SCALE - 0.06, FEATURE_SCALE, FEATURE_SCALE + 0.07, 1]
  );
  const opacity = useTransform(progress, [es, es + (ee - es) * 0.6], [0, 1]);

  return (
    <motion.article
      className="sh-panel"
      data-text={textAt}
      style={{ left: pct(left), top: pct(top), x, y, scale, opacity, zIndex: index + 2 }}
    >
      <div className="sh-text">
        <h3>{chapter.heading}</h3>
        <p>{chapter.text}</p>
        {chapter.meta ? <p className="m">{chapter.meta}</p> : null}
      </div>
      <div className="sh-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={chapter.src} alt="" draggable={false} style={{ objectPosition: chapter.position || '50% 50%' }} />
      </div>
    </motion.article>
  );
}

/**
 * "From Best Friend to Forever": a scroll-controlled story. The visitor scrolls through four
 * chapters, one photo panel at a time; the panels then settle into a 2 x 2 composition.
 * Scrolling back up reverses it. With reduced motion, the finished composition is shown directly.
 */
export default function StoryHero({ title, chapters }: { title: string; chapters: StoryChapter[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const still = useMotionValue(1);
  const progress = reduce ? still : scrollYProgress;

  const openOpacity = useTransform(progress, OPEN_FADE, [1, 0]);
  const openY = useTransform(progress, OPEN_FADE, [0, -48]);
  const posterOpacity = useTransform(progress, POSTER_FADE, [0, 1]);
  const posterY = useTransform(progress, POSTER_FADE, [10, 0]);

  // "Scroll" cue: shown while chapter 1 sits alone, gone before chapter 2 arrives.
  const cueOpacity = useTransform(progress, [0.17, 0.215, 0.275, 0.31], [0, 1, 1, 0]);

  const list = chapters.slice(0, 4);

  return (
    <div ref={ref} className="sh-section" style={{ height: reduce ? 'auto' : `${SCROLL_VH}vh` }} aria-label={title}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sh-stage" style={reduce ? { position: 'relative' } : undefined}>
        {/* Opening scene */}
        <motion.div className="sh-open" style={{ opacity: openOpacity, y: openY }}>
          <p className="sh-eyebrow">Allen &amp; Yoon</p>
          <h1 className="sh-title">{title}</h1>
          <div className="sh-scroll">
            Scroll
            <i />
          </div>
        </motion.div>
        <motion.div style={{ opacity: openOpacity }} aria-hidden="true">
          <Sprig style={{ right: '-6%', top: '-3%', width: 'min(52vw,300px)', transform: 'rotate(8deg)' }} />
          <Sprig style={{ left: '-6%', bottom: '-3%', width: 'min(52vw,300px)', transform: 'rotate(188deg)' }} />
        </motion.div>

        {/* Finished composition */}
        <div className="sh-poster">
          <motion.div className="sh-head" style={{ opacity: posterOpacity, y: posterY }}>
            <h2>{title}</h2>
          </motion.div>
          <motion.div style={{ opacity: posterOpacity }} aria-hidden="true">
            <Sprig style={{ right: '-3%', top: '-2%', width: '30%', transform: 'rotate(8deg)' }} />
            <Sprig style={{ left: '-3%', bottom: '-1%', width: '28%', transform: 'rotate(188deg)' }} />
          </motion.div>
          {list.map((c, i) => (
            <Panel key={c.heading + i} chapter={c} index={i} progress={progress} />
          ))}
        </div>

        {!reduce && (
          <motion.div className="sh-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
            <span>Scroll</span>
            <i />
          </motion.div>
        )}
      </div>
    </div>
  );
}
