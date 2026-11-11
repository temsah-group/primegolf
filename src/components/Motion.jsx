/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useReducedMotion } from 'motion/react';

export const ease = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const container = (gap, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const viewport = (amount) => ({ once: true, amount });

/** Fades + slides a single block in when it scrolls into view. */
export function Reveal({ as = 'div', children, delay = 0, y = 28, amount = 0.2, ...rest }) {
  const M = motion[as];
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport(amount)}
      transition={{ duration: 0.8, ease, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Parent that reveals its <Item> children one after another. `onLoad` plays immediately. */
export function Stagger({ as = 'div', children, gap = 0.1, delay = 0, amount = 0.15, onLoad = false, ...rest }) {
  const M = motion[as];
  const trigger = onLoad ? { animate: 'show' } : { whileInView: 'show', viewport: viewport(amount) };
  return (
    <M variants={container(gap, delay)} initial="hidden" {...trigger} {...rest}>
      {children}
    </M>
  );
}

export function Item({ as = 'div', children, variants = fadeUp, ...rest }) {
  const M = motion[as];
  return <M variants={variants} {...rest}>{children}</M>;
}

/** Counts the first number in a string up from 0, keeping any prefix/suffix ("AED 500", "48h"). */
export function CountUp({ value, duration = 1.6, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const match = value.match(/^(\D*?)(\d[\d,]*)(.*)$/);
  const target = match ? parseInt(match[2].replace(/,/g, ''), 10) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!match || !inView) return;
    if (reduce) { setN(target); return; }
    const controls = animate(0, target, { duration, delay, ease, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, target]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) return <span>{value}</span>;
  return <span ref={ref}>{match[1]}{n.toLocaleString('en-US')}{match[3]}</span>;
}
