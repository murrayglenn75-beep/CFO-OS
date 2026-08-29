import React, { useEffect, useState } from 'react';
import { ArrowRight, CornerDownRight, History, Link2, ShieldCheck } from 'lucide-react';
import { TrustBadge } from './trust/TrustBadge';

interface RuntimeEvent { id:string; at:string; type:string; actor:string; outcome:string; previousHash:string; hash:string; }

const metrics = [
  { name:'Revenue', value:'$1,862,000', formula:'SUM(recognized invoice lines)', sources:'NetSuite + Salesforce', evidence:'94/100', status:'REVIEW_REQUIRED' as const, lineage:['ERP invoice lines','recognition rules','reconciled revenue','$1.862M'] },
  { name:'Gross margin', value:'61.6%', formula:'(revenue − COGS) / revenue', sources:'NetSuite', evidence:'99/100', status:'VERIFIED' as const, lineage:['ERP ledger','COGS mapping','gross profit','61.6%'] },
  { name:'EBITDA', value:'−$137,008', formula:'gross profit − payroll − marketing − other OpEx', sources:'NetSuite + Gusto + Brex', evidence:'94/100', status:'REVIEW_REQUIRED' as const, lineage:['reconciled P&L','OpEx allocation','EBITDA graph','−$137K'] },
  { name:'Cash', value:'$3,544,000', formula:'bank-verified ending balance', sources:'Mercury', evidence:'100/100', status:'VERIFIED' as const, lineage:['bank feed','cash reconciliation','treasury view','$3.544M'] },
];

export const AuditTrail: React.FC = () => {
  const [events,setEvents]=useState<RuntimeEvent[]>([]);
  useEffect(()=>{ fetch('/api/audit').then(r=>r.ok?r.json():{events:[]}).then(d=>setEvents(d.events||[])).catch(()=>setEvents([])); },[]);
  return <div className="page-shell animate-fade-in">
    <section className="page-heading"><div><span className="eyebrow">07 — AUDIT & LINEAGE</span><h1>Every claim should have a path back to evidence.</h1><p>Financial lineage and runtime policy decisions are visible separately, so an AI explanation never becomes an untraceable source of truth.</p></div><div className="read-only-pill"><ShieldCheck className="w-4 h-4"/> Hash-linked runtime events</div></section>

    <section className="panel-card">
      <div className="panel-title-row"><div><span className="eyebrow">FINANCIAL LINEAGE</span><h2>Active metric evidence</h2></div><Link2 className="w-5 h-5 text-brass"/></div>
      <div className="audit-metric-list">
        {metrics.map(m=><article className="audit-metric" key={m.name}>
          <div className="audit-metric-head"><div><span>{m.name}</span><strong>{m.value}</strong></div><TrustBadge status={m.status} compact/></div>
          <p>{m.formula}</p><small>{m.sources} · evidence {m.evidence}</small>
          <div className="audit-lineage">{m.lineage.map((x,i)=><React.Fragment key={x}><span>{x}</span>{i<m.lineage.length-1&&<ArrowRight className="w-3 h-3"/>}</React.Fragment>)}</div>
        </article>)}
      </div>
    </section>

    <section className="panel-card">
      <div className="panel-title-row"><div><span className="eyebrow">RUNTIME CONTROL LOG</span><h2>AI + policy events from this session</h2></div><History className="w-5 h-5 text-brass"/></div>
      {events.length===0?<div className="empty-audit"><CornerDownRight className="w-4 h-4"/><span>Ask the Copilot or run an action qualification check to generate session audit events.</span></div>:
      <div className="runtime-events">{events.map(e=><div className="runtime-event" key={e.id}><span className="audit-dot"/><div><b>{e.type}</b><p>{e.outcome}</p><small>{new Date(e.at).toLocaleString()} · actor {e.actor}</small></div><code>{e.id}</code></div>)}</div>}
    </section>
  </div>;
};
