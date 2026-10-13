import type { ReactNode } from 'react';

/*
 * Gold floral artwork for the four envelope flaps, drawn with plain maths so
 * there are no image files to swap. Every flap is one SVG that fills the whole
 * envelope (viewBox 390 x 844) and is cut to its triangle with CSS clip-path.
 * Each flap draws three layers: a muted "dim" layer that is always visible, and
 * a "bright" and a blurred "glow" layer that light up outward from the seal.
 */

export type Mode = 'dim' | 'bright' | 'glow';
export type FlapId = 't' | 'b' | 'l' | 'r';
type Pt = [number, number];
type Item = { x: number; y: number; node: (m: Mode) => ReactNode };

const CX = 195;
const CY = 422;
const f = (n: number) => n.toFixed(1);

const PAL = {
  dim: {
    petal: ['#5a3a20', '#6a4524', '#7b5129', '#8a5d30'],
    stroke: '#2a150c',
    leaf: '#66421f',
    vein: '#2a150c',
    stem: '#5a3a20',
    core: '#8a5d30',
  },
  bright: {
    petal: ['#b8782f', '#d79d4c', '#ebb866', '#ffd98e'],
    stroke: '#6e3f14',
    leaf: '#e0a64e',
    vein: '#7a4a1c',
    stem: '#d79d4c',
    core: '#ffe3a6',
  },
  glow: {
    petal: ['#ffcf7a', '#ffcf7a', '#ffcf7a', '#ffcf7a'],
    stroke: 'none',
    leaf: '#ffcf7a',
    vein: 'none',
    stem: '#ffcf7a',
    core: '#ffcf7a',
  },
} as const;

/* ---------- shapes ---------- */

function petalPath(len: number, w: number) {
  return (
    `M0 0 C${f(-w * len)} ${f(-0.2 * len)} ${f(-w * len)} ${f(-0.95 * len)} 0 ${f(-len)} ` +
    `C${f(w * len)} ${f(-0.95 * len)} ${f(w * len)} ${f(-0.2 * len)} 0 0Z`
  );
}

