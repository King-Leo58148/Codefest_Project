// HowItWorks — Anime.js animated deal flow timeline
// Library: Anime.js (connecting line draw-in + step activation), Motion (stagger)
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import anime from 'animejs';

const STEPS = [
  {
    phase: 'Business',
    icon: '🏪',
    title: 'Business Creates a Pitch',
    desc: 'Owner posts their business — monthly income, funding target, offer type (equity, fixed return, or revenue share), and minimum investment. Video and images supported.',
    color: '#22C55E',
  },
  {
    phase: 'Admin',
    icon: '🛡️',
    title: 'Admin Reviews for Quality',
    desc: 'The admin team acts as a micro-finance institution (MFI) gatekeeper — reviewing pitch details and approving or rejecting before it goes live on the platform.',
    color: '#3B82F6',
  },
  {
    phase: 'Platform',
    icon: '📡',
    title: 'Pitch Goes Live to Investors',
    desc: 'Approved pitches appear in the Explore feed, filterable by 16 industries. Investors can search, read pitch details, and watch video pitches.',
    color: '#8B5CF6',
  },
  {
    phase: 'Investor',
    icon: '🤝',
    title: 'Investor Places a Bid',
    desc: 'Investor submits a bid: amount in GH₵, their preferred return type and value, and timeline in months. Owner can accept, reject, or counter-offer.',
    color: '#F59E0B',
  },
  {
    phase: 'Deal Room',
    icon: '💬',
    title: 'Deal Room & Digital Signing',
    desc: 'Once terms are agreed, both parties enter a private Deal Room with real-time WebSocket chat. Both sign the deal digitally within the app.',
    color: '#EF4444',
  },
  {
    phase: 'MFI',
    icon: '✅',
    title: 'MFI Approval & Payment',
    desc: 'Admin reviews the signed deal. Upon MFI approval, investor pays via Paystack. Funds are disbursed to the business owner\'s MoMo account.',
    color: '#22C55E',
  },
  {
    phase: 'Repayment',
    icon: '📈',
    title: 'Structured Repayment Tracked',
    desc: 'A repayment schedule is generated. Both parties track payments — PENDING, COLLECTED, or MISSED — directly in the app. Investor monitors portfolio analytics.',
    color: '#06B6D4',
  },
];

export default function HowItWorks() {
  const lineRef = useRef(null);
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView || !lineRef.current) return;
    anime({
      targets: lineRef.current,
      scaleY: [0, 1],
      duration: 1800,
      easing: 'easeInOutQuart',
      delay: 200,
    });
  }, [inView]);

  return (
    <section id="how-it-works" className="section-light py-28 px-6" ref={containerRef}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1 max-w-12 bg-accent" />
          <span className="text-accent text-sm font-bold uppercase tracking-widest">How It Works</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="font-display text-navy text-4xl lg:text-5xl font-extrabold mb-4 leading-[1.1]"
        >
          From pitch to funded,<br />
          <span className="gradient-text">step by step.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-text-sec text-lg max-w-xl mb-20"
        >
          Every deal on Nkoso follows a verified, transparent 7-step process — with admin oversight built in at the critical compliance checkpoint.
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Animated vertical line */}
          <div
            className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-border hidden lg:block"
            style={{ transformOrigin: 'top' }}
          >
            <div
              ref={lineRef}
              className="absolute inset-0 bg-gradient-to-b from-accent via-blue-500 to-cyan-400"
              style={{ transformOrigin: 'top', transform: 'scaleY(0)' }}
            />
          </div>

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="flex gap-6 lg:gap-8 items-start"
              >
                {/* Icon circle */}
                <div
                  className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2"
                  style={{
                    background: `${step.color}15`,
                    borderColor: `${step.color}40`,
                  }}
                >
                  {step.icon}
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ color: step.color, background: `${step.color}15` }}
                    >
                      {step.phase}
                    </span>
                    <span className="text-border text-sm">Step {i + 1}</span>
                  </div>
                  <h3 className="font-display text-navy text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-text-sec text-sm leading-relaxed">{step.desc}</p>

                  {/* Connector arrow for non-last items */}
                  {i < STEPS.length - 1 && (
                    <div className="flex items-center gap-2 mt-4 text-text-sec/40">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs">↓</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
