// "Nearby Stays" section. Edit the arrays below to add, remove or change a stay.

const MAIL_SUBJECT = 'Allen & Yoon wedding group rate';
const MAIL_BODY =
  "Hello, I am attending Allen & Yoon's wedding banquet at Heritage Garden, Chiang Mai on 6 March 2027 " +
  'and would like to ask about the group rate.\n\nCheck-in date:\nCheck-out date:\nNumber of rooms and guests:\n\nThank you.';

type Resort = { name: string; email: string };
type Villa = { name: string; details: string; airbnb: string; map?: string };

const RESORTS: Resort[] = [
  { name: 'Veranda High Resort Chiang Mai', email: 'anchalee@verandaresort.com' },
  { name: 'TreeScape Resort Chiang Mai', email: 'reservation.treescaperesort@gmail.com' },
  { name: 'Royal Train Garden Resort', email: 'royaltraingarden1@gmail.com' },
];

const VILLAS: Villa[] = [
  {
    name: 'Artee PoolVilla',
    details: '4 bedrooms · 8 guests · 2 min from Heritage Garden',
    airbnb: 'https://www.airbnb.com/rooms/1595976712455309170',
    map: 'https://maps.app.goo.gl/3Bd6qmWf1kxqJ6z89',
  },
  {
    name: 'Designer Villa',
    details: '3 bedrooms · 8 guests · 2 min from Heritage Garden',
    airbnb: 'https://airbnb.com/h/baansaisanctuary',
  },
];

const mailto = (email: string) =>
  `mailto:${email}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
const mapSearch = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(/chiang\s?mai/i.test(name) ? name : name + ' Chiang Mai')}`;

const CSS = `
.stay-sec{--v-display:'Cinzel',Georgia,serif;--v-body:'Lato',system-ui,sans-serif;padding:0 20px 88px;text-align:center}
.stay-eyebrow{font-family:var(--v-body);font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 10px}
.stay-title{font-family:var(--v-display);font-weight:400;font-size:clamp(28px,7.5vw,40px);letter-spacing:.08em;text-transform:uppercase;margin:0;color:var(--ink)}
.stay-sub{font-family:var(--v-body);font-size:14px;color:var(--ink-soft);max-width:44ch;margin:12px auto 28px}
.stay-group{font-family:var(--v-display);font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin:30px 0 6px}
.stay-grouphelp{font-family:var(--v-body);font-size:13px;color:var(--ink-soft);margin:0 auto 14px;max-width:46ch}
.stay-list{display:flex;flex-direction:column;gap:10px;max-width:520px;margin:0 auto;text-align:left}
.stay-item{border:1px solid var(--line);border-radius:10px;background:var(--paper-raised);min-width:0;overflow:hidden}
.stay-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px}
.stay-item summary::-webkit-details-marker{display:none}
.stay-item summary:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.stay-name{font-family:var(--v-display);font-weight:500;font-size:16px;letter-spacing:.04em;margin:0;color:var(--ink);text-wrap:balance}
.stay-tag{font-family:var(--v-body);font-size:12px;color:var(--ink-soft);margin:3px 0 0}
.stay-plus{flex:none;font-size:22px;line-height:1;color:var(--accent);transition:transform .25s}
.stay-item[open] .stay-plus{transform:rotate(45deg)}
.stay-body{padding:0 16px 16px;display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--line);padding-top:14px}
.stay-meta{font-family:var(--v-body);font-size:13px;color:var(--ink-soft);margin:0}
.stay-acts{display:flex;gap:8px;flex-wrap:wrap}
.stay-btn{font-family:var(--v-body);font-size:11px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;
  padding:10px 12px;border:1px solid var(--ink);border-radius:2px;color:var(--ink);background:transparent;
  transition:background .2s,color .2s}
.stay-btn.solid{background:var(--ink);color:var(--paper)}
.stay-btn:hover,.stay-btn:focus-visible{background:var(--accent);border-color:var(--accent);color:var(--paper);outline:none}
.stay-note{font-family:var(--v-body);font-size:12px;color:var(--ink-soft);margin:26px auto 0;max-width:50ch}
`;

export default function Stays() {
  return (
    <section className="stay-sec" aria-labelledby="stay-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <p className="stay-eyebrow">Stay close to the celebration</p>
      <h2 id="stay-title" className="stay-title">Nearby Stays</h2>
      <p className="stay-sub">
        Flights and accommodation are not arranged by the couple. These places are near Heritage Garden.
      </p>

      <h3 className="stay-group">Resorts</h3>
      <p className="stay-grouphelp">
        Group rates are available. Email the resort to enquire.
      </p>
      <div className="stay-list">
        {RESORTS.map((r) => (
          <details className="stay-item" key={r.name}>
            <summary>
              <div>
                <h4 className="stay-name">{r.name}</h4>
                <p className="stay-tag">Resort · group rates</p>
              </div>
              <span className="stay-plus" aria-hidden="true">+</span>
            </summary>
            <div className="stay-body">
              <p className="stay-meta">Group rates available. Email to book.</p>
              <div className="stay-acts">
                <a className="stay-btn solid" href={mailto(r.email)}>Email for group rate</a>
                <a className="stay-btn" href={mapSearch(r.name)} target="_blank" rel="noopener noreferrer">Map</a>
              </div>
            </div>
          </details>
        ))}
      </div>

      <h3 className="stay-group">Private Villas</h3>
      <div className="stay-list">
        {VILLAS.map((v) => (
          <details className="stay-item" key={v.name}>
            <summary>
              <div>
                <h4 className="stay-name">{v.name}</h4>
                <p className="stay-tag">Private villa · {v.details.split(' · ').slice(0, 2).join(' · ')}</p>
              </div>
              <span className="stay-plus" aria-hidden="true">+</span>
            </summary>
            <div className="stay-body">
              <p className="stay-meta">{v.details.split(' · ').slice(2).join(' · ')}</p>
              <div className="stay-acts">
                <a className="stay-btn solid" href={v.airbnb} target="_blank" rel="noopener noreferrer">View on Airbnb</a>
                {v.map && (
                  <a className="stay-btn" href={v.map} target="_blank" rel="noopener noreferrer">Map</a>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>

      <p className="stay-note">
        These are suggestions only. Please confirm availability and rates directly with each property.
      </p>
    </section>
  );
}
