// Nav — Motion scroll progress + smooth section links
// Library: Motion (useScroll + useSpring for progress bar)
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const NAV_LINKS = [
  { label: 'The Problem', href: '#problem' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Investors', href: '#for-investors' },
  { label: 'For Businesses', href: '#for-businesses' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        id="scroll-progress"
        style={{ scaleX }}
      />

      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,22,40,0.96)' : '#0A1628',
          borderBottom: scrolled ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[70px] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-navy font-display font-black text-base leading-none">N</span>
            </div>
            <span className="font-display font-bold text-white text-xl tracking-tight">Nkoso</span>
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Tagline badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-accent/10 border border-accent/25 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-accent text-xs font-semibold">Ghana · Built for Africa</span>
          </div>
        </div>
      </header>
    </>
  );
}
