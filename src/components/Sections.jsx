import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { contact, images, partnerLogos } from '../content';
import { Icon, ShieldIcon, WhatsAppIcon, serviceIcons, aboutIcons } from './Icons';
import { Reveal, Stagger, Item, CountUp, ease } from './Motion';
import { HeroBg } from './HeroBg';

// Three.js is heavy, so the globe loads in its own chunk after the page is up
const Globe = lazy(() => import('./Globe'));

const ext = { target: '_blank', rel: 'noopener noreferrer' };
const Ltr = ({ children }) => <bdi className="ltr">{children}</bdi>;

function Logo({ t, light }) {
  return (
    <a href="#top" className={`logo${light ? ' logo--light' : ''}`}>
      <span className="logo__mark">PG</span>
      <span className="logo__text">{t.brand.name} <small>{t.brand.sub}</small></span>
    </a>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <Stagger className="section__head" gap={0.12}>
      <Item as="span" className="eyebrow">{eyebrow}</Item>
      <Item as="h2">{title}</Item>
    </Stagger>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

export function Nav({ t, onSwitch }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (window.scrollY < window.innerHeight * 0.5) setActive(''); // still in the hero
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the nav link of the section currently on screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    t.nav.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [t.nav]);

  return (
    <motion.header
      className={`nav${scrolled ? ' is-scrolled' : ''}`}
      id="top"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="container nav__inner">
        <Logo t={t} />
        <nav className={`nav__links${open ? ' is-open' : ''}`}>
          {t.nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
        <button className="lang" onClick={onSwitch}>{t.switchLabel}</button>
        <a className="btn btn--primary nav__cta" href={t.navCta.href} {...ext}>{t.navCta.label}</a>
        <button className={`nav__toggle${open ? ' is-open' : ''}`} aria-label={t.menu} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </motion.header>
  );
}

export function Hero({ t }) {
  const h = t.hero;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Soft spotlight follows the cursor (desktop pointers only)
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section className="hero" ref={ref} onPointerMove={onPointerMove}>
      <HeroBg />
      <svg className="hero__skyline" viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 220V170h40v-30h30v40h25v-60h35v60h20v-90h40v90h18v-50h28v50h30V120h24v-20h20v20h24v100h22v-70h36v70h20V90h18V60h12v30h18v130h26v-80h40v80h22v-110h30v110h20v-60h34v60h24V70h14V30h6V0h4v30h6v40h14v150h26v-90h38v90h22v-130h36v130h18v-70h30v70h26V110h20V80h22v30h20v110h24v-60h40v60h20v-100h34v100h22v-50h32v50h26V100h30v120h24v-70h36v70h22v-40h40v40h30v-90h28v90h30v-60h40v60h32V220z" />
      </svg>
      <div className="container hero__grid">
        <Stagger className="hero__copy" onLoad gap={0.12} delay={0.15}>
          <Item as="span" className="eyebrow">{h.eyebrow}</Item>
          <Item as="h1">{h.title} <span className="accent">{h.accent}</span></Item>
          <Item as="p" className="lead">{h.lead}</Item>
          <Item className="hero__actions">
            <a className="btn btn--primary btn--lg" href={h.primary.href} {...ext}>
              {h.primary.label} <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn btn--ghost btn--lg" href="#calculator">{h.secondary}</a>
          </Item>
          <Item as="ul" className="hero__trust">
            {h.trust.map((x) => <li key={x}><span className="check check--sm" />{x}</li>)}
          </Item>
        </Stagger>

        <div className="hero__visual">
          <motion.div
            className="hero__globe"
            style={{ y: globeY }}
            initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.6, ease, delay: 0.2 }}
          >
            <Suspense fallback={<div className="globe globe--loading" />}>
              <Globe />
            </Suspense>
            <span className="hero__globe-tag"><span className="dot" /> {h.globeTag}</span>
          </motion.div>

          <motion.div className="hero__card-wrap" style={{ y: cardY }}>
            <motion.div
              className="hero__card"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.8 }}
            >
              <div className="hero__card-head"><span className="dot" /> {h.cardTitle}</div>
              <ul className="stats">
                {h.stats.map(([n, l], i) => (
                  <li key={i}><strong><CountUp value={n} delay={1 + i * 0.12} /></strong><span>{l}</span></li>
                ))}
              </ul>
              <div className="hero__card-foot"><ShieldIcon /> {h.compliant}</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function About({ t }) {
  const a = t.about;
  return (
    <section className="section" id="about">
      <div className="container">
        {/* Two-column header: title on one side, intro text on the other */}
        <Stagger className="ab__head" gap={0.12}>
          <Item>
            <span className="eyebrow">{a.eyebrow}</span>
            <h2>{a.title}</h2>
          </Item>
          <Item as="p" className="ab__intro">{a.text}</Item>
        </Stagger>

        {/* Bento grid: one large photo tile + four feature tiles */}
        <Stagger className="ab__bento" gap={0.1} amount={0.2}>
          <Item className="ab__photo">
            <img src={images.about} alt={a.imageAlt} loading="lazy" />
            <div className="ab__photo-badge">
              <strong><CountUp value={a.badge[0]} delay={0.4} /></strong>
              <span>{a.badge[1]}</span>
            </div>
          </Item>
          {a.points.map(([title, text], i) => (
            <Item className={`ab__tile${i === 0 ? ' ab__tile--accent' : ''}`} key={title}>
              <span className="ab__icon"><Icon d={aboutIcons[i]} /></span>
              <div className="ab__tile-text">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Services({ t }) {
  const s = t.services;
  return (
    <section className="section section--tint" id="services">
      <div className="container">
        <SectionHead eyebrow={s.eyebrow} title={s.title} />
        <Stagger className="services" gap={0.12}>
          {s.items.map(([title, text], i) => (
            <Item as="article" className="service" key={i}>
              <div className="service__media">
                <img src={images.services[i]} alt="" loading="lazy" />
              </div>
              <div className="service__body">
                <div className="service__icon"><Icon d={serviceIcons[i]} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </Item>
          ))}
        </Stagger>
        <p className="swipe-hint">{t.swipe} <span aria-hidden="true">→</span></p>
      </div>
    </section>
  );
}

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const circleVariants = {
  hidden: { scale: 0.4, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 14 } },
};
const lineVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease, delay: 0.35 } },
};

export function Process({ t }) {
  const p = t.process;
  return (
    <section className="section" id="process">
      <div className="container">
        <SectionHead eyebrow={p.eyebrow} title={p.title} />
        <Stagger as="ol" className="steps" gap={0.35} amount={0.4}>
          {p.steps.map(([title, text], i) => (
            <Item as="li" key={i} variants={stepVariants}>
              {i < p.steps.length - 1 && <motion.span className="steps__line" variants={lineVariants} aria-hidden="true" />}
              <motion.span className="steps__n" variants={circleVariants}>{String(i + 1).padStart(2, '0')}</motion.span>
              <h4>{title}</h4>
              <p>{text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Pricing({ t }) {
  const p = t.pricing;
  return (
    <section className="section section--tint" id="pricing">
      <div className="container">
        <SectionHead eyebrow={p.eyebrow} title={p.title} />
        <Stagger className="plans" gap={0.15}>
          {p.plans.map((plan) => (
            <Item as="article" key={plan.name} className={`plan${plan.featured ? ' plan--featured' : ''}`}>
              {plan.badge && <span className={`plan__badge${plan.badgeAlt ? ' plan__badge--alt' : ''}`}>{plan.badge}</span>}
              <h3>{plan.name}</h3>
              <p className="plan__sub">{plan.sub}</p>
              <div className="plan__price"><s><Ltr>{plan.old}</Ltr></s><strong><Ltr>{plan.price}</Ltr></strong></div>
              <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <a className={`btn btn--block ${plan.featured ? 'btn--primary' : 'btn--ghost'}`} href={plan.href} {...ext}>{p.cta}</a>
            </Item>
          ))}
        </Stagger>
        <p className="swipe-hint">{t.swipe} <span aria-hidden="true">→</span></p>
      </div>
    </section>
  );
}

export function Partners({ t }) {
  // Logos rendered twice so the marquee can loop seamlessly
  const logos = [...partnerLogos, ...partnerLogos];
  return (
    <section className="section section--sm">
      <div className="container">
        <Reveal as="p" className="partners__title">{t.partners.title}</Reveal>
        <Reveal className="marquee" delay={0.1}>
          <div className="marquee__track">
            {logos.map((src, i) => (
              <img key={i} src={src} alt={i < partnerLogos.length ? t.partners.alt : ''} aria-hidden={i >= partnerLogos.length} loading="lazy" />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Faq({ t }) {
  const f = t.faq;
  const [open, setOpen] = useState(0);
  return (
    <section className="section section--tint" id="faq">
      <div className="container faq">
        <Stagger className="faq__intro" gap={0.12}>
          <Item as="span" className="eyebrow">{f.eyebrow}</Item>
          <Item as="h2">{f.title}</Item>
          <Item as="p">{f.text}</Item>
          <Item><a className="btn btn--primary" href={contact.whatsapp} {...ext}>{f.cta}</a></Item>
        </Stagger>
        <Stagger className="faq__list" gap={0.05} amount={0.05}>
          {f.items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <Item className={`faq__item${isOpen ? ' is-open' : ''}`} key={i}>
                <button className="faq__q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                  {q}<span className="faq__icon" aria-hidden="true" />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq__a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <p>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}


export function Footer({ t }) {
  const f = t.footer;
  return (
    <footer className="footer">
      <Stagger className="container footer__grid" gap={0.1} amount={0.3}>
        <Item>
          <Logo t={t} light />
          <p className="footer__about">{f.about}</p>
        </Item>
        <Item>
          <h5>{f.company}</h5>
          {f.links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </Item>
        <Item>
          <h5>{f.contact}</h5>
          <a href={`tel:${contact.tel}`}><Ltr>{contact.phone}</Ltr></a>
          <a href={`mailto:${contact.email}`}><Ltr>{contact.email}</Ltr></a>
          <a href={contact.instagram} {...ext}>{f.instagram}</a>
          <a href={contact.whatsapp} {...ext}>{f.whatsapp}</a>
        </Item>
      </Stagger>
      <div className="container footer__bottom">
        © {new Date().getFullYear()} {f.rights}
      </div>
    </footer>
  );
}

export function WhatsAppFloat({ t }) {
  return (
    <motion.a
      className="wa-float" href={contact.whatsapp} {...ext} aria-label={t.waFloat}
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.6 }}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
    >
      <WhatsAppIcon />
    </motion.a>
  );
}
