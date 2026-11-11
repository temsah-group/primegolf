import { useEffect, useState } from 'react';
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion,
} from 'motion/react';
import { contact, wa } from '../content';
import { Reveal, Stagger, Item, ease } from './Motion';

const ext = { target: '_blank', rel: 'noopener noreferrer' };
const Ltr = ({ children }) => <bdi className="ltr">{children}</bdi>;

/** Types and deletes example names in a loop while the visitor hasn't typed anything. */
function useTypewriter(words, active) {
  const [text, setText] = useState('');
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const word = words[i % words.length];
    let delay = deleting ? 40 : 90;
    if (!deleting && text === word) delay = 1600;
    if (deleting && text === '') delay = 300;
    const id = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === '') { setDeleting(false); setI((n) => n + 1); }
      else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, i, words, active]);

  // Restart cleanly when the language (and so the word list) changes
  useEffect(() => { setText(''); setI(0); setDeleting(false); }, [words]);

  return text;
}

function TiltCard({ children }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 150, damping: 18 };
  const rotateX = useSpring(useTransform(my, [0, 1], [9, -9]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), spring);
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const shine = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,.22), transparent 45%)`;

  const move = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div className="pv__stage" onPointerMove={move} onPointerLeave={leave}>
      <div className="pv__float">
        <motion.div className="pv__card" style={{ rotateX, rotateY }}>
          <motion.div className="pv__shine" style={{ background: shine }} aria-hidden="true" />
          {children}
        </motion.div>
      </div>
    </div>
  );
}

const Row = ({ label, value, on = true }) => (
  <div className={`pv__row${on ? '' : ' is-off'}`}>
    <span className="pv__tick" aria-hidden="true" />
    <span className="pv__row-label">{label}</span>
    <motion.span
      className="pv__row-val" key={value}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}
    >
      {value}
    </motion.span>
  </div>
);

export function CompanyPreview({ t }) {
  const p = t.preview;
  const plans = t.pricing.plans;
  const [name, setName] = useState('');
  const [activity, setActivity] = useState(0);
  const [type, setType] = useState(0);
  const [visa, setVisa] = useState(true);

  const demo = useTypewriter(p.demoNames, name.trim() === '');
  const typed = name.trim();
  const display = typed || demo;
  const [, typeLabel, suffix] = p.types[type];
  const plan = plans[visa ? 1 : 0];
  const fullName = `${typed || p.demoNames[0]} ${suffix}`;

  const message = p.message(fullName, typeLabel, p.activities[activity], plan.name, plan.price);

  return (
    <section className="section pv" id="preview">
      <div className="pv__glow" aria-hidden="true" />
      <div className="container">
        <Stagger className="section__head" gap={0.12}>
          <Item as="span" className="eyebrow">{p.eyebrow}</Item>
          <Item as="h2">{p.title}</Item>
          <Item as="p" className="section__lead">{p.text}</Item>
        </Stagger>

        <div className="pv__grid">
          <Reveal className="pv__form">
            <label className="pv__field">
              <span>{p.nameLabel}</span>
              <input
                value={name} maxLength={40} placeholder={p.namePlaceholder}
                onChange={(e) => setName(e.target.value)} autoComplete="organization"
              />
            </label>

            <div className="pv__field">
              <span>{p.activityLabel}</span>
              <div className="calc__options">
                {p.activities.map((a, i) => (
                  <button type="button" key={a} className={`chip${activity === i ? ' is-on' : ''}`} aria-pressed={activity === i} onClick={() => setActivity(i)}>{a}</button>
                ))}
              </div>
            </div>

            <div className="pv__field">
              <span>{p.typeLabel}</span>
              <div className="pv__segment" role="group">
                {p.types.map(([id, label], i) => (
                  <button type="button" key={id} className={type === i ? 'is-on' : ''} aria-pressed={type === i} onClick={() => setType(i)}>
                    {type === i && <motion.span layoutId="pv-seg" className="pv__segment-bg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className={`pv__toggle${visa ? ' is-on' : ''}`} aria-pressed={visa} onClick={() => setVisa(!visa)}>
              <span className="pv__switch"><motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} /></span>
              {p.visaLabel}
            </button>

            <a className="btn btn--primary btn--lg pv__cta" href={wa(contact.salesPhone, message)} {...ext}>
              {p.cta} — <Ltr>{plan.price}</Ltr> <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <TiltCard>
              <div className="pv__top">
                <span className="pv__emblem">PG</span>
                <span className="pv__brand">PRIME GULF<small>ADVISORY</small></span>
                <span className="pv__tag">{p.card.tag}</span>
              </div>

              <div className="pv__name" aria-live="polite">
                <span className="pv__name-text">{display}</span>
                {!typed && <span className="pv__caret" aria-hidden="true" />}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={suffix} className="pv__suffix"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {suffix}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="pv__meta">
                <AnimatePresence mode="wait">
                  <motion.span key={`${activity}-${type}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {p.activities[activity]} · {typeLabel}
                  </motion.span>
                </AnimatePresence>
                <span>{p.card.city}</span>
              </div>

              <div className="pv__rows">
                <Row label={p.card.license} value={p.card.licenseVal} />
                <Row label={p.card.visa} value={visa ? p.card.visaVal : p.card.visaNone} on={visa} />
                <Row label={p.card.bank} value={p.card.bankVal} />
              </div>

              <div className="pv__foot">
                <div>
                  <span className="pv__foot-label">{p.card.package}</span>
                  <AnimatePresence mode="wait">
                    <motion.strong key={plan.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      {plan.name} · <Ltr>{plan.price}</Ltr>
                    </motion.strong>
                  </AnimatePresence>
                </div>
                <span className="pv__chip" aria-hidden="true" />
              </div>
              <p className="pv__disclaimer">{p.card.disclaimer}</p>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
