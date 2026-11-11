import { useEffect, useState } from 'react';
import { MotionConfig, useAnimate } from 'motion/react';
import { content } from './content';
import {
  ScrollProgress, Nav, Hero, About, Services, Process, Pricing, Partners, Faq, Footer,
} from './components/Sections';
import { Assistant } from './components/Assistant';
import { Compare, Calculator, Contact, MobileBar } from './components/Extras';
import { CompanyPreview } from './components/Preview';

const getInitialLang = () => {
  try {
    return localStorage.getItem('lang') === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

export default function App() {
  const [lang, setLang] = useState(getInitialLang);
  const [scope, animate] = useAnimate();
  const t = content[lang];

  // Apply language/direction to <html> and remember the choice
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = t.title;
    try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
  }, [lang, t]);

  // Quick cross-fade when switching language
  const switchLang = async () => {
    await animate(scope.current, { opacity: 0 }, { duration: 0.18 });
    setLang((l) => (l === 'en' ? 'ar' : 'en'));
    animate(scope.current, { opacity: 1 }, { duration: 0.35 });
  };

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <div ref={scope}>
        <Nav t={t} onSwitch={switchLang} />
        <main>
          <Hero t={t} />
          <About t={t} />
          <Services t={t} />
          <CompanyPreview t={t} />
          <Compare t={t} />
          <Process t={t} />
          <Pricing t={t} />
          <Calculator t={t} />
          <Partners t={t} />
          <Faq t={t} />
          <Contact t={t} />
        </main>
        <Footer t={t} />
      </div>
      <Assistant t={t} />
      <MobileBar t={t} />
    </MotionConfig>
  );
}
