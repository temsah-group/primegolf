// Animated, light background for the hero: drifting aurora, flowing light lines,
// floating particles and a soft spotlight that follows the cursor.

// Deterministic pseudo-random so the layout is stable between renders
const rand = (i, n) => {
  const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  left: rand(i, 1) * 100,
  size: 3 + rand(i, 2) * 5,
  dur: 14 + rand(i, 3) * 16,
  delay: -rand(i, 4) * 30,
  drift: (rand(i, 5) - 0.5) * 120,
  gold: rand(i, 6) > 0.72,
}));

const LINES = [
  'M-80 600 C 260 510, 520 700, 860 580 S 1290 440, 1540 520',
  'M-80 700 C 340 630, 700 780, 1040 680 S 1360 620, 1540 670',
];

export function HeroBg() {
  return (
    <div className="hbg" aria-hidden="true">
      <div className="hbg__aurora hbg__aurora--1" />
      <div className="hbg__aurora hbg__aurora--2" />
      <div className="hbg__aurora hbg__aurora--3" />
      <div className="hbg__grid" />

      <svg className="hbg__lines" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hbgLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#b8913f" stopOpacity="0" />
            <stop offset="0.5" stopColor="#b8913f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#b8913f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {LINES.map((d, i) => (
          <g key={i} className="hbg__wave" style={{ animationDelay: `${-i * 3}s` }}>
            <path d={d} className="hbg__path" pathLength="1000" />
            <path d={d} className="hbg__pulse" pathLength="1000" style={{ animationDelay: `${-i * 2.6}s` }} />
          </g>
        ))}
      </svg>

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`hbg__p${p.gold ? ' hbg__p--gold' : ''}`}
          style={{ '--l': `${p.left}%`, '--s': `${p.size}px`, '--d': `${p.dur}s`, '--dl': `${p.delay}s`, '--x': `${p.drift}px` }}
        />
      ))}

      <div className="hbg__spot" />
    </div>
  );
}
