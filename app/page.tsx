import StoryHero, { type StoryChapter } from '@/components/StoryHero';
import ParallaxGallery from '@/components/ParallaxGallery';
import RsvpForm from '@/components/RsvpForm';
import EnvelopeIntro from '@/components/EnvelopeIntro';
import Countdown from '@/components/Countdown';
import Venue from '@/components/Venue';
import DateCalendar from '@/components/DateCalendar';
import Stays from '@/components/Stays';

// The four chapters of the scroll story. Each photo is /public/photos/hero-N.jpg.
// Edit the words freely. "meta" is an optional small gold line (leave it out to hide it).
const STORY_TITLE = 'From Best Friend to Forever';
const STORY_CHAPTERS: StoryChapter[] = [
  {
    heading: 'Our Story',
    text: 'It started as a friendship, and quietly became everything.',
    src: '/photos/hero-1.jpg',
  },
  {
    heading: 'The Proposal',
    text: 'A mountain peak, one knee, and the easiest yes.',
    src: '/photos/hero-2.jpg',
  },
  {
    heading: 'Tie the Knot',
    text: 'We made it official, and we are only getting started.',
    src: '/photos/hero-3.jpg',
  },
  {
    heading: 'The Celebration',
    text: 'We cannot wait to celebrate forever with you.',
    meta: '6 March 2027 · Chiang Mai',
    src: '/photos/hero-4.jpg',
    position: '50% 40%',
  },
];

const GALLERY_PHOTOS = [
  { src: '/photos/gallery-1.jpg' },
  { src: '/photos/gallery-2.jpg' },
  { src: '/photos/gallery-3.jpg' },
  { src: '/photos/gallery-4.jpg' },
  { src: '/photos/gallery-5.jpg' },
  { src: '/photos/gallery-6.jpg' },
  { src: '/photos/gallery-7.jpg' },
  { src: '/photos/gallery-8.jpg' },
];

export default function HomePage() {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <EnvelopeIntro />
      <StoryHero title={STORY_TITLE} chapters={STORY_CHAPTERS} />

      <section className="container" style={{ padding: '72px 20px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Evening Banquet</div>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 500, margin: '0 0 12px' }}>
          Allen &amp; Yoon
        </h1>
        <DateCalendar />
        <p style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: 15, letterSpacing: '0.08em', color: 'var(--ink)', margin: '22px auto 0' }}>
          Heritage Garden, Chiang Mai
        </p>
        <p style={{ fontFamily: "'Jost', Arial, sans-serif", fontSize: 12, color: 'var(--ink-soft)', maxWidth: '42ch', margin: '14px auto 0', fontStyle: 'italic' }}>
          Flights and accommodation are not arranged by the couple — please book your own travel.
        </p>
        <Countdown />
      </section>

      <Venue />

      <Stays />

      <section className="container" style={{ padding: '0 20px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Our Story</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 500, margin: 0 }}>Gallery</h2>
        </div>
        <ParallaxGallery photos={GALLERY_PHOTOS} />
      </section>

      <section id="rsvp" className="container" style={{ padding: '0 20px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Kindly Respond</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 500, margin: '0 0 10px' }}>RSVP</h2>
          <p style={{ fontFamily: "'Jost', Arial, sans-serif", fontSize: 13, color: 'var(--ink-soft)' }}>
            Please respond by 30th December 2026.
          </p>
        </div>
        <RsvpForm />
      </section>
    </main>
  );
}
