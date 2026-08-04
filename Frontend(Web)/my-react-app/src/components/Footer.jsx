// Footer — Dark navy, citations, links
import { motion } from 'motion/react';

const NAV_LINKS = [
  { label: 'The Problem', href: '#problem' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Investors', href: '#for-investors' },
  { label: 'For Businesses', href: '#for-businesses' },
];

const CITATIONS = [
  { ref: '1', text: 'IFC / ijecm.co.uk — Ghana SME financing gap ~$4.8–5B annually' },
  { ref: '2', text: 'World Bank / IFC — Sub-Saharan Africa SME gap $331B' },
  { ref: '3', text: 'Ghana Statistical Service — 92.3% informal sector share' },
  { ref: '4', text: 'GSS / UNDP — 75–80% of workforce in informal sector' },
  { ref: '5', text: 'Bank of Ghana / marknteladvisors — 73M registered MoMo accounts, 2024' },
  { ref: '6', text: 'Bank of Ghana / GBCGhana — GH₵ 3.01 trillion MoMo transactions, 2024' },
  { ref: '7', text: 'BOG commercial rate surveys — 30–40% SME lending rates, 2024' },
  { ref: '8', text: 'IFC / Stanbic Bank — Women-owned SMEs ~20% less likely to obtain formal financing' },
  { ref: '9', text: 'Ghana MoFEP 2024 Financial Inclusion Report — 96% financial access rate' },
];

export default function Footer() {
  return (
    <footer className="section-navy px-6 py-20 relative overflow-hidden">
      {/* Top gradient sweep */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)' }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16 mb-16">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-navy font-display font-black text-lg leading-none">N</span>
              </div>
              <span className="font-display font-bold text-white text-xl">Nkoso</span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              Connecting everyday Ghanaian investors with the real businesses building Ghana's economy — via verified, structured deals on mobile.
            </p>
            <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-sm font-semibold">Ghana · Built for Africa</span>
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Explore</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-accent text-sm transition-colors duration-200 no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Platform</h4>
            <div className="space-y-4">
              {[
                { label: 'User Roles', value: 'Investor · Business Owner · Admin' },
                { label: 'Deal Types', value: 'Fixed Return · Equity · Revenue Share' },
                { label: 'KYC', value: 'Ghana Card + MoMo verified' },
                { label: 'Payment', value: 'Paystack + Mobile Money' },
                { label: 'Real-time', value: 'WebSocket deal room chat' },
                { label: 'Currency', value: 'GH₵ (Ghanaian Cedi)' },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-white/30 text-xs uppercase tracking-wide">{item.label}</span>
                  <span className="text-white/65 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data citations */}
        <div className="border-t border-white/10 pt-10 mb-10">
          <h4 className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-4">
            Data Sources — All statistics cited from named sources
          </h4>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
            {CITATIONS.map(cite => (
              <div key={cite.ref} className="flex items-start gap-2">
                <span className="text-accent/50 text-[10px] font-bold mt-0.5 shrink-0">[{cite.ref}]</span>
                <span className="text-white/30 text-[11px] leading-relaxed">{cite.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/25 text-xs">
            © 2025 Nkoso. All rights reserved. Built for the Ghanaian market.
          </span>
          <span className="text-white/20 text-xs italic">
            No statistics on this site are fabricated or estimated without a named source.
          </span>
        </div>
      </div>
    </footer>
  );
}
