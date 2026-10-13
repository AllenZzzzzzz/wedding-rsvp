'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export type GalleryPhoto = { src: string; caption?: string };

/**
 * Horizontal scroll-snapping strip. Each photo fades/slides in as it enters
 * the viewport and slow-zooms on hover, per the "Parallax Scroll" style
 * approved from the demo artifact.
 */
export default function ParallaxGallery({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollSnapType: 'x proximity',
      }}
    >
      {photos.map((photo, i) => (
        <Card key={photo.src + i} photo={photo} index={i} />
      ))}
    </div>
  );
}

function Card({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.6'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y,
        flex: '0 0 62%',
        maxWidth: 420,
        aspectRatio: '4 / 5',
        scrollSnapAlign: 'center',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 8px 24px -12px rgba(0,0,0,.25)',
        position: 'relative',
      }}
      whileHover="hover"
    >
      <motion.img
        src={photo.src}
        alt={photo.caption || ''}
        loading="lazy"
        decoding="async"
        variants={{ hover: { scale: 1.08 } }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {photo.caption && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '14px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,.5), transparent)',
            color: '#fff',
            fontFamily: "'Jost', Arial, sans-serif",
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {photo.caption}
        </div>
      )}
    </motion.div>
  );
}
