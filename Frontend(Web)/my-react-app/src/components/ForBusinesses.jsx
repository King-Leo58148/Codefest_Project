// ForBusinesses — Dark navy contrast section
// Library: Motion (fade-in blocks), React Bits (accent highlight text effect)
import { motion } from 'motion/react';

// Highlight text — React Bits animated marker pattern
function Highlight({ children }) {
  return (
    <motion.span
      className="relative inline-block"
      initial={{ '--progress': '0%' }}
    >
      <motion.span
        aria-hidden
        className="absolute bottom-0 left-0 h-[0.3em] bg-accent opacity-30 rounded-sm pointer-events-none"
        initial={{ width: '0%' }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
      <span className="relative text-white font-bold">{children}</span>
    </motion.span>
  );
}

const OWNER_FEATURES = [
  {
    icon: '📝',
    title: 'Create a pitch in minutes',
    desc: 'Fill in your business details: description, monthly income, funding target, offer terms, images, and a video pitch. No accountant or lawyer needed to get started.',
  },
  {
    icon: '💬',
    title: 'Negotiate privately with investors',
    desc: 'Every deal has a private Deal Room with real-time chat. Discuss terms, counter-offer bids, and build trust before you sign anything.',
  },
  {
    icon: '📋',
    title: 'Sign digitally — no paperwork',
    desc: 'Once you agree on terms, both parties sign the deal digitally inside the app. No printing, scanning, or lawyer\'s office required.',
  },
  {
    icon: '📱',
    title: 'Receive funds via MoMo',
    desc: 'After admin (MFI) approval, investor funds are processed via Paystack and disbursed directly to your registered mobile money account.',
  },
  {
    icon: '📊',
    title: 'Track your capital raised',
    desc: 'Your owner dashboard shows capital raised per pitch with weekly, monthly, and yearly chart views — and cumulative growth over time.',
  },
  {
    icon: '🔄',
    title: 'Structured repayment schedule',
    desc: 'Every deal comes with a clear, pre-agreed repayment schedule. Both parties see due dates, amounts, and payment status in real-time.',
  },
];

// Industry cloud — all 16 real industries from types/index.ts
const INDUSTRIES = [
  'Technology', 'Food & Bev', 'Health', 'Agriculture', 'Retail',
  'Sustainability', 'Fitness', 'Transport', 'Fashion', 'Beauty & Cosmetics',
  'Construction', 'Education', 'Entertainment', 'Hospitality', 'Manufacturing', 'Other',
];

const COLORS = ['#22C55E', '#86EFAC', '#16A34A', '#34D399', '#22C55E', '#4ADE80'];

export default function ForBusinesses() {
  return (
    <section id="for-businesses" className="section-navy py-28 px-6 relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Accent glow */}
      <div
        className="absolute left-0 bottom-0 w-[500px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1 max-w-12 bg-accent" />
          <span className="text-accent text-sm font-bold uppercase tracking-widest">For Businesses</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="font-display text-white text-4xl lg:text-5xl font-extrabold mb-5 max-w-2xl leading-[1.1]"
        >
          No bank.{' '}
          <Highlight>No collateral.</Highlight>
          {' '}Just your business.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/55 text-lg max-w-2xl mb-16 leading-relaxed"
        >
          Ghana's commercial banks charge{' '}
          <span className="text-white font-semibold">30–40% annual interest</span>{' '}
          and demand hard collateral most small businesses don't have.
          Nkoso gives you a direct channel to investors who back your business on its own merits — and its own terms.
          <span className="text-white/35 text-sm block mt-2">Source: Bank of Ghana, IFC 2024</span>
        </motion.p>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-24">
          {OWNER_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="bg-navy-mid border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300 group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display text-white font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                {f.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Industry cloud divider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-white/10 pt-16"
        >
          <p className="text-white/35 text-sm uppercase tracking-widest font-semibold mb-6 text-center">
            16 industries on the platform
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {INDUSTRIES.map((ind, i) => (
              <motion.span
                key={ind}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="text-sm px-4 py-2 rounded-full border font-medium"
                style={{
                  color: COLORS[i % COLORS.length],
                  borderColor: `${COLORS[i % COLORS.length]}30`,
                  background: `${COLORS[i % COLORS.length]}08`,
                }}
              >
                {ind}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Deal structure summary */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 grid md:grid-cols-3 gap-5"
        >
          {[
            { type: 'Fixed Return', icon: '🔒', desc: 'Pay back a fixed GH₵ amount on an agreed schedule. Predictable and simple.' },
            { type: 'Revenue Share', icon: '📊', desc: 'Pay a percentage of monthly revenue until the investor\'s target is met.' },
            { type: 'Equity', icon: '🤝', desc: 'Offer a percentage ownership stake. Investor grows when your business grows.' },
          ].map((d, i) => (
            <motion.div
              key={d.type}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-white/5 border border-accent/20 rounded-2xl p-6 overflow-hidden"
            >
              <div className="text-2xl mb-3">{d.icon}</div>
              <div className="font-display text-accent font-bold text-lg mb-2">{d.type}</div>
              <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
