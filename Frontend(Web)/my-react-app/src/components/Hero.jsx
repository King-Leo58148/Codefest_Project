// Hero — Anime.js phone float + React Bits text stagger
// Library: Anime.js (phone entrance + infinite float), motion/react (text reveal)
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import anime from 'animejs';
import mockupExplore from '../assets/mockup-explore.jpg';
import mockupPortfolio from '../assets/mockup-portfolio.jpg';

// Staggered word reveal — React Bits pattern
function RevealWords({ text, className, delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: delay + i * 0.075, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const phoneRef = useRef(null);
  const phone2Ref = useRef(null);

  useEffect(() => {
    // Entrance animation — slides in from right with spring
    anime({
      targets: phoneRef.current,
      translateX: [120, 0],
      opacity: [0, 1],
      duration: 1100,
      delay: 300,
      easing: 'spring(1, 80, 10, 0)',
    });
    anime({
      targets: phone2Ref.current,
      translateX: [160, 0],
      opacity: [0, 0.72],
      duration: 1300,
      delay: 500,
      easing: 'spring(1, 80, 10, 0)',
    });

    // Infinite gentle float
    anime({
      targets: phoneRef.current,
      translateY: [-12, 12],
      duration: 3400,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: 1400,
    });
    anime({
      targets: phone2Ref.current,
      translateY: [8, -14],
      duration: 3800,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: 1600,
    });
  }, []);

  return (
    <section className="min-h-screen bg-navy flex items-center pt-[70px] overflow-hidden relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Green radial glow behind phone */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-6 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Copy ── */}
          <div className="relative z-10">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-accent text-sm font-semibold tracking-wide">Real businesses · Real returns · GH₵</span>
            </motion.div>

            {/* H1 */}
            <h1 className="font-display text-white text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 text-balance">
              <RevealWords text="Invest in the Businesses" delay={0.1} />
              <br />
              <span style={{ display: 'block', marginTop: '0.15em' }}>
                <RevealWords text="Building" delay={0.45} />
                {' '}
                <motion.span
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="gradient-text"
                  style={{ display: 'inline-block' }}
                >
                  Ghana.
                </motion.span>
              </span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg"
            >
              Nkoso connects everyday Ghanaian investors with vetted small businesses seeking growth capital — via structured equity, fixed-return, or revenue-share deals, entirely on mobile.
            </motion.p>

            {/* Three stat pills — real data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { n: '$4.8B', label: 'Ghana SME funding gap', src: 'IFC' },
                { n: '73M', label: 'MoMo accounts in Ghana', src: 'BOG 2024' },
                { n: '92%', label: 'of businesses are informal', src: 'GSS' },
              ].map(stat => (
                <div
                  key={stat.n}
                  className="bg-navy-mid border border-white/10 rounded-2xl px-5 py-3.5"
                >
                  <div className="stat-number text-accent text-2xl">{stat.n}</div>
                  <div className="text-white/50 text-xs mt-0.5 leading-tight">{stat.label}</div>
                  <div className="text-white/25 text-[10px] mt-0.5 font-medium">{stat.src}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Phone Mockups ── */}
          <div className="relative flex justify-center items-center h-[560px]">
            {/* Back phone (portfolio) — offset & behind */}
            <div
              ref={phone2Ref}
              className="absolute"
              style={{ opacity: 0, right: '2%', top: '10%', zIndex: 1 }}
            >
              <div
                className="w-[200px] rounded-[32px] overflow-hidden border-2 border-white/10"
                style={{ boxShadow: '0 24px 48px rgba(10,22,40,0.5)' }}
              >
                <img
                  src={mockupPortfolio}
                  alt="Nkoso portfolio screen"
                  className="w-full block"
                  draggable={false}
                />
              </div>
            </div>

            {/* Front phone (explore) */}
            <div
              ref={phoneRef}
              className="relative phone-glow"
              style={{ opacity: 0, zIndex: 2 }}
            >
              <div
                className="w-[248px] rounded-[38px] overflow-hidden border-2 border-white/15"
                style={{ boxShadow: '0 40px 80px rgba(10,22,40,0.6), 0 0 0 1px rgba(34,197,94,0.12)' }}
              >
                {/* Status bar stub */}
                <div className="bg-[#0A1628] px-5 pt-3 pb-1 flex justify-between items-center">
                  <span className="text-white/60 text-[10px] font-semibold">9:41</span>
                  <div className="flex gap-1">
                    <span className="text-white/60 text-[10px]">▲ ●●●</span>
                  </div>
                </div>
                <img
                  src={mockupExplore}
                  alt="Nkoso explore pitches screen"
                  className="w-full block"
                  draggable={false}
                />
              </div>

              {/* Floating label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-32 top-1/3 bg-white rounded-2xl px-3 py-2 shadow-xl"
                style={{ boxShadow: '0 8px 24px rgba(10,22,40,0.18)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <div>
                    <div className="text-navy font-bold text-xs">New pitch</div>
                    <div className="text-text-sec text-[10px]">Accra Fresh Farm</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -right-28 bottom-1/4 bg-accent rounded-2xl px-3 py-2"
                style={{ boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}
              >
                <div className="text-navy font-bold text-xs">Bid accepted ✓</div>
                <div className="text-navy/70 text-[10px]">GH₵ 25,000</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-accent rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
