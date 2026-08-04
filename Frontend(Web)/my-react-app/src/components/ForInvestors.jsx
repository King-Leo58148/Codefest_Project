// ForInvestors — Motion alternating scroll-reveal feature blocks
// Library: Motion (whileInView stagger, alternating left/right per block)
import { motion } from 'motion/react';
import mockupExplore from '../assets/mockup-explore.jpg';
import mockupPortfolio from '../assets/mockup-portfolio.jpg';
import mockupChat from '../assets/mockup-chat.jpg';

const FEATURES = [
  {
    tag: 'Discover',
    title: 'Explore deals across 16 industries',
    desc: 'Browse a curated feed of verified business pitches — filter by industry, search by name, and read full pitch details including monthly income, valuation, and campaign end date.',
    bullets: [
      'Technology, Agriculture, Food & Bev, Health, Retail and more',
      'Each pitch shows: amount needed, amount raised, minimum investment',
      'Video pitches supported for a richer due-diligence experience',
    ],
    mockup: mockupExplore,
    mockupAlt: 'Nkoso explore pitches screen',
    imageLeft: false,
  },
  {
    tag: 'Negotiate',
    title: 'Set your own terms — three deal structures',
    desc: 'Nkoso is not a one-size-fits-all platform. You choose how you want to invest based on your risk appetite and return expectations.',
    bullets: [
      'Fixed Return — receive a fixed GH₵ amount over an agreed period',
      'Equity — take a percentage ownership stake in the business',
      'Revenue Share — receive a portion of monthly revenue until target is met',
    ],
    mockup: mockupChat,
    mockupAlt: 'Nkoso deal room private chat',
    imageLeft: true,
  },
  {
    tag: 'Track',
    title: 'Portfolio analytics built into the app',
    desc: 'Your My Deals screen is a live dashboard — not a static list. Track capital deployed, deal statuses, and repayment progress all in one place.',
    bullets: [
      'Bar charts: capital activity by week, month, or year',
      'Timeline chart: cumulative portfolio growth over time',
      'Filter charts by individual business to analyse performance',
    ],
    mockup: mockupPortfolio,
    mockupAlt: 'Nkoso portfolio analytics screen',
    imageLeft: false,
  },
  {
    tag: 'Trust',
    title: 'KYC built in — Ghana Card + MoMo verified',
    desc: 'Every investor completes a 3-step identity verification process before they can invest. No anonymous money moving through the platform.',
    bullets: [
      'Step 1: Profile created with name and email',
      'Step 2: Ghana Card upload for national ID verification',
      'Step 3: Mobile money number linked for payment traceability',
    ],
    mockup: null,
    imageLeft: true,
    isKYC: true,
  },
];

function KYCDiagram() {
  const steps = [
    { icon: '👤', label: 'Profile Created', sub: 'Name + email verified', done: true },
    { icon: '🪪', label: 'Ghana Card', sub: 'National ID uploaded', done: true },
    { icon: '📱', label: 'MoMo Account', sub: 'Mobile number linked', done: false },
  ];
  return (
    <div className="flex flex-col gap-0 max-w-xs">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 transition-all"
              style={step.done
                ? { background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.45)' }
                : { background: 'rgba(10,22,40,0.06)', borderColor: '#E2E8F0' }
              }
            >
              {step.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px h-8 mt-1" style={{ background: i === 0 ? '#22C55E' : '#E2E8F0' }} />
            )}
          </div>
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy text-sm">{step.label}</span>
              {step.done && <span className="text-accent text-xs font-bold">✓ Complete</span>}
            </div>
            <span className="text-text-sec text-xs">{step.sub}</span>
          </div>
        </div>
      ))}
      {/* Progress bar */}
      <div className="mt-6 bg-muted rounded-full h-2 overflow-hidden max-w-xs">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '66%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-accent rounded-full"
        />
      </div>
      <span className="text-text-sec text-xs mt-1.5">Verification 67% complete</span>
    </div>
  );
}

export default function ForInvestors() {
  return (
    <section id="for-investors" className="section-white py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1 max-w-12 bg-accent" />
          <span className="text-accent text-sm font-bold uppercase tracking-widest">For Investors</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="font-display text-navy text-4xl lg:text-5xl font-extrabold mb-16 max-w-2xl leading-[1.1]"
        >
          Your savings, working for{' '}
          <span className="gradient-text">local businesses.</span>
        </motion.h2>

        {/* Alternating feature blocks */}
        <div className="space-y-28">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${feature.imageLeft ? 'lg:[&>div:first-child]:order-2' : ''}`}
            >
              {/* Text side */}
              <div>
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border"
                  style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)' }}
                >
                  {feature.tag}
                </span>
                <h3 className="font-display text-navy text-3xl font-extrabold mb-4 leading-[1.15]">
                  {feature.title}
                </h3>
                <p className="text-text-sec text-base leading-relaxed mb-6">{feature.desc}</p>
                <ul className="space-y-3">
                  {feature.bullets.map(bullet => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-navy">
                      <span className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-accent text-[10px] font-black">✓</span>
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual side */}
              <div className="flex justify-center items-center">
                {feature.isKYC ? (
                  <div className="bg-muted rounded-3xl border border-border p-10 w-full max-w-sm">
                    <KYCDiagram />
                  </div>
                ) : (
                  <div
                    className="relative"
                    style={{ filter: 'drop-shadow(0 24px 48px rgba(10,22,40,0.18))' }}
                  >
                    <div className="w-[240px] rounded-[36px] overflow-hidden border-2 border-border">
                      <div className="bg-navy h-8 flex items-center px-4">
                        <span className="text-white/40 text-[10px]">9:41 ▲ ●●●</span>
                      </div>
                      <img
                        src={feature.mockup}
                        alt={feature.mockupAlt}
                        className="w-full block"
                        draggable={false}
                      />
                    </div>
                    {/* Accent glow */}
                    <div
                      className="absolute inset-0 rounded-[36px] pointer-events-none"
                      style={{ boxShadow: '0 0 0 1px rgba(34,197,94,0.15), 0 32px 64px rgba(34,197,94,0.12)' }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
