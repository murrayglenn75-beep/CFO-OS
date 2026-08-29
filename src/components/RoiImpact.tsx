import React from 'react';
import { 
  Clock, 
  TrendingUp, 
  Settings2, 
  FileText, 
  Activity, 
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

export const RoiImpact: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in" id="roi-impact-root">
      
      {/* Header Block */}
      <div className="border-b border-ink-700 pb-6" id="roi-header">
        <span className="text-xs font-mono tracking-wider text-brass uppercase block mb-1 font-medium">
          07 — ROI &amp; IMPACT
        </span>
        <h1 className="text-3xl font-sans font-bold text-paper tracking-tight">
          From 75 hours to 5 — and what it unlocks
        </h1>
        <p className="text-sm text-paper-dim mt-1.5 font-light" style={{ maxWidth: '640px' }}>
          The brief asks for time saved, error reduction, and what it unlocks. Framed in the metrics a 2026 board actually accepts — baselined, unit-based, and traceable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="roi-content-grid">
        
        {/* SECTION A & SECTION B (Left/Main side) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECTION A — Time saved */}
          <div className="bg-ink-850 border border-ink-700 p-5 rounded-2xl shadow-soft" id="roi-time-saved-section">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xxs font-mono tracking-wider text-slate uppercase block font-semibold">
                07.1 · TIME SAVED PER CYCLE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ink-700 text-slate text-xxs tracking-wider uppercase">
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 text-right font-medium">Before (hrs/mo)</th>
                    <th className="pb-2 text-right font-medium">After (hrs/mo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/50">
                  <tr className="text-paper-dim">
                    <td className="py-3 font-sans font-light">CFO / Analyst</td>
                    <td className="py-3 text-right">40</td>
                    <td className="py-3 text-right">3–5</td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-sans font-light">Finance Manager</td>
                    <td className="py-3 text-right">20</td>
                    <td className="py-3 text-right">1–3</td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-sans font-light">Controller</td>
                    <td className="py-3 text-right">15</td>
                    <td className="py-3 text-right">1–2</td>
                  </tr>
                  <tr className="text-paper font-bold border-t border-ink-700">
                    <td className="py-3 font-sans">TOTAL</td>
                    <td className="py-3 text-right">75</td>
                    <td className="py-3 text-right text-emerald">5–10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Brass-left-border One-line Callout */}
            <div className="mt-4 border-l-2 border-brass bg-ink-900/60 p-3 text-xs leading-relaxed text-paper-dim font-light rounded-r-lg" id="capacityation-callout">
              ≈65 hours saved per month. At a <span className="font-mono text-paper">$100/hr</span> blended fully-loaded rate, <span className="font-semibold text-paper">~$78,000/yr</span> of recovered capacity — and skilled staff shift from assembling the report to acting on it.
            </div>
          </div>

          {/* SECTION B — Board-grade benchmarks */}
          <div className="bg-ink-850 border border-ink-700 p-5 rounded-2xl shadow-soft" id="roi-benchmarks-section">
            <div className="mb-4">
              <span className="text-xxs font-mono tracking-wider text-slate uppercase block mb-1 font-semibold">
                07.2 · BOARD-GRADE BENCHMARKS
              </span>
              <p className="text-xs text-paper-dim font-light">
                Modern ROI is baselined, unit-based, and traceable — not vague &ldquo;productivity.&rdquo; These are the metrics boards accept:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ink-700 text-slate text-xxs font-mono tracking-wider uppercase">
                    <th className="pb-2 font-medium">Metric Dimension</th>
                    <th className="pb-2 font-medium">What Good Looks Like (Target / Realized)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/50">
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Close-cycle reduction</td>
                    <td className="py-3 font-sans font-light">
                      <span className="text-emerald font-mono font-medium">~7 fewer days</span> to close; cuts up to <span className="font-mono">45%</span> on automated R2R
                    </td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Error / exception rate</td>
                    <td className="py-3 font-sans font-light">
                      Manual <span className="font-mono text-rust">1–5%</span> → <span className="text-emerald font-mono font-medium">&lt; 0.5%</span>; anomaly detection <span className="font-mono text-emerald font-medium">94–95%+ accuracy</span>
                    </td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Cost per transaction</td>
                    <td className="py-3 font-sans font-light">
                      Invoice handling from <span className="font-mono text-rust">$12–30</span> → <span className="text-emerald font-mono font-medium">~$3</span>
                    </td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Touchless / straight-through</td>
                    <td className="py-3 font-sans font-light">
                      <span className="text-emerald font-mono font-medium">~90%</span> straight-through on automated workflows
                    </td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Continuous-audit readiness</td>
                    <td className="py-3 font-sans font-light">
                      Audit prep <span className="font-mono text-rust">3–4 weeks</span> → <span className="text-emerald font-mono font-medium">3–5 days</span>
                    </td>
                  </tr>
                  <tr className="text-paper-dim">
                    <td className="py-3 font-semibold font-sans">Payback period</td>
                    <td className="py-3 font-sans font-light">
                      Implementation <span className="font-mono">4–6 mo</span>; ROI visible in <span className="text-emerald font-mono font-medium">3–4 mo</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* SECTION C & SECTION D (Right sidebar panel) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECTION C — What it unlocks */}
          <div className="bg-ink-850 border border-ink-700 p-5 rounded-2xl shadow-soft" id="roi-unlocks-section">
            <span className="text-xxs font-mono tracking-wider text-slate uppercase block mb-4 font-semibold">
              07.3 · CAPACITY UNLOCKED
            </span>

            <div className="grid grid-cols-1 gap-3.5" id="unlocks-grid">
              
              {/* forecasting */}
              <div className="bg-ink-900 border border-ink-700 p-3.5 rounded-xl shadow-soft flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brass/10 border border-brass/25 flex items-center justify-center shrink-0 text-brass">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-paper font-sans">Forecasting</h4>
                  <p className="text-xxs font-light text-paper-dim mt-0.5 leading-relaxed">
                    Project next-quarter EBITDA from the live trend.
                  </p>
                </div>
              </div>

              {/* scenario planning */}
              <div className="bg-ink-900 border border-ink-700 p-3.5 rounded-xl shadow-soft flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brass/10 border border-brass/25 flex items-center justify-center shrink-0 text-brass">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-paper font-sans">Scenario planning</h4>
                  <p className="text-xxs font-light text-paper-dim mt-0.5 leading-relaxed">
                    What happens if headcount grows 10%?
                  </p>
                </div>
              </div>

              {/* cash flow simulation */}
              <div className="bg-ink-900 border border-ink-700 p-3.5 rounded-xl shadow-soft flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brass/10 border border-brass/25 flex items-center justify-center shrink-0 text-brass">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-paper font-sans">Cash-flow simulation</h4>
                  <p className="text-xxs font-light text-paper-dim mt-0.5 leading-relaxed">
                    What if receivables slip 30 days?
                  </p>
                </div>
              </div>

              {/* acquisition analysis */}
              <div className="bg-ink-900 border border-ink-700 p-3.5 rounded-xl shadow-soft flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brass/10 border border-brass/25 flex items-center justify-center shrink-0 text-brass">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-paper font-sans">Acquisition analysis</h4>
                  <p className="text-xxs font-light text-paper-dim mt-0.5 leading-relaxed">
                    Model an acquired entity against the existing chart of accounts.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION D — The real comparison */}
          <div className="bg-ink-850 border border-brass/30 p-5 rounded-2xl shadow-soft relative" id="roi-comparison-callout">
            <span className="text-xxs font-mono tracking-wider text-brass uppercase block mb-2 font-semibold">
              07.4 · THE EXECUTIVE CONTEXT
            </span>
            <p className="text-xs text-paper-dim font-light leading-relaxed">
              CFOs don&apos;t compare AI only to other software — they compare it to hiring, outsourcing, or the status quo. A <span className="font-mono text-paper">~$50k</span> spend ≈ half an analyst FTE. That&apos;s the bar this clears.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
