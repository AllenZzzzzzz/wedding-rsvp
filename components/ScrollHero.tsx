'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

export type HeroPhoto = {
  src: string;
  eyebrow: string;
  title: string;
  /** 'portrait' = tall photo: shown in full (not cropped) on wide screens. */
  fit?: 'cover' | 'portrait';
};

const HERO_CSS = `
.hero-blur{position:absolute;inset:-6%;background-size:cover;background-position:center;filter:blur(28px) brightness(.8);display:none}
.hero-img{position:absolute;inset:0;background-size:cover;background-position:center}
.hero-cap{position:absolute;left:0;right:0;bottom:14%}
@media (min-aspect-ratio: 1/1){
  .hero-layer[data-fit="portrait"] .hero-blur{display:block}
  .hero-layer[data-fit="portrait"] .hero-img{background-size:contain;background-repeat:no-repeat}
  .hero-layer[data-fit="portrait"] .hero-cap{bottom:auto;top:9%}
}
`;

/**
 * Apple-style pinned scroll hero. The section is tall (400vh); the visible
 * frame stays sticky at the top of the viewport while scroll progress
 * through that tall section drives each photo's opacity/scale, handing off
 * to the next photo in sequence.
 */
export default function ScrollHero({ photos }: { photos: HeroPhoto[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const step = 1 / photos.length;

  return (
    <div ref={ref} style={{ position: 'relative', height: `${photos.length * 100}vh` }}>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        {photos.map((photo, i) => (
          <Layer
            key={photo.src + i}
            photo={photo}
            index={i}
            step={step}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}

function Layer({
  photo,
  index,
  step,
  progress,
}: {
  photo: HeroPhoto;
  index: number;
  step: number;
  progress: MotionValue<number>;
}) {
  // Auto-detect tall photos so they are shown in full on wide screens.
  const [isTall, setIsTall] = useState(false);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setIsTall(img.naturalHeight > img.naturalWidth * 1.1);
    img.src = photo.src;
  }, [photo.src]);
  const fit = photo.fit || (isTall ? 'portrait' : 'cover');

  const start = index * step;
  const end = start + step;
  const fadeIn = start + step * 0.15;
  const fadeOut = end - step * 0.15;

  const opacity = useTransform(
    progress,
    [start, fadeIn, fadeOut, end],
    [index === 0 ? 1 : 0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, end], [1.08, 0.96]);

  return (
    <motion.div
      className="hero-layer"
      data-fit={fit}
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        scale,
      }}
    >
      <div className="hero-blur" style={{ backgroundImage: `url(${photo.src})` }} />
      <div className="hero-img" style={{ backgroundImage: `url(${photo.src})` }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0) 45%)',
        }}
      />
      <div
        className="hero-cap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          color: '#fff',
          textShadow: '0 2px 16px rgba(0,0,0,.35)',
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        <span
          style={{
            fontFamily: "'Jost', Arial, sans-serif",
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          {photo.eyebrow}
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 5vw, 40px)',
          }}
        >
          {photo.title}
        </span>
      </div>
    </motion.div>
  );
}
