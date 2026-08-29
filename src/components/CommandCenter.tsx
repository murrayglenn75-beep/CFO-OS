import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FinancialRecord, ViewType } from '../types';
import { ArrowRight, BadgeCheck, CircleAlert, CircleCheck, ShieldCheck, TrendingDown, WalletCards } from 'lucide-react';
import { TrustBadge } from './trust/TrustBadge';

interface Props { data: FinancialRecord[]; onNavigate: (view: ViewType) => void; }
const money = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n) >= 1_000_000 ? `${(Math.abs(n)/1_000_000).toFixed(2)}M` : `${(Math.abs(n)/1000).toFixed(0)}K`}`;

export const CommandCenter: React.FC<Props> = ({ data, onNavigate }) => {
  const current = data[data.length - 1];
  const prev = data[data.length - 2];
  const revDelta = ((current.revenue - prev.revenue) / prev.revenue) * 100;
  const cashDelta = ((current.cash - prev.cash) / prev.cash) * 100;

  const kpis = [
    { label: 'Revenue', value: money(current.revenue), delta: `${revDelta.toFixed(1)}% MoM`, state: 'negative' },
    { label: 'EBITDA', value: money(current.ebitda), delta: `${money(current.ebitda - prev.ebitda)} vs Apr`, state: 'negative' },
    { label: 'Gross margin', value: `${current.grossMargin.toFixed(1)}%`, delta: `${(current.grossMargin - prev.grossMargin).toFixed(1)} pp`, state: 'neutral' },
    { label: 'Cash', value: money(current.cash), delta: `${cashDelta.toFixed(1)}% MoM`, state: 'neutral' },
  ];

  return (
    <div className="page-shell animate-fade-in">
      <section className="hero-summary">
        <div className="hero-copy">
          <span className="eyebrow">MAY 2026 · FINAL CLOSE</span>
          <h1>The close is explainable. Two exceptions still need authority.</h1>
          <p>Finance truth is calculated deterministically. AI is limited to evidence-grounded explanation and cannot approve or execute a financial action.</p>
          <div className="hero-actions"><button className="primary-action" onClick={() => onNavigate('variance_explorer')}>Review critical variances <ArrowRight className="w-4 h-4" /></button><button className="secondary-action" onClick={() => onNavigate('copilot')}>Ask governed copilot</button></div>
        </div>
        <div className="close-score-card">
          <div className="score-ring"><span>92</span><small>%</small></div>
          <div><span className="eyebrow">CLOSE READINESS</span><h3>Ready with review</h3><p>3/5 source systems clean · 2 controller exceptions open</p></div>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((k) => <article className="kpi-card" key={k.label}><span>{k.label}</span><strong>{k.value}</strong><small className={k.state}>{k.delta}</small></article>)}
      </section>

      <section className="dashboard-grid">
        <article className="panel-card performance-panel">
          <div className="panel-title-row"><div><span className="eyebrow">12-MONTH VIEW</span><h2>Revenue and cash trajectory</h2></div><span className="micro-note">Synthetic demo data</span></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--c-brass)" stopOpacity={0.28}/><stop offset="95%" stopColor="var(--c-brass)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--c-ink-700)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: 'var(--c-slate)', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24}/>
                <YAxis tick={{ fill: 'var(--c-slate)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}m`}/>
                <Tooltip contentStyle={{ background: 'var(--c-ink-850)', border: '1px solid var(--c-ink-700)', borderRadius: 12 }} formatter={(v: any) => money(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="var(--c-brass)" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="cash" stroke="var(--c-emerald)" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-card decision-panel">
          <div className="panel-title-row"><div><span className="eyebrow">DECISION BRIEF</span><h2>What changed</h2></div><ShieldCheck className="w-5 h-5 text-brass" /></div>
          <div className="decision-list">
            <button onClick={() => onNavigate('variance_explorer')}><div className="decision-icon danger"><TrendingDown className="w-4 h-4" /></div><div><span className="decision-title">Revenue slipped 18.0%</span><p>Two enterprise renewals moved into June, creating a timing-driven recognition gap.</p><small>NetSuite + Salesforce · review required</small></div><TrustBadge status="REVIEW_REQUIRED" compact /></button>
            <button onClick={() => onNavigate('variance_explorer')}><div className="decision-icon warn"><CircleAlert className="w-4 h-4" /></div><div><span className="decision-title">Marketing rose 41.8%</span><p>Q3 acquisition spend started three weeks early; authorizations reconcile 1:1.</p><small>Brex + Mercury · verified</small></div><TrustBadge status="VERIFIED" compact /></button>
            <button onClick={() => onNavigate('reconciliation')}><div className="decision-icon good"><CircleCheck className="w-4 h-4" /></div><div><span className="decision-title">Cash remains liquid</span><p>$3.54M cash balance after the close, with bank feeds fully reconciled.</p><small>Mercury · verified</small></div><TrustBadge status="VERIFIED" compact /></button>
          </div>
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel-card trust-panel">
          <div className="panel-title-row"><div><span className="eyebrow">TRUST LAYER</span><h2>Evidence state</h2></div><BadgeCheck className="w-5 h-5 text-emerald" /></div>
          <div className="trust-metrics"><div><span>Evidence quality</span><b>94/100</b><i style={{ width: '94%' }} /></div><div><span>Source agreement</span><b>86%</b><i style={{ width: '86%' }} /></div></div>
          <div className="trust-facts"><span><b>2</b> unresolved exceptions</span><span><b>5</b> source systems</span><span><b>Human</b> execution authority</span></div>
          <button className="text-action" onClick={() => onNavigate('trust_security')}>Open Trust & Security <ArrowRight className="w-4 h-4" /></button>
        </article>

        <article className="panel-card close-panel">
          <div className="panel-title-row"><div><span className="eyebrow">CLOSE WORKFLOW</span><h2>Readiness checklist</h2></div><WalletCards className="w-5 h-5 text-brass" /></div>
          {[['Source ingestion','Complete'],['Entity reconciliation','2 reviews'],['Calculation graph','Verified'],['Controller sign-off','Pending']].map(([a,b],i)=><div className="close-row" key={a}><span className={`close-dot ${i===1||i===3?'warn':'good'}`} /> <b>{a}</b><small>{b}</small></div>)}
        </article>
      </section>
    </div>
  );
};