function Peony({ x, y, r, rot = 0, m }: { x: number; y: number; r: number; rot?: number; m: Mode }) {
  const p = PAL[m];
  const rings = [
    { n: 9, len: 1, w: 0.5, off: 0 },
    { n: 8, len: 0.8, w: 0.5, off: 0.2 },
    { n: 7, len: 0.6, w: 0.52, off: 0.1 },
    { n: 6, len: 0.4, w: 0.55, off: 0.35 },
    { n: 5, len: 0.22, w: 0.6, off: 0 },
  ];
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      {rings.map((rg, i) => (
        <g key={i}>
          {Array.from({ length: rg.n }, (_, k) => {
            const a = ((k + rg.off) / rg.n) * 360;
            return (
              <path
                key={k}
                d={petalPath(r * rg.len, rg.w)}
                transform={`rotate(${f(a)})`}
                fill={p.petal[Math.min(i, 3)]}
                stroke={p.stroke}
                strokeWidth={m === 'dim' ? 0.9 : 0.7}
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      ))}
      {Array.from({ length: 7 }, (_, k) => {
        const a = (k / 7) * Math.PI * 2;
        return <circle key={k} cx={f(Math.cos(a) * r * 0.1)} cy={f(Math.sin(a) * r * 0.1)} r={f(r * 0.045)} fill={p.core} />;
      })}
    </g>
  );
}

function Leaf({ x, y, rot, len, m }: { x: number; y: number; rot: number; len: number; m: Mode }) {
  const p = PAL[m];
  const w = len * 0.36;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      <path
        d={`M0 0 C${f(w)} ${f(-len * 0.3)} ${f(w)} ${f(-len * 0.7)} 0 ${f(-len)} C${f(-w)} ${f(-len * 0.7)} ${f(-w)} ${f(-len * 0.3)} 0 0Z`}
        fill={p.leaf}
        stroke={p.stroke}
        strokeWidth={m === 'dim' ? 0.8 : 0.6}
        strokeLinejoin="round"
      />
      {m !== 'glow' && <path d={`M0 ${f(-len * 0.06)} L0 ${f(-len * 0.88)}`} stroke={p.vein} strokeWidth="0.8" fill="none" />}
    </g>
  );
}

/* ---------- curves ---------- */

function bez(p: Pt[], t: number) {
  const [a, b, c, d] = p;
  const u = 1 - t;
  const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
  const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
  return { x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function stem(p: Pt[]): Item {
  const mid = bez(p, 0.5);
  return {
    x: mid.x,
    y: mid.y,
    node: (m) => (
      <path
        d={`M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`}
        fill="none"
        stroke={PAL[m].stem}
        strokeWidth={m === 'glow' ? 3 : 1.8}
        strokeLinecap="round"
      />
    ),
  };
}

function leavesAlong(p: Pt[], from: number, to: number, step: number, l0: number, l1: number, spread = 52): Item[] {
  const out: Item[] = [];
  let side = 1;
  for (let t = from, i = 0; t <= to + 0.001; t += step, i++) {
    const pt = bez(p, t);
    const k = (t - from) / Math.max(0.001, to - from);
    const len = l0 + (l1 - l0) * k;
    const rot = pt.ang + 90 + side * spread;
    out.push({ x: pt.x, y: pt.y, node: (m) => <Leaf x={pt.x} y={pt.y} rot={rot} len={len} m={m} /> });
    side = -side;
  }
  const tip = bez(p, 1);
  out.push({ x: tip.x, y: tip.y, node: (m) => <Leaf x={tip.x} y={tip.y} rot={tip.ang + 90} len={l1 * 1.05} m={m} /> });
  return out;
}

function flower(x: number, y: number, r: number, rot: number): Item[] {
  const items: Item[] = [];
  [35, 150, 215, 325].forEach((a, i) => {
    const rad = (a * Math.PI) / 180;
    const lx = x + Math.cos(rad) * r * 0.85;
    const ly = y + Math.sin(rad) * r * 0.85;
    items.push({ x: lx, y: ly, node: (m) => <Leaf x={lx} y={ly} rot={a + 90} len={r * (0.85 - i * 0.04)} m={m} /> });
  });
  items.push({ x, y, node: (m) => <Peony x={x} y={y} r={r} rot={rot} m={m} /> });
  return items;
}

function bud(x: number, y: number, r: number, rot: number): Item {
  return { x, y, node: (m) => <Peony x={x} y={y} r={r} rot={rot} m={m} /> };
}

/* ---------- artwork per flap ---------- */

const LV: Pt[] = [[30, 720], [85, 560], [15, 330], [62, 110]];
const RV: Pt[] = [[362, 650], [305, 520], [378, 300], [330, 100]];
const S1: Pt[] = [[150, 835], [135, 790], [105, 750], [92, 690]];
const S2: Pt[] = [[240, 835], [255, 790], [285, 750], [298, 690]];

export const FLAP_ART: Record<FlapId, Item[]> = {
  t: [],
  l: [
    stem(LV),
    ...leavesAlong(LV, 0.06, 0.96, 0.085, 30, 18),
    ...flower(52, 255, 40, 10),
    ...flower(46, 520, 44, -8),
    bud(26, 700, 10, 0),
    bud(54, 744, 8, 20),
  ],
  r: [
    stem(RV),
    ...leavesAlong(RV, 0.06, 0.96, 0.085, 30, 18),
    ...flower(338, 305, 40, -12),
    ...flower(346, 566, 42, 6),
    bud(366, 650, 10, 0),
    bud(338, 700, 8, -20),
  ],
  b: [
    stem(S1),
    ...leavesAlong(S1, 0.12, 0.95, 0.11, 34, 20, 48),
    stem(S2),
    ...leavesAlong(S2, 0.12, 0.95, 0.11, 34, 20, 48),
  ],
};

const EDGES: Record<FlapId, [number, number, number, number][]> = {
  t: [[0, 0, CX, CY], [390, 0, CX, CY]],
  b: [[0, 844, CX, CY], [390, 844, CX, CY]],
  l: [[0, 0, CX, CY], [0, 844, CX, CY]],
  r: [[390, 0, CX, CY], [390, 844, CX, CY]],
};

function Layer({ items, m }: { items: Item[]; m: Mode }) {
  return (
    <>
      {items.map((it, i) => {
        const delay = (Math.hypot(it.x - CX, it.y - CY) / 340) * 0.9;
        return (
          <g key={i} className="it" style={{ ['--d' as string]: `${delay.toFixed(2)}s` }}>
            {it.node(m)}
          </g>
        );
      })}
    </>
  );
}

export function FlapSvg({ flap }: { flap: FlapId }) {
  const items = FLAP_ART[flap];
  const blur = `env-blur-${flap}`;
  return (
    <svg className="flap-svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id={blur} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>
      {items.length > 0 && (
        <>
          <g className="lay-dim"><Layer items={items} m="dim" /></g>
          <g className="lay lay-bright"><Layer items={items} m="bright" /></g>
          <g className="lay lay-glow" filter={`url(#${blur})`}><Layer items={items} m="glow" /></g>
        </>
      )}
      {EDGES[flap].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1 + 2} x2={x2} y2={y2 + 2} stroke="rgba(0,0,0,.55)" strokeWidth="2.4" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e4d0be" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}

/* ---------- wax seal (deep red, raised script) ---------- */

// The seal is a "height map" (white = high, grey = lower) lit by SVG lighting
// filters, so it reads as moulded wax: raised rim, uneven edge, raised letters.
const WAX_R = 56;
const WAX_RIN = 47;
const WAX_EDGE: [number, number, number][] = [[7, 1.3, 0], [11, 0.8, 1.5], [4, 1.1, 0.5]];

function blob(R: number, comps: [number, number, number][]) {
  const N = 200;
  let d = '';
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    let r = R;
    for (const [n, a, p] of comps) r += a * Math.sin(n * t + p);
    d += `${i ? 'L' : 'M'}${f(Math.cos(t) * r)} ${f(Math.sin(t) * r)}`;
  }
  return d + 'Z';
}

const WAX_PATH = blob(WAX_R, WAX_EDGE);

export function WaxSeal({ initials }: { initials: string }) {
  return (
    <svg viewBox="-70 -70 140 140" aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
      <defs>
        <mask id="wx-m" maskUnits="userSpaceOnUse" x="-70" y="-70" width="140" height="140">
          <rect x="-70" y="-70" width="140" height="140" fill="#000" />
          <path d={WAX_PATH} fill="#fff" />
          <circle r={WAX_RIN} fill="#b4b4b4" />
          <circle r="41" fill="none" stroke="#7a7a7a" strokeWidth="1.5" />
          <text
            x="0"
            y="13"
            textAnchor="middle"
            fontFamily="'Great Vibes','Pinyon Script','Snell Roundhand',cursive"
            fontSize="38"
            fill="#fff"
          >
            {initials}
          </text>
        </mask>
        <filter id="wx-f" filterUnits="userSpaceOnUse" x="-70" y="-70" width="140" height="140" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceAlpha" result="sil">
            <feFuncA type="linear" slope="40" />
          </feComponentTransfer>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="hm" />
          <feDiffuseLighting in="hm" surfaceScale="6" diffuseConstant="1.15" lightingColor="#ffffff" result="dif">
            <feDistantLight azimuth="225" elevation="48" />
          </feDiffuseLighting>
          <feSpecularLighting in="hm" surfaceScale="6" specularConstant="0.45" specularExponent="28" lightingColor="#ffffff" result="spc">
            <feDistantLight azimuth="225" elevation="48" />
          </feSpecularLighting>
          <feFlood floodColor="#cfae6d" result="base" />
          <feComposite in="dif" in2="base" operator="arithmetic" k1="1.08" k2="0" k3="0" k4="0" result="lit" />
          <feComposite in="lit" in2="spc" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit2" />
          <feComposite in="lit2" in2="sil" operator="in" result="body" />
          <feGaussianBlur in="sil" stdDeviation="3.4" result="sb" />
          <feOffset in="sb" dx="2" dy="5" result="so" />
          <feFlood floodColor="#000" floodOpacity="0.6" />
          <feComposite in2="so" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="body" />
          </feMerge>
        </filter>
        <radialGradient id="wx-v" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <g filter="url(#wx-f)">
        <rect x="-70" y="-70" width="140" height="140" fill="#000" mask="url(#wx-m)" />
      </g>
      <path d={WAX_PATH} fill="url(#wx-v)" />
    </svg>
  );
}
