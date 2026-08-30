import React, { useState } from 'react';
import { ReconciliationRecord } from '../types';
import { Check, X, ShieldAlert, Sparkles, Filter, CheckCircle2, UserPlus } from 'lucide-react';

interface ReconciliationProps {
  records: ReconciliationRecord[];
}

export const Reconciliation: React.FC<ReconciliationProps> = ({ records: initialRecords }) => {
  const [records, setRecords] = useState<ReconciliationRecord[]>(initialRecords);

  // Derive top stat tiles
  const autoMatchedCount = records.filter(r => r.status === 'AUTO-MATCHED').length;
  const needsReviewCount = records.filter(r => r.status === 'NEEDS-REVIEW').length;
  const unmatchedCount = records.filter(r => r.status === 'UNMATCHED').length;

  const handleMerge = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'AUTO-MATCHED',
              note: `${r.note} (Manually approved and merged by controller)`,
            }
          : r
      )
    );
  };

  const handleKeepSeparate = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'RESOLVED-SEPARATE',
              note: `${r.note} (Controller confirmed these are distinct legal entities — kept separate)`,
            }
          : r
      )
    );
  };

  const handleAssignVendor = (id: string, vendorName: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'AUTO-MATCHED',
              variants: [...r.variants, { system: 'NetSuite', name: vendorName }],
              note: `EBITDA release authorized. Assigned vendor to ${vendorName} portfolio.`,
            }
          : r
      )
    );
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'AUTO-MATCHED':
        return 'bg-emerald/10 text-emerald border border-emerald/20';
      case 'RESOLVED-SEPARATE':
        return 'bg-slate/10 text-slate border border-slate/25';
      case 'NEEDS-REVIEW':
        return 'bg-brass/10 text-brass border border-brass/20';
      case 'UNMATCHED':
        return 'bg-rust/10 text-rust border border-rust/20';
      default:
        return 'bg-ink-700 text-slate border border-ink-700';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="reconciliation-root">
      
      {/* Header */}
      <div className="border-b border-ink-700 pb-6" id="recon-header">
        <span className="text-xs font-mono tracking-wider text-brass uppercase block mb-1 font-medium">
          03 — Reconciliation Engine
        </span>
        <h1 className="text-3xl font-sans font-bold text-paper tracking-tight">
          Entity Resolution
        </h1>
        <p className="text-sm text-paper-dim mt-1.5 font-light" style={{ maxWidth: '640px' }}>
          Identical vendors or customers are keyed differently across source data feeds. The engine resolves legal entities using semantic distance, fuzzy heuristics, and LLM orchestration.
        </p>
      </div>

      {/* Metric Tiles counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="recon-stats">
        
        {/* Tile 1: Auto-Matched */}
        <div className="bg-ink-850 p-5 border border-ink-700/80 rounded-2xl shadow-soft relative" id="stat-tile-matched">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate uppercase font-medium">resolved &amp; mapped</span>
            <div className="w-1.5 h-1.5 bg-emerald rounded-full" />
          </div>
          <div className="mt-3 font-sans text-3xl font-bold text-emerald">{autoMatchedCount}</div>
          <p className="text-xxs font-mono text-slate mt-1 font-medium">reconciled at high confidence (90%+)</p>
        </div>

        {/* Tile 2: Needs Review */}
        <div className="bg-ink-850 p-5 border border-ink-700/80 rounded-2xl shadow-soft relative" id="stat-tile-review">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate uppercase font-medium">exception queue</span>
            {needsReviewCount > 0 && <div className="w-1.5 h-1.5 bg-brass rounded-full animate-pulse" />}
          </div>
          <div className="mt-3 font-sans text-3xl font-bold text-brass">{needsReviewCount}</div>
          <p className="text-xxs font-mono text-slate mt-1 font-medium">awaiting operational merge approvals</p>
        </div>

        {/* Tile 3: Unmatched */}
        <div className="bg-ink-850 p-5 border border-ink-700/80 rounded-2xl shadow-soft relative" id="stat-tile-unmatched">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate uppercase font-medium">orphaned entries</span>
            {unmatchedCount > 0 && <div className="w-1.5 h-1.5 bg-rust rounded-full" />}
          </div>
          <div className="mt-3 font-sans text-3xl font-bold text-rust">{unmatchedCount}</div>
          <p className="text-xxs font-mono text-slate mt-1 font-medium">unmapped transactions held out from EBITDA</p>
        </div>

      </div>

      {/* Record List */}
      <div className="bg-ink-850 border border-ink-700 rounded-2xl shadow-soft" id="recon-records-container">
        
        <div className="p-4 border-b border-ink-700 flex items-center justify-between bg-ink-900/40 rounded-t-2xl">
          <span className="text-xxs font-mono tracking-wider text-slate uppercase font-medium">Ledger Resolve Queue</span>
          <span className="text-xxs font-mono text-slate flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5" /> Ordered by Confidence Score
          </span>
        </div>

        <div className="divide-y divide-ink-700/70">
          {records.map((record) => {
            const isNeedReview = record.status === 'NEEDS-REVIEW';
            const isUnmatched = record.status === 'UNMATCHED';

            return (
              <div 
                key={record.id} 
                className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-ink-850/50 transition-colors"
                id={`record-row-${record.id}`}
              >
                
                {/* Primary context left */}
                <div className="space-y-3 max-w-3xl flex-1">
                  
                  {/* Title block */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-sans font-semibold text-paper">
                      {record.entityName}
                    </h4>
                    
                    <span className={`px-2 py-0.5 rounded-lg font-sans text-[9px] tracking-wider uppercase font-semibold ${getStatusColorClass(record.status)}`}>
                      {record.status}
                    </span>

                    <span className="bg-ink-700 text-paper-dim border border-ink-600 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-medium">
                      {record.method}()
                    </span>

                    <span className="font-mono text-[10px] text-slate font-medium">
                      Conf. <span className={record.confidence > 80 ? 'text-emerald' : 'text-brass'}>{record.confidence.toFixed(1)}%</span>
                    </span>
                  </div>

                  {/* System Variants of name */}
                  <div className="flex flex-wrap gap-1.5" id={`variants-${record.id}`}>
                    {record.variants.map((v, index) => (
                      <span 
                        key={index} 
                        className="bg-ink-900 border border-ink-700/80 rounded-lg px-2 py-1 text-xxs font-mono flex items-center gap-1 text-paper-dim"
                      >
                        <span className="text-slate uppercase text-[9px] font-semibold">{v.system}:</span>
                        <span className="text-paper italic">&ldquo;{v.name}&rdquo;</span>
                      </span>
                    ))}
                  </div>

                  {/* Copilot explanatory note */}
                  <div className="flex gap-2 items-start bg-ink-900 border border-ink-700/40 px-3 py-2.5 rounded-lg shadow-soft text-xs font-light text-paper-dim">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 text-brass shrink-0" />
                    <p>{record.note}</p>
                  </div>

                </div>

                {/* Operations right */}
                <div className="shrink-0 flex items-center gap-3" id={`actions-${record.id}`}>
                  {isNeedReview && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleKeepSeparate(record.id)}
                        className="px-3 py-1.5 border border-ink-600 rounded-lg text-xxs font-sans text-slate hover:bg-ink-700 hover:text-paper uppercase tracking-wider cursor-pointer font-semibold"
                      >
                        Keep Separate
                      </button>
                      
                      <button
                        onClick={() => handleMerge(record.id)}
                        className="px-3 py-1.5 bg-emerald/10 text-emerald border border-emerald/30 hover:bg-emerald/20 rounded-lg text-xxs font-sans uppercase tracking-wider flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Check className="w-3 h-3" /> Approve Merge
                      </button>
                    </div>
                  )}

                  {isUnmatched && (
                    <button
                      onClick={() => handleAssignVendor(record.id, 'Parkview Hospitality LLC')}
                      className="px-3 py-1.5 bg-brass force-dark-on-lime hover:bg-brass-dim rounded-lg text-xxs font-sans uppercase tracking-wider flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Assign to NetSuite Vendor
                    </button>
                  )}

                  {!isNeedReview && !isUnmatched && (
                    <div className={`flex items-center gap-1.5 font-sans text-xs font-semibold ${record.status === 'RESOLVED-SEPARATE' ? 'text-slate' : 'text-emerald'}`}>
                      <CheckCircle2 className="w-4 h-4" /> {record.status === 'RESOLVED-SEPARATE' ? 'RESOLVED' : 'RECONCILED'}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
