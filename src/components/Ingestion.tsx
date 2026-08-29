import React, { useState, useRef, useEffect } from 'react';
import { IngestionSource } from '../types';
import { CloudUpload, Play, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface IngestionProps {
  sources: IngestionSource[];
}

export const Ingestion: React.FC<IngestionProps> = ({ sources }) => {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const logsToStream = [
    'Connecting to 5 source systems…',
    'netsuite_gl_export_may2026.csv — parsed 18,420 rows',
    'sfdc_closed_won_pipeline_may2026.csv — parsed 1,284 rows',
    'gusto_payroll_register_may2026.csv — parsed 312 rows',
    'mercury_bank_feed_may2026.csv — parsed 946 rows',
    'brex_card_transactions_may2026.csv — parsed 2,108 rows',
    'Normalizing schemas to canonical financial model…',
    'Running entity resolution across vendor & customer names…',
    'Scoring completeness, consistency, accuracy, freshness…',
    '6 records routed to Reconciliation Center for review',
    'Rebuilding metric DAG (v1.12) and refreshing dashboard…',
    'Ingestion cycle complete — 23,070 rows processed in 4.8s'
  ];

  const handleRunIngestion = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleLogs([]);

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logsToStream.length) {
        setConsoleLogs((prev) => [...prev, logsToStream[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, 400);
    intervalRef.current = interval;
  };

  const toggleIssues = (id: string) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 95) return 'bg-emerald';
    if (score >= 85) return 'bg-brass';
    return 'bg-rust';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="ingestion-root">
      
      {/* View Header */}
      <div className="border-b border-ink-700 pb-6" id="ingestion-header">
        <span className="text-xs font-mono tracking-wider text-brass uppercase block mb-1 font-medium">
          02 — AI Ingestion Layer
        </span>
        <h1 className="text-3xl font-sans font-bold text-paper tracking-tight">
          Upload &amp; Connect
        </h1>
        <p className="text-sm text-paper-dim mt-1.5 font-light" style={{ maxWidth: '640px' }}>
          Replacing manual copy-paste. The AI parser processes raw CSV exports, bank feeds, card transactions, and PDFs into one canonical reconciled ledger.
        </p>
      </div>

      {/* Main Row: Drop Zone + Living Stream Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="ingestion-action-grid">
        
        {/* Drop Zone */}
        <div 
          className="bg-ink-850 border border-dashed border-ink-700 p-8 rounded-2xl shadow-soft flex flex-col items-center justify-center text-center group hover:border-brass/40 transition-colors"
          id="dropzone-box"
        >
          <div className="w-12 h-12 rounded-full bg-ink-700 flex items-center justify-center text-brass mb-4 group-hover:scale-105 transition-transform">
            <CloudUpload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-sans font-semibold text-paper">Ingestion Target</h3>
          <p className="text-xs text-paper-dim max-w-sm mt-2 leading-relaxed">
            Drop a NetSuite GL export, Salesforce Won pipeline, Gusto register, Mercury bank feed, or Brex statement here. Or execute standard cycle.
          </p>
          
          <button
            onClick={handleRunIngestion}
            disabled={isRunning}
            className={`mt-6 px-5 py-2.5 rounded-lg font-sans text-xs tracking-wider uppercase inline-flex items-center gap-2 transition-all ${
              isRunning 
                ? 'bg-ink-700 text-slate cursor-not-allowed' 
                 : 'bg-brass text-white hover:bg-brass-dim hover:text-paper cursor-pointer font-bold'
            }`}
            id="run-ingestion-button"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Ingestion In Progress...' : 'Run Ingestion Cycle'}
          </button>
        </div>

        {/* Live streaming logs */}
        <div 
          className="bg-ink-900 border border-ink-700 p-5 rounded-2xl shadow-soft font-mono text-xs flex flex-col justify-between h-72 lg:h-auto"
          id="streaming-logs-console"
        >
          <div className="flex items-center justify-between border-b border-ink-700 pb-2 mb-3">
            <span className="text-slate uppercase tracking-wider text-[10px] font-medium">LIVING INGESTION CONSOLE</span>
            <span className="w-2 h-2 rounded-full bg-brass shrink-0 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 leading-relaxed scrollbar" style={{ maxHeight: '200px' }}>
            {consoleLogs.length === 0 ? (
              <div className="text-slate italic font-light py-8 text-center">
                Click "Run Ingestion Cycle" to observe live schema normalization and entity matching stream output.
              </div>
            ) : (
              consoleLogs.map((log, index) => (
                <div key={index} className="flex gap-2.5 animate-fade-in-up">
                  <span className="text-brass shrink-0 select-none">$</span>
                  <span className="text-paper-dim font-light">{log}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-ink-700 pt-2 flex items-center justify-between text-[10px] text-slate font-medium">
            <span>PIPELINE v1.12</span>
            <span>{isRunning ? 'RUNNING...' : consoleLogs.length > 0 ? 'COMPLETE' : 'STANDBY'}</span>
          </div>
        </div>

      </div>

      {/* Connected Source Cards */}
      <div className="space-y-4" id="ingestion-source-list">
        <h3 className="text-lg font-sans font-semibold text-paper">Connected Data Streams</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="source-cards-grid">
          {sources.map((source) => {
            const isClean = source.status === 'CLEAN';
            const showIssues = expandedIssues[source.id];
            
            return (
              <div 
                key={source.id} 
                className="bg-ink-850 border border-ink-700 rounded-2xl shadow-soft p-4 hover:border-ink-600 transition-colors flex flex-col justify-between"
                id={`source-card-${source.id}`}
              >
                <div>
                  {/* Title and Status Row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold font-sans tracking-wide text-paper uppercase">{source.systemName}</h4>
                      <p className="text-xxs font-mono text-slate mt-0.5">{source.fileName}</p>
                    </div>

                    <button 
                      onClick={() => !isClean && toggleIssues(source.id)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-sans tracking-wider font-semibold uppercase inline-flex items-center gap-1 ${
                        isClean 
                          ? 'bg-emerald/10 text-emerald border border-emerald/20' 
                          : 'bg-brass/10 text-brass border border-brass/20 hover:bg-brass/20 cursor-pointer'
                      }`}
                    >
                      {isClean ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5" /> CLEAN
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {source.issues?.length} FLAGGED 
                          {showIssues ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Score Bars Row */}
                  <div className="mt-4 grid grid-cols-4 gap-2 border-t border-ink-700/60 pt-3 text-[10px]">
                    <div>
                      <span className="text-slate block font-mono text-[9px] uppercase tracking-wide font-medium">Comp.</span>
                      <div className="h-1 bg-ink-700 mt-1 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreColorClass(source.scores.completeness)}`} style={{ width: `${source.scores.completeness}%` }} />
                      </div>
                      <span className="text-paper-dim block font-mono mt-0.5">{source.scores.completeness}%</span>
                    </div>

                    <div>
                      <span className="text-slate block font-mono text-[9px] uppercase tracking-wide font-medium">Cons.</span>
                      <div className="h-1 bg-ink-700 mt-1 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreColorClass(source.scores.consistency)}`} style={{ width: `${source.scores.consistency}%` }} />
                      </div>
                      <span className="text-paper-dim block font-mono mt-0.5">{source.scores.consistency}%</span>
                    </div>

                    <div>
                      <span className="text-slate block font-mono text-[9px] uppercase tracking-wide font-medium">Acc.</span>
                      <div className="h-1 bg-ink-700 mt-1 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreColorClass(source.scores.accuracy)}`} style={{ width: `${source.scores.accuracy}%` }} />
                      </div>
                      <span className="text-paper-dim block font-mono mt-0.5">{source.scores.accuracy}%</span>
                    </div>

                    <div>
                      <span className="text-slate block font-mono text-[9px] uppercase tracking-wide font-medium">Recon.</span>
                      <div className="h-1 bg-ink-700 mt-1 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreColorClass(source.scores.reconciliation)}`} style={{ width: `${source.scores.reconciliation}%` }} />
                      </div>
                      <span className="text-paper-dim block font-mono mt-0.5">{source.scores.reconciliation}%</span>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="mt-4 border-t border-ink-700/60 pt-2.5 flex items-center justify-between text-xxs font-mono text-slate font-medium">
                  <span>{source.rowCount.toLocaleString()} lines parsed</span>
                  <span>Synced {source.lastSync}</span>
                </div>

                {/* Expanded Warnings Block */}
                {!isClean && showIssues && source.issues && (
                  <div className="mt-3 bg-ink-900 border border-brass/20 p-2.5 rounded-lg shadow-soft animate-fade-in text-[11px] text-paper-dim font-light space-y-1">
                    {source.issues.map((issue, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <span className="text-brass font-bold leading-none mt-0.5">•</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
