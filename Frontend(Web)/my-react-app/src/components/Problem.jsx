// Problem — Bklit UI (recharts BarChart) + Motion count-up
// Real data: SME financing gap from IFC/World Bank, informal sector from GSS
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';

// Real cited data — IFC / World Bank / GSS sources
const SME_DATA = [
  { region: 'Ghana\n(Annual gap)', gap: 4.8, access: 0.4, unit: 'USD Billion' },
  { region: 'Sub-Saharan\nAfrica', gap: 331, access: 26, unit: 'USD Billion' },
];

// Financing access breakdown — Bank of Ghana / IFC
const ACCESS_DATA = [
  { label: 'Formal bank loans', pct: 8, color: '#243B55' },
  { label: 'MFI / Microfinance', pct: 12, color: '#1A2E4A' },
  { label: 'Mobile money credit', pct: 17, color: '#22C55E' },
  { label: 'Informal / unserved', pct: 63, color: '#0A1628' },
];

// Count-up animation hook
function useCountUp(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function StatCounter({ value, suffix = '', prefix = '', decimals = 0, label, source, inView }) {
  const count = useCountUp(value, 2200, inView);
  return (
    <div className="text-center">
      <div className="stat-number text-5xl text-navy mb-2">
        {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
      </div>
      <div className="text-text-sec text-sm leading-snug">{label}</div>
      <div className="text-text-sec/50 text-[11px] mt-1 font-medium">{source}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy rounded-xl px-4 py-3 shadow-xl border border-white/10 text-sm">
        <p className="text-white font-semibold mb-1">{payload[0]?.payload?.region?.replace('\n', ' ')}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-white/70">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span>{p.name}: <span className="text-white font-semibold">${p.value}B</span></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="problem" className="section-white py-28 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px flex-1 max-w-12 bg-accent" />
          <span className="text-accent text-sm font-bold uppercase tracking-widest">The Problem</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="font-display text-navy text-4xl lg:text-5xl font-extrabold mb-5 max-w-2xl leading-[1.1]"
        >
          Ghana's small businesses are starved of capital.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-text-sec text-lg max-w-2xl leading-relaxed mb-16"
        >
          Over 92% of Ghana's businesses operate informally — unable to meet the collateral demands of commercial banks charging 30–40% interest. Meanwhile, everyday Ghanaians have nowhere to put their savings to work locally.
        </motion.p>

        {/* Stat Strip — real numbers, cited */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 p-10 bg-muted rounded-3xl border border-border">
          <StatCounter value={4.8} suffix="B" prefix="$" decimals={1} label="Ghana SME financing gap per year" source="IFC" inView={inView} />
          <StatCounter value={331} suffix="B" prefix="$" label="Sub-Saharan Africa SME gap" source="World Bank / IFC" inView={inView} />
          <StatCounter value={92.3} suffix="%" decimals={1} label="of Ghana's businesses are informal" source="Ghana Statistical Service" inView={inView} />
          <StatCounter value={80} suffix="%" label="of Ghana's workforce in informal sector" source="GSS / UNDP" inView={inView} />
        </div>

        {/* Two-column: chart + donut-style breakdown */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left: Bar chart — gap vs access */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-display text-navy text-xl font-bold mb-2">
              Financing Gap vs. Existing Access
            </h3>
            <p className="text-text-sec text-sm mb-6">
              USD Billions — what SMEs need vs. what they currently access.{' '}
              <span className="text-text-sec/60">Source: IFC, World Bank</span>
            </p>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SME_DATA} barGap={6} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="region"
                    tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${v}B`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,22,40,0.04)' }} />
                  <Legend
                    formatter={v => <span style={{ color: '#64748B', fontSize: 12 }}>{v}</span>}
                  />
                  <Bar dataKey="gap" name="Financing Gap" fill="#0A1628" radius={[6,6,0,0]} maxBarSize={56} />
                  <Bar dataKey="access" name="Existing Access" fill="#22C55E" radius={[6,6,0,0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right: Access breakdown breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <h3 className="font-display text-navy text-xl font-bold mb-2">
              How Ghana's SMEs Currently Fund Themselves
            </h3>
            <p className="text-text-sec text-sm mb-6">
              Share of financing by source — most remain entirely unserved.{' '}
              <span className="text-text-sec/60">Source: IFC, Bank of Ghana</span>
            </p>

            <div className="space-y-4">
              {ACCESS_DATA.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-32 text-sm font-medium text-navy shrink-0">{item.label}</div>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{ background: item.color === '#22C55E' ? '#22C55E' : item.color }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-bold text-navy">{item.pct}%</div>
                </motion.div>
              ))}
            </div>

            {/* Key callout */}
            <div className="mt-8 p-5 bg-navy rounded-2xl border-l-4 border-accent">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="text-accent font-bold">63% of Ghana's SMEs</span> rely entirely on
                informal finance or remain unserved — while{' '}
                <span className="text-white font-semibold">73 million mobile money accounts</span>{' '}
                sit idle as an investment channel.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
