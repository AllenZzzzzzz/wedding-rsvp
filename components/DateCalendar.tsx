// A mini calendar for March 2027 with the wedding day circled.
// Pure markup: no client-side code needed.

const YEAR = 2027;
const MONTH_INDEX = 2; // March (0-based)
const HIGHLIGHT_DAY = 6;
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CSS = `
.cal{width:min(100%,340px);margin:26px auto 0}
.cal-head{font-family:'Cinzel',Georgia,serif;font-weight:500;font-size:clamp(20px,5.6vw,26px);letter-spacing:.3em;text-transform:uppercase;margin:0 0 14px;color:var(--ink)}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-family:'Lato',system-ui,sans-serif;font-size:14px;color:var(--ink)}
.cal-grid .h{font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--ink-soft);padding-bottom:6px}
.cal-grid span{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:50%;font-variant-numeric:tabular-nums}
.cal-grid .on{background:var(--accent);color:var(--paper);font-weight:900;font-size:18px;box-shadow:0 0 0 4px var(--accent-soft)}
.cal-cap{font-family:'Lato',system-ui,sans-serif;font-size:13px;letter-spacing:.22em;text-transform:uppercase;margin:18px 0 0;color:var(--ink-soft)}
.cal-cap b{color:var(--ink);font-weight:700}
`;

export default function DateCalendar() {
  const first = new Date(Date.UTC(YEAR, MONTH_INDEX, 1)).getUTCDay();
  const days = new Date(Date.UTC(YEAR, MONTH_INDEX + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div
      className="cal"
      role="img"
      aria-label="Saturday, 6 March 2027, 5:00 PM onward"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <p className="cal-head">March 2027</p>
      <div className="cal-grid" aria-hidden="true">
        {WEEKDAYS.map((d, i) => (
          <span key={`h${i}`} className="h">{d}</span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`b${i}`} />
          ) : (
            <span key={d} className={d === HIGHLIGHT_DAY ? 'on' : undefined}>{d}</span>
          )
        )}
      </div>
      <p className="cal-cap">
        <b>Saturday</b> &middot; 5:00 PM onward
      </p>
    </div>
  );
}
