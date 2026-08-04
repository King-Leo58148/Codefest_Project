// AdminLayer — MFI governance explainer
// Library: Motion (entrance animation)
import { motion } from 'motion/react';

const MFI_STEPS = [
  { label: 'Both Parties Sign', icon: '✍️', color: '#8B5CF6', desc: 'Deal signed digitally in the app by investor and business owner' },
  { label: 'Sent to Admin', icon: '📨', color: '#3B82F6', desc: 'Signed deal moves to PENDING_MFI status for review' },
  { label: 'Admin Reviews', icon: '🔍', color: '#F59E0B', desc: 'Admin team acts as the MFI — reviews deal terms, amounts, and parties' },
  { label: 'Approved or Rejected', icon: '✅', color: '#22C55E', desc: 'On approval: investor payment via Paystack is triggered. On rejection: deal is cancelled and parties notified.' },
  { label: 'Funds Disbursed', icon: '💸', color: '#22C55E', desc: 'Investor pays via Paystack; funds disbursed to business owner\'s MoMo account' },
];

export default function AdminLayer() {
  return (
    <section className="section-light py-28 px-6">
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
          <span className="text-accent text-sm font-bold uppercase tracking-widest">Platform Governance</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <h2 className="font-display text-navy text-4xl lg:text-5xl font-extrabold mb-5 leading-[1.1]">
              Every deal has a
              {' '}<span className="gradient-text">human checkpoint.</span>
            </h2>
            <p className="text-text-sec text-lg leading-relaxed mb-6">
              Nkoso isn't just a marketplace. Before any money moves, a platform administrator reviews every signed deal acting as a Micro-Finance Institution (MFI) oversight layer.
            </p>
            <p className="text-text-sec text-base leading-relaxed mb-8">
              This is not a rubber stamp — it's a genuine compliance review that protects both the investor and the business owner from fraudulent or unsuitable deals reaching the payment stage.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: '🛡️', text: 'Pitch quality review before going live — admin approves or rejects' },
                { icon: '👁️', text: 'MFI deal review after signing — before investor payment is triggered' },
                { icon: '👥', text: 'Identity verified users only — Ghana Card + MoMo KYC required' },
                { icon: '📋', text: 'Full audit trail — deal status tracked from PENDING through COMPLETED' },
              ].map(p => (
                <div key={p.text} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                  <span className="text-xl shrink-0">{p.icon}</span>
                  <span className="text-navy text-sm leading-relaxed">{p.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Deal flow diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="bg-white rounded-3xl border border-border p-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏛️</span>
              </div>
              <div>
                <div className="font-display text-navy font-bold text-base">MFI Workflow</div>
                <div className="text-text-sec text-xs">Deal compliance flow</div>
              </div>
            </div>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-5 top-8 bottom-8 w-px bg-border" />

              <div className="space-y-4">
                {MFI_STEPS.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.1 }}
                    className="flex items-start gap-4 pl-0"
                  >
                    {/* Step dot */}
                    <div
                      className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                      style={{ background: `${step.color}12`, borderColor: `${step.color}35` }}
                    >
                      {step.icon}
                    </div>

                    <div className="flex-1 pb-4 border-b border-border last:border-0">
                      <div className="font-bold text-navy text-sm mb-1">{step.label}</div>
                      <div className="text-text-sec text-xs leading-relaxed">{step.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Status legend */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-text-sec text-xs uppercase tracking-widest font-semibold mb-3">Deal Status Flow</p>
              <div className="flex flex-wrap gap-2">
                {['PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'ACTIVE', 'COMPLETED'].map((s, i) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg border"
                    style={{
                      color: s === 'ACTIVE' || s === 'COMPLETED' || s === 'MFI_APPROVED' ? '#22C55E' : '#64748B',
                      borderColor: s === 'ACTIVE' || s === 'COMPLETED' || s === 'MFI_APPROVED' ? 'rgba(34,197,94,0.3)' : '#E2E8F0',
                      background: s === 'ACTIVE' || s === 'COMPLETED' || s === 'MFI_APPROVED' ? 'rgba(34,197,94,0.08)' : '#F8FAFC',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
