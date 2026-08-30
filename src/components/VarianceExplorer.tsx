import React, { useState } from 'react';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Terminal,
  FileText
} from 'lucide-react';
import { ViewType } from '../types';

interface DriverNode {
  id: string;
  name: string;
  impact: number; // positive = emerald (improved EBITDA), negative = rust / bracketed (hurt EBITDA)
  valueText: string;
  comparisonText: string;
  confidence: number;
  driverText: string;
  sourceSystem: string;
  recordsText: string;
  level: number;
  parentId: string | null;
  childrenIds?: string[];
}

interface VarianceExplorerProps { onNavigate?: (view: ViewType) => void; }
export const VarianceExplorer: React.FC<VarianceExplorerProps> = ({ onNavigate }) => {
  // Metric Selectors state
  const [selectedMetric, setSelectedMetric] = useState<'EBITDA' | 'Revenue' | 'Cash'>('EBITDA');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ebitda');

  // Track parent collapse/expand state
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({
    // Keep everything expanded by default for full-visibility
  });

  const nodes: DriverNode[] = [
    {
      id: 'ebitda',
      name: 'EBITDA MoM',
      impact: -360762,
      valueText: '−$360,762 MoM',
      comparisonText: '(from +$227,478 in Apr → −$137,008 in May)',
      confidence: 98.6,
      driverText: 'EBITDA decreased due to slipped enterprise renewals and strategic Q3 marketing campaigns initiated early, partially offset by a favorable variable COGS decrease.',
      sourceSystem: 'NetSuite GL + Salesforce + Brex + Gusto Unified Ledger',
      recordsText: 'Reconciled ledger query result hash: r2r.ebitda.may2026 (22,540 rows processed)',
      level: 1,
      parentId: null,
      childrenIds: ['revenue', 'cogs', 'opex']
    },
    {
      id: 'revenue',
      name: 'Revenue',
      impact: -409000,
      valueText: '−$409,000 MoM',
      comparisonText: '(−18.0% MoM drop)',
      confidence: 99.3,
      driverText: 'Decline in closed revenue driven primarily by two high-value enterprise contract renewals slipping into June, plus minor broad-based variable usage cooling.',
      sourceSystem: 'Salesforce CRM Opportunity Pipeline & NetSuite Billing',
      recordsText: 'Billing journal entry batches: INV-2026-05-A to E',
      level: 2,
      parentId: 'ebitda',
      childrenIds: ['renewals', 'net_new']
    },
    {
      id: 'renewals',
      name: 'Enterprise renewals slipped',
      impact: -312000,
      valueText: '−$312,000',
      comparisonText: '(Salesforce stage "Verbal Commit")',
      confidence: 96.0,
      driverText: 'Undisputed enterprise renewals currently delayed in client legal review cycles. Close timelines revised to early June.',
      sourceSystem: 'Salesforce CRM (Enterprise Division)',
      recordsText: 'Salesforce Opportunity records: #7943, #8102',
      level: 3,
      parentId: 'revenue',
      childrenIds: ['hudson', 'northwind']
    },
    {
      id: 'hudson',
      name: 'Alder Peak Partners renewal',
      impact: -184000,
      valueText: '−$184,000',
      comparisonText: 'Moved May 28 → Jun 11 (Verbal Commit)',
      confidence: 94.0,
      driverText: 'Strategic enterprise renewal delayed due to client corporate legal review cycles. Salesforce stage confirmed Verbal Commit.',
      sourceSystem: 'Salesforce CRM',
      recordsText: 'Asset ID: #A-94921, SFDC Opp: #7943',
      level: 4,
      parentId: 'renewals'
    },
    {
      id: 'northwind',
      name: 'Northstar Studios expansion',
      impact: -128000,
      valueText: '−$128,000',
      comparisonText: 'Awaiting signed order form (Verbal Commit)',
      confidence: 92.0,
      driverText: 'Expansion deal fully agreed upon but awaiting formal signature execution from the client procurement director.',
      sourceSystem: 'Salesforce CRM Mid-Market',
      recordsText: 'SFDC Opp: #8102',
      level: 4,
      parentId: 'renewals'
    },
    {
      id: 'net_new',
      name: 'Net new / usage revenue',
      impact: -97000,
      valueText: '−$97,000',
      comparisonText: 'Broad-based, no single account',
      confidence: 88.0,
      driverText: 'Slight cooling in transactional API credit consumption across self-service tiers, following broader macroeconomic cloud trends.',
      sourceSystem: 'Stripe Billing API & NetSuite Accounts Receivable',
      recordsText: 'Usage metric metrics log May 2026: #stripe-usage-may2026',
      level: 3,
      parentId: 'revenue'
    },
    {
      id: 'cogs',
      name: 'COGS lower spend',
      impact: 156238,
      valueText: '+$156,238 lower spend',
      comparisonText: '(Favorable offset, tracks lower revenue)',
      confidence: 99.1,
      driverText: 'Variable cloud data hosting and data processing costs reduced dynamically in direct proportion with lowered API traffic.',
      sourceSystem: 'Amazon Web Services (AWS) Billing Portal & NetSuite AP',
      recordsText: 'AWS Invoice dated May 31, NetSuite Supplier Ledger #AWS-MAY-2026',
      level: 2,
      parentId: 'ebitda'
    },
    {
      id: 'opex',
      name: 'Operating expenses higher',
      impact: -108000,
      valueText: '+$108,000 spend expansion',
      comparisonText: '(+5.4% MoM expense rise)',
      confidence: 98.2,
      driverText: 'Driven overwhelmingly by strategic acquisition marketing spend initialized early; general administration and payroll remain strictly on budget.',
      sourceSystem: 'Corporate Ledger System AP',
      recordsText: 'NetSuite Operations GL Account series #5000-5999',
      level: 2,
      parentId: 'ebitda',
      childrenIds: ['marketing', 'payroll', 'other_opex']
    },
    {
      id: 'marketing',
      name: 'Marketing spend variance',
      impact: -100000,
      valueText: '+$100,000 spend (+41.8% MoM)',
      comparisonText: 'Q3 acquisition campaign started 3 weeks early',
      confidence: 97.0,
      driverText: 'Board-authorized marketing campaigns initiated early to lock down competitive summer placement. Grounded and matched 1:1 against Brex authorizations.',
      sourceSystem: 'Brex Card Services & Google Ads Platform API',
      recordsText: 'Brex card authorization receipts: #BRX-MKT-9204 to #BRX-MKT-9345',
      level: 3,
      parentId: 'opex'
    },
    {
      id: 'payroll',
      name: 'Payroll variance',
      impact: -5000,
      valueText: '+$5,000 spend (+0.7% MoM)',
      comparisonText: 'Scheduled merit increases, stable head count',
      confidence: 99.0,
      driverText: 'Scheduled standard cost-of-living adjustments for engineering team members took effect; total head count remains stable at 42.',
      sourceSystem: 'Gusto payroll integration',
      recordsText: 'Gusto payroll batch entry ID: #GUST-PAY-260530',
      level: 3,
      parentId: 'opex'
    },
    {
      id: 'other_opex',
      name: 'Other opex variance',
      impact: -3000,
      valueText: '+$3,000 spend (+1.1% MoM)',
      comparisonText: 'Within normal operational range',
      confidence: 98.0,
      driverText: 'Standard office operational cost variances and recurring software license adjustments. Well within standard monthly margins.',
      sourceSystem: 'NetSuite Accounts Payable',
      recordsText: 'GL ledger opex postings: itemized items #94821 to #94910',
      level: 3,
      parentId: 'opex'
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if a node should currently be shown based on parent collapses
  const isNodeVisible = (node: DriverNode): boolean => {
    let parentId = node.parentId;
    while (parentId) {
      if (collapsedNodes[parentId]) {
        return false;
      }
      const parent = nodes.find(n => n.id === parentId);
      parentId = parent ? parent.parentId : null;
    }
    return true;
  };

  const getConfidenceLevelClass = (conf: number) => {
    if (conf >= 90) return { text: 'text-emerald', bg: 'bg-emerald/10 border-emerald/20', bar: 'bg-emerald' };
    if (conf >= 75) return { text: 'text-brass', bg: 'bg-brass/10 border-brass/20', bar: 'bg-brass' };
    return { text: 'text-rust', bg: 'bg-rust/10 border-rust/20', bar: 'bg-rust' };
  };

  // Recursively render tree in console/cli indent format
  const renderTreeNodes = (parentId: string | null) => {
    const levelNodes = nodes.filter(n => n.parentId === parentId);
    
    return levelNodes.map(node => {
      if (!isNodeVisible(node)) return null;

      const hasChildren = node.childrenIds && node.childrenIds.length > 0;
      const isExpanded = !collapsedNodes[node.id];
      const isSelected = selectedNodeId === node.id;
      const isPositive = node.impact > 0;
      const confStyle = getConfidenceLevelClass(node.confidence);

      return (
        <div key={node.id} className="relative select-none">
          
          <div 
            onClick={() => setSelectedNodeId(node.id)}
            className={`group variance-explorer-row flex items-center justify-between p-3.5 rounded-xl border mb-2 cursor-pointer shadow-soft transition-all duration-150 ${
              isSelected 
                ? 'bg-ink-700 border-brass shadow-md' 
                : 'bg-ink-850 hover:bg-ink-800 border-ink-700/80 hover:border-ink-600'
            }`}
          >
            {/* Left label & collapse toggle */}
            <div className="flex items-center min-w-0 flex-1">
              
              {/* Indentation / connector area with explicit fixed-width utility classes (12 units / 48px per level) */}
              <div 
                className={`flex-[0_0_auto] flex items-center justify-end ${
                  node.level === 1 ? 'w-0 min-w-0 max-w-0' :
                  node.level === 2 ? 'w-12 min-w-12 max-w-12' :
                  node.level === 3 ? 'w-24 min-w-24 max-w-24' :
                  node.level === 4 ? 'w-36 min-w-36 max-w-36' :
                  'w-48 min-w-48 max-w-48'
                }`}
              >
                {node.level > 1 && (
                  <span className="inline-block text-slate font-mono text-xxs opacity-40 shrink-0 w-6 text-center">├</span>
                )}
              </div>

              {/* Label and Toggle container with vertical center alignment, standardizing spacing with ml-3 */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 ml-3">
                {/* Collapsible toggle */}
                {hasChildren ? (
                  <button 
                    onClick={(e) => toggleCollapse(node.id, e)} 
                    className="w-4 h-4 rounded-xs hover:bg-ink-700 font-mono text-slate flex items-center justify-center shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  <div className="w-4 shrink-0" />
                )}

                {/* Title label */}
                <span className={`text-xs ${isSelected ? 'font-semibold text-paper' : 'text-paper-dim'} font-sans truncate`}>
                  {node.name}
                </span>
              </div>

            </div>

            <div className="flex items-center gap-3 shrink-0 pl-3 w-[300px] justify-end">
              {(() => {
                const m = node.valueText.match(/^([−\-+]?\$[\d,]+)\s*(.*)$/);
                const amount = m ? m[1] : node.valueText;
                const descriptor = m ? m[2] : '';
                return (
                  <span className={`font-mono text-xs font-semibold flex items-baseline gap-2 ${isPositive ? 'text-emerald' : 'text-rust'}`}>
                    <span className="w-[88px] text-right tabular-nums">{amount}</span>
                    <span className="w-[120px] text-left text-[10px] font-normal text-slate truncate">{descriptor}</span>
                  </span>
                );
              })()}
              <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded-lg font-medium uppercase shrink-0 w-11 text-center ${confStyle.bg} ${confStyle.text}`}>
                {node.confidence}%
              </span>
            </div>
          </div>

          {/* Render child nodes nested */}
          {hasChildren && isExpanded && renderTreeNodes(node.id)}

        </div>
      );
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" id="variance-explorer-root">
      
      {/* Header Eyebrow and Description */}
      <div className="border-b border-ink-700 pb-6" id="variance-header">
        <span className="text-xs font-mono tracking-wider text-brass uppercase block mb-1 font-medium">
          07 — Variance Explorer
        </span>
        <h1 className="text-3xl font-sans font-bold text-paper tracking-tight">
          Why did EBITDA move?
        </h1>
        <p className="text-sm text-paper-dim mt-1.5 font-light" style={{ maxWidth: '640px' }}>
          Not a chart of the result — a decomposition of the cause. Drill from the metric down to the records that drove it, with quantified impact and a confidence at every level. This is the layer above the dashboard.
        </p>
      </div>

      {/* Metric Segmented Control and Description line */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-ink-850 p-4 border border-ink-700 rounded-2xl shadow-soft" id="variance-controls">
        
        <div className="space-y-1">
          <span className="text-slate text-xxs font-mono uppercase tracking-wider block font-semibold">ACTIVE METRIC FOCUS</span>
          <div className="flex bg-ink-900 border border-ink-700/80 p-0.5 rounded-lg" id="metric-selectors">
            {(['EBITDA', 'Revenue', 'Cash'] as const).map((metric) => {
              const isSelected = selectedMetric === metric;
              return (
                <button
                  key={metric}
                  onClick={() => {
                    setSelectedMetric(metric);
                    if (metric === 'EBITDA') setSelectedNodeId('ebitda');
                    else if (metric === 'Revenue') setSelectedNodeId('revenue');
                    else if (metric === 'Cash') setSelectedNodeId('ebitda');
                  }}
                  className={`px-3 py-1 font-mono text-xs rounded-md uppercase tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brass force-dark-on-lime font-bold'
                      : 'text-slate hover:text-paper'
                  }`}
                  title={`Focus the driver tree on ${metric}`}
                >
                  {metric}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:text-right font-mono text-xxs text-slate space-y-1" id="cycle-period-label">
          <span className="uppercase tracking-widest block font-medium">COMPARISON PERIOD</span>
          <span className="text-brass font-bold block bg-ink-900 px-2 py-1 rounded-lg border border-ink-700 font-semibold">Apr 2026 → May 2026</span>
        </div>

      </div>

      <p className="text-xxs font-mono text-slate flex items-center gap-1.5 pl-1" id="tracer-intro">
        <Sparkles className="w-3.5 h-3.5 text-brass" /> Every node below is computed from reconciled source records — click to trace the cause.
      </p>

      {/* Main interactive panel tree / inspector view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="driver-explorer-bento">
        
        {/* DRIVER TREE (Left column - 55% width) */}
        <div className="lg:col-span-7 bg-ink-900 border border-ink-700 rounded-2xl shadow-soft p-4 h-full flex flex-col justify-between select-none" id="driver-tree-container">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-ink-700 mb-4 bg-ink-900/30 p-2 rounded-lg" id="tree-section-header">
              <span className="text-xxs font-mono text-slate uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-brass" /> Causal Decomposition Tree
              </span>
              <span className="text-[10px] font-mono text-slate">MoM Variance Scope</span>
            </div>

            <div className="space-y-1" id="interactive-rendered-tree">
              {renderTreeNodes(null)}
            </div>
          </div>

          <div className="mt-6 border-t border-ink-700/60 pt-3 text-xxs font-mono text-slate/75" id="tree-footer">
            Note: Favorable impacts are categorized as positive green (+), cost slips as negative red (−).
          </div>
        </div>

        {/* EVIDENCE PANEL (Right column - 45% width) */}
        <div className="lg:col-span-5 bg-ink-850 border border-ink-700 p-5 rounded-2xl shadow-soft flex flex-col justify-between h-full" id="evidence-panel-container">
          
          <div className="space-y-6">
            
            {/* Header section */}
            <div className="pb-4 border-b border-ink-700" id="evidence-header-block">
              <span className="text-[9px] font-mono text-slate uppercase tracking-widest block mb-1">
                Selected Variance Node
              </span>
              <h2 className="text-lg font-sans font-bold text-paper">
                {selectedNode.name}
              </h2>
              <span className="text-xxs font-mono text-slate block mt-1">
                System Key: variance.node.{selectedNode.id}
              </span>
            </div>

            {/* Impact indicator */}
            <div className="bg-ink-900 border border-ink-700/80 p-4 rounded-xl shadow-soft text-center" id="impact-card">
              <span className="text-xxs font-mono text-slate block mb-1 uppercase tracking-wide">QUANTIFIED EBITDA IMPACT</span>
              <div className={`text-2xl font-mono font-bold ${selectedNode.impact > 0 ? 'text-emerald' : 'text-rust'}`}>
                {selectedNode.valueText}
              </div>
              <p className="text-xxs font-sans text-paper-dim font-light mt-1.5 italic">
                {selectedNode.comparisonText}
              </p>
            </div>

            {/* Plain English Driver */}
            <div className="space-y-1.5" id="desc-driver-text">
              <span className="text-xxs font-mono text-slate uppercase tracking-wider block">Causal Explanation</span>
              <div className="bg-ink-900/50 border border-ink-800 p-3 rounded-lg text-xs text-paper-dim font-light leading-relaxed">
                {selectedNode.driverText}
              </div>
            </div>

            {/* System Sources */}
            <div className="space-y-2" id="desc-source-system">
              <span className="text-xxs font-mono text-slate uppercase tracking-wider block font-semibold">Unified Sources</span>
              
              <div className="bg-ink-900 border border-ink-750/90 rounded-lg p-3 font-mono text-xxs space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-brass" />
                  <span className="text-paper truncate select-all">{selectedNode.sourceSystem}</span>
                </div>
                <div className="border-t border-ink-700/60 pt-2 flex items-start gap-2 text-slate">
                  <Terminal className="w-3.5 h-3.5 text-slate mt-0.5" />
                  <span className="select-all block leading-relaxed">{selectedNode.recordsText}</span>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5" id="desc-confidence-bar">
              <div className="flex justify-between items-center text-xxs font-mono">
                <span className="text-slate uppercase tracking-wider">RECONCILED TRUST LEVEL</span>
                <span className={`font-semibold ${getConfidenceLevelClass(selectedNode.confidence).text}`}>
                  {selectedNode.confidence}% CONFIDENT
                </span>
              </div>
              
              <div className="w-full bg-ink-900 rounded-full h-1.5 overflow-hidden border border-ink-750">
                <div 
                  className={`h-full ${getConfidenceLevelClass(selectedNode.confidence).bar} transition-all duration-300`}
                  style={{ width: `${selectedNode.confidence}%` }}
                />
              </div>
            </div>

          </div>

          {/* Audit trail redirection link / button */}
          <div className="mt-8 pt-4 border-t border-ink-700 flex flex-col gap-3" id="evidence-verifiable-block">
            <p className="text-[10px] text-slate leading-relaxed font-light font-sans">
              Every data step of this drill-down is verified against cryptographic snapshot ledger logs recorded at May-close.
            </p>
            
            <button
              onClick={() => onNavigate?.('audit_trail')}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-ink-700 hover:bg-ink-650 text-white font-sans text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer font-bold"
            >
              <FileText className="w-3.5 h-3.5 text-brass" />
              <span>Verify in Audit Trail ➔</span>
            </button>
          </div>

        </div>

      </div>

      {/* Closing strip under both tables */}
      <div className="border-l-2 border-brass bg-ink-850 p-4 rounded-r-xl text-xs font-mono text-brass italic" id="closing-strip">
        &ldquo;From &apos;what happened&apos; to &apos;why&apos; — and one click from &apos;why&apos; to the source rows. That&apos;s the difference between a report and a decision system.&rdquo;
      </div>

    </div>
  );
};
