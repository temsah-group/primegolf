import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { contact, images, wa } from '../content';
import { WhatsAppIcon } from './Icons';
import { Reveal, Stagger, Item, ease } from './Motion';

const ext = { target: '_blank', rel: 'noopener noreferrer' };
const Ltr = ({ children }) => <bdi className="ltr">{children}</bdi>;
const euros = (s) => parseInt(s.replace(/[^\d]/g, ''), 10);

function SectionHead({ eyebrow, title, text }) {
  return (
    <Stagger className="section__head" gap={0.12}>
      <Item as="span" className="eyebrow">{eyebrow}</Item>
      <Item as="h2">{title}</Item>
      {text && <Item as="p" className="section__lead">{text}</Item>}
    </Stagger>
  );
}

/* ---------- Mainland vs Free Zone ---------- */
export function Compare({ t }) {
  const c = t.compare;
  return (
    <section className="section" id="compare">
      <div className="container">
        <SectionHead eyebrow={c.eyebrow} title={c.title} text={c.text} />
        <Reveal className="compare">
          <div className="compare__row compare__row--head">
            <span />
            {c.cols.map((col, i) => (
              <span key={col} className={`compare__col compare__col--${i ? 'fz' : 'ml'}`}>{col}</span>
            ))}
          </div>
          {c.rows.map(([label, ml, fz], i) => (
            <motion.div
              className="compare__row" key={label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.5, ease, delay: i * 0.05 }}
            >
              <span className="compare__label">{label}</span>
              <span className="compare__cell" data-col={c.cols[0]}>{ml}</span>
              <span className="compare__cell" data-col={c.cols[1]}>{fz}</span>
            </motion.div>
          ))}
        </Reveal>
        <Reveal className="compare__foot" delay={0.1}>
          <p>{c.note}</p>
          <a className="btn btn--ghost" href={contact.whatsapp} {...ext}>{c.cta}</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Cost calculator / package finder ---------- */
function pickPlan({ visa, speed, extras }) {
  if (extras.length > 0 || (visa === 'yes' && speed === 'express')) return 2; // VIP
  if (visa === 'yes') return 1; // Gold
  return 0; // Silver
}

export function Calculator({ t }) {
  const c = t.calculator;
  const plans = t.pricing.plans;
  const [answers, setAnswers] = useState({ visa: 'no', speed: 'standard', extras: [] });

  const choose = (q, value) => setAnswers((a) => {
    if (!q.multi) return { ...a, [q.id]: value };
    const list = a[q.id].includes(value) ? a[q.id].filter((v) => v !== value) : [...a[q.id], value];
    return { ...a, [q.id]: list };
  });

  const index = pickPlan(answers);
  const plan = plans[index];
  const saving = euros(plan.old) - euros(plan.price);
  const visible = c.questions.filter((q) => !q.showIf || Object.entries(q.showIf).every(([k, v]) => answers[k] === v));

  return (
    <section className="section section--tint" id="calculator">
      <div className="container">
        <SectionHead eyebrow={c.eyebrow} title={c.title} text={c.text} />
        <div className="calc">
          <Reveal className="calc__questions">
            <AnimatePresence initial={false}>
              {visible.map((q, qi) => (
                <motion.fieldset
                  key={q.id} className="calc__q"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <legend><span className="calc__num">{qi + 1}</span>{q.label}</legend>
                  <div className="calc__options">
                    {q.options.map(([value, label]) => {
                      const on = q.multi ? answers[q.id].includes(value) : answers[q.id] === value;
                      return (
                        <button
                          type="button" key={value}
                          className={`chip${on ? ' is-on' : ''}${q.multi ? ' chip--check' : ''}`}
                          aria-pressed={on} onClick={() => choose(q, value)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </motion.fieldset>
              ))}
            </AnimatePresence>
          </Reveal>

          <Reveal className="calc__result" delay={0.15} aria-live="polite">
            <span className="calc__result-label">{c.result}</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3, ease }}
              >
                <h3>{plan.name}</h3>
                <p className="calc__sub">{plan.sub}</p>
                <div className="calc__price">
                  <strong><Ltr>{plan.price}</Ltr></strong>
                  <s><Ltr>{plan.old}</Ltr></s>
                </div>
                <span className="calc__save">{c.save} <Ltr>€{saving.toLocaleString('en-US')}</Ltr></span>
                <p className="calc__hl">{c.highlights}</p>
                <ul>{plan.features.slice(0, 6).map((f) => <li key={f}>{f}</li>)}</ul>
              </motion.div>
            </AnimatePresence>
            <a className="btn btn--primary btn--block btn--lg" href={wa(contact.salesPhone, c.message(plan.name, plan.price))} {...ext}>
              {c.cta} <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
            <p className="calc__note">{c.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact + quote form ---------- */
export function Contact({ t }) {
  const q = t.quote;
  const [form, setForm] = useState({ name: '', service: q.services[0], details: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const text = q.message(form.name.trim(), form.service, form.details.trim());
    window.open(wa(contact.salesPhone, text), '_blank', 'noopener');
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <motion.div
          className="contact"
          initial={{ opacity: 0, scale: 0.97, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, ease }}
        >
          <div className="cta__bg" style={{ backgroundImage: `url(${images.cta})` }} aria-hidden="true" />
          <Stagger className="contact__info" gap={0.1} delay={0.25}>
            <Item as="span" className="eyebrow eyebrow--light">{q.eyebrow}</Item>
            <Item as="h2">{q.title}</Item>
            <Item as="p">{q.text}</Item>
            <Item as="p" className="contact__or">{q.or}</Item>
            <Item as="ul" className="contact__list">
              <li><span>{q.phone}</span><a href={`tel:${contact.tel}`}><Ltr>{contact.phone}</Ltr></a></li>
              <li><span>{q.email}</span><a href={`mailto:${contact.email}`}><Ltr>{contact.email}</Ltr></a></li>
              <li><span>WhatsApp</span><a href={contact.whatsapp} {...ext}><Ltr>{contact.phone}</Ltr></a></li>
            </Item>
          </Stagger>

          <Reveal as="form" className="quote" onSubmit={submit} delay={0.35}>
            <label>
              <span>{q.name}</span>
              <input required value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
            <label>
              <span>{q.service}</span>
              <select value={form.service} onChange={set('service')}>
                {q.services.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <span>{q.details}</span>
              <textarea rows={3} value={form.details} onChange={set('details')} />
            </label>
            <button className="btn btn--primary btn--block btn--lg" type="submit">
              <WhatsAppIcon /> {q.submit}
            </button>
            <p className="quote__privacy">{q.privacy}</p>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Sticky mobile call / WhatsApp bar ---------- */
export function MobileBar({ t }) {
  return (
    <motion.div
      className="mobile-bar"
      initial={{ y: 80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease, delay: 1.2 }}
    >
      <a className="mobile-bar__call" href={`tel:${contact.tel}`}>{t.mobileBar.call}</a>
      <a className="mobile-bar__wa" href={contact.whatsapp} {...ext}><WhatsAppIcon /> {t.mobileBar.whatsapp}</a>
    </motion.div>
  );
}
