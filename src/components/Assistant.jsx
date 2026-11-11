import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { contact, wa } from '../content';
import { WhatsAppIcon } from './Icons';
import { ease } from './Motion';

const ext = { target: '_blank', rel: 'noopener noreferrer' };
const TYPING_MS = 750;

const QUESTION = { goal: 'goalQ', visa: 'visaQ', type: 'typeQ', when: 'whenQ', name: 'nameQ' };
const OPTIONS = { goal: 'goals', visa: 'yesNo', type: 'types', when: 'whens' };

function nextStep(step, a) {
  if (step === 'goal') {
    if (a.goal === 'company') return 'visa';
    if (a.goal === 'visa') return 'type';
    return 'when';
  }
  if (step === 'visa') return 'type';
  if (step === 'type') return 'when';
  if (step === 'when') return 'name';
  return 'done';
}

const labelOf = (list, value) => (list.find(([v]) => v === value) || [])[1];

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm2 7.5a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Z" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" /></svg>
);

export function Assistant({ t }) {
  const A = t.assistant;
  const plans = t.pricing.plans;
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(null);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState('');
  const timers = useRef([]);
  const bodyRef = useRef(null);
  const idRef = useRef(0);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const push = (from, text) => setMsgs((m) => [...m, { id: ++idRef.current, from, text }]);

  // Bot "types" each message in turn, then moves to the next step
  const botSay = useCallback((texts, then) => {
    texts.forEach((text, i) => {
      timers.current.push(setTimeout(() => setTyping(true), i * (TYPING_MS + 250)));
      timers.current.push(setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, { id: ++idRef.current, from: 'bot', text }]);
        if (i === texts.length - 1 && then) then();
      }, i * (TYPING_MS + 250) + TYPING_MS));
    });
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setMsgs([]); setAnswers({}); setStep(null); setName(''); setTyping(false);
    botSay([A.greet, A.goalQ], () => setStep('goal'));
  }, [A, botSay]);

  // Fresh conversation whenever the language changes
  useEffect(() => {
    clearTimers();
    setMsgs([]); setAnswers({}); setStep(null); setTyping(false);
    if (open) start();
  }, [t]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimers(), []);

  // Gentle teaser bubble a few seconds after load (once per visit)
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('pg-teaser') === '1'; } catch { /* storage unavailable */ }
    if (seen) return undefined;
    const id = setTimeout(() => setTeaser(true), 6000);
    return () => clearTimeout(id);
  }, []);

  const dismissTeaser = () => {
    setTeaser(false);
    try { sessionStorage.setItem('pg-teaser', '1'); } catch { /* storage unavailable */ }
  };

  const toggle = () => {
    dismissTeaser();
    if (!open && msgs.length === 0 && !typing) start();
    setOpen(!open);
  };

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, step]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const summary = (a) => {
    const texts = [];
    const plan = a.goal === 'company' || a.goal === 'visa' ? plans[a.visa === 'yes' ? 1 : 0] : null;
    if (plan) texts.push(A.summaryPlan(plan.name, plan.price, plan.old));
    if (a.goal === 'bank') texts.push(A.summaryBank);
    if (a.goal === 'accounting') texts.push(A.summaryAccounting);
    if (a.type === 'unsure') texts.push(A.summaryUnsure);
    texts.push(A.next);
    return texts;
  };

  const answer = (value, label) => {
    const a = { ...answers, [step]: value };
    if (step === 'goal' && value === 'visa') a.visa = 'yes';
    setAnswers(a);
    push('user', label);
    const next = nextStep(step, a);
    setStep(null);
    if (next === 'done') botSay(summary(a), () => setStep('done'));
    else botSay([A[QUESTION[next]]], () => setStep(next));
  };

  const submitName = (e) => {
    e.preventDefault();
    const n = name.trim();
    const a = { ...answers, name: n };
    setAnswers(a);
    if (n) push('user', n);
    setStep(null);
    botSay(summary(a), () => setStep('done'));
  };

  const waText = () => {
    const a = answers;
    const L = A.labels;
    const lines = [`${L.goal}: ${labelOf(A.goals, a.goal)}`];
    if (a.visa) lines.push(`${L.visa}: ${labelOf(A.yesNo, a.visa)}`);
    if (a.type) lines.push(`${L.type}: ${labelOf(A.types, a.type)}`);
    if (a.when) lines.push(`${L.when}: ${labelOf(A.whens, a.when)}`);
    if (a.goal === 'company' || a.goal === 'visa') {
      const plan = plans[a.visa === 'yes' ? 1 : 0];
      lines.push(`${L.plan}: ${plan.name} (${plan.price})`);
    }
    return A.message(a.name, lines);
  };

  const options = step && OPTIONS[step] ? A[OPTIONS[step]] : null;

  return (
    <>
      <AnimatePresence>
        {teaser && !open && (
          <motion.div
            className="as__teaser"
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.35, ease }}
          >
            <button className="as__teaser-text" onClick={toggle}>{A.teaser} <span aria-hidden="true">👋</span></button>
            <button className="as__teaser-x" onClick={dismissTeaser} aria-label={A.close}><CloseIcon /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`as__launcher${open ? ' is-open' : ''}`}
        onClick={toggle} aria-expanded={open} aria-label={open ? A.close : A.launcher}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.4 }}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'chat'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {open ? <CloseIcon /> : <ChatIcon />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="as__panel" role="dialog" aria-label={A.title}
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease }}
          >
            <header className="as__head">
              <span className="as__avatar">PG</span>
              <div>
                <strong>{A.title}</strong>
                <span className="as__status"><span className="as__online" />{A.status}</span>
              </div>
              <button className="as__close" onClick={() => setOpen(false)} aria-label={A.close}><CloseIcon /></button>
            </header>

            <div className="as__body" ref={bodyRef} aria-live="polite">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.div
                    key={m.id} className={`as__msg as__msg--${m.from}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    {m.text}
                  </motion.div>
                ))}
                {typing && (
                  <motion.div key="typing" className="as__msg as__msg--bot as__typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span /><span /><span />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="as__foot">
              {options && (
                <motion.div className="as__options" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={step}>
                  {options.map(([value, label]) => (
                    <button key={value} className="chip" onClick={() => answer(value, label)}>{label}</button>
                  ))}
                </motion.div>
              )}
              {step === 'name' && (
                <motion.form className="as__name" onSubmit={submitName} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={A.namePlaceholder} maxLength={40} autoComplete="name" autoFocus />
                  <button type="submit" className="btn btn--primary">{name.trim() ? A.send : A.skip}</button>
                </motion.form>
              )}
              {step === 'done' && (
                <motion.div className="as__done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <a className="btn btn--primary btn--block" href={wa(contact.salesPhone, waText())} {...ext}><WhatsAppIcon /> {A.cta}</a>
                  <button className="as__restart" onClick={start}>{A.restart}</button>
                </motion.div>
              )}
              <a className="as__direct" href={contact.whatsapp} {...ext}>{A.direct}</a>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
