import React, { useState } from 'react';
import { DagNode } from '../types';
import { Network, FileCode, CheckCircle, HelpCircle, Server, Database, Brain, Cpu, Layers } from 'lucide-react';

interface CalculationEngineProps {
  nodes: DagNode[];
}

export const CalculationEngine: React.FC<CalculationEngineProps> = ({ nodes }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ebitda');
  const [techStackExpanded, setTechStackExpanded] = useState<boolean>(true);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[nodes.length - 1];

  // Helper to trigger clicking a node
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // Group nodes by their structural layer for physical presentation
  const sourceNodes = nodes.filter(n => n.type === 'source');
  const intermediateNodes = nodes.filter(n => n.type === 'intermediate');
  const outputNodes = nodes.filter(n => n.type === 'output');

  return (
    <div className="space-y-8 animate-fade-in" id="calculation-root">
      
      {/* Header */}
      <div className="border-b border-ink-700 pb-6" id="calc-header">
        <span className="text-xs font-mono tracking-wider text-brass uppercase block mb-1 font-medium">
          04 — Calculation Layer
        </span>
        <h1 className="text-3xl font-sans font-bold text-paper tracking-tight">
          The Metric DAG
        </h1>
        <p className="text-sm text-paper-dim mt-1.5 font-light" style={{ maxWidth: '640px' }}>
          Every metric is declared as clear declarative code, not a hidden cell reference inside a fragile sheet. This auditable dependency graph replaces 200 interlinked Excel tabs.
        </p>
      </div>

      {/* Main Section: Graph and Side Node Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="dag-builder-layout">
        
        {/* Interactive DAG Diagram */}
        <div className="xl:col-span-2 bg-ink-900 border border-ink-700 rounded-2xl shadow-soft p-6 relative overflow-hidden" id="dag-wrapper-box">
          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate flex items-center gap-1 font-medium">
            <Network className="w-3.5 h-3.5 text-brass" /> INTERACTIVE CLOSING GRAPH (v1.12)
          </div>
          
          <div className="mb-8">
            <span className="text-[10px] font-mono text-slate uppercase tracking-wider block mb-1 font-medium">DECLARATIVE GRAPH VIEW</span>
            <h3 className="text-sm font-sans font-semibold text-paper">Select any pill to inspect formula state and inputs</h3>
          </div>

          {/* DAG Layout with absolute canvas paths */}
          <div className="relative mt-8 min-h-[440px] grid grid-cols-3 gap-8 items-center" id="dag-node-grid">
            
            {/* Column 1: Sources */}
            <div className="flex flex-col space-y-4" id="col-sources">
              <span className="text-[9px] font-mono text-slate uppercase tracking-widest text-center border-b border-ink-700 pb-1.5 mb-2">
                04.1 · SOURCES
              </span>
              {sourceNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className={`w-full text-left p-3.5 rounded-xl shadow-soft border transition-all relative cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-ink-700 border-brass shadow-md translate-x-1' 
                        : 'bg-ink-850 hover:bg-ink-700 border-ink-700 hover:border-ink-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold font-mono text-paper tracking-wide uppercase truncate">{node.label}</span>
                      <span className="text-xxs font-mono text-slate shrink-0">{node.version}</span>
                    </div>
                    <div className="mt-2 text-sm font-mono text-paper-dim">{node.value}</div>
                    {node.rowCount && <span className="text-[9px] font-mono text-slate block mt-1">{node.rowCount}</span>}
                  </button>
                );
              })}
            </div>

            {/* Column 2: Intermediate Calculations */}
            <div className="flex flex-col space-y-8" id="col-intermediate">
              <span className="text-[9px] font-mono text-slate uppercase tracking-widest text-center border-b border-ink-700 pb-1.5 mb-2">
                04.2 · TRANSFORMATIONS
              </span>
              {intermediateNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className={`w-full text-left p-4 rounded-xl shadow-soft border transition-all relative cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-ink-700 border-brass shadow-md scale-102 font-medium' 
                        : 'bg-ink-850 hover:bg-ink-700 border-brass/30 hover:border-brass/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold font-mono text-brass uppercase tracking-wide truncate">{node.label}</span>
                      <span className="text-xxs font-mono text-slate shrink-0">{node.version}</span>
                    </div>
                    <div className="mt-2.5 text-base font-mono text-paper font-semibold">{node.value}</div>
                    <span className="text-[9px] font-mono text-slate block mt-1.5 truncate">{node.formula}</span>
                  </button>
                );
              })}
            </div>

            {/* Column 3: Outputs */}
            <div className="flex flex-col space-y-4" id="col-outputs">
              <span className="text-[9px] font-mono text-slate uppercase tracking-widest text-center border-b border-ink-700 pb-1.5 mb-2">
                04.3 · TARGETS
              </span>
              {outputNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className={`w-full text-left p-5 rounded-xl shadow-soft border transition-all relative cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-brass force-dark-on-lime border-paper shadow-lg font-bold' 
                        : 'bg-brass/90 hover:bg-brass force-dark-on-lime border-ink-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold font-mono uppercase tracking-widest">FINAL CLOSING OUTPUT</span>
                      <span className="text-[10px] font-mono shrink-0">{node.version}</span>
                    </div>
                    <h4 className="text-xl font-sans font-semibold mt-3" style={{ color: '#071016' }}>{node.label}</h4>
                    <div className="text-xl font-mono mt-1 font-bold">{node.value}</div>
                    <span className="text-[10px] font-mono block mt-2 opacity-80 uppercase tracking-wider">{node.formula}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Connective Line Descriptor */}
          <div className="mt-4 border-t border-ink-700/60 pt-4 text-center">
            <p className="text-xxs font-mono text-slate tracking-wide" id="dag-one-liner">
              Change a formula once, here — every dependent metric and its version stamp updates downstream. No 200-tab ripple, no broken references.
            </p>
          </div>
        </div>

        {/* Selected Node Details side panel */}
        <div className="bg-ink-850 border border-ink-700 p-5 rounded-2xl shadow-soft flex flex-col justify-between h-full" id="side-inspector">
          <div>
            <div className="flex items-center gap-1.5 text-brass pb-3 border-b border-ink-700 mb-4">
              <FileCode className="w-4 h-4 text-brass" />
              <span className="text-xxs font-mono tracking-wider uppercase font-medium">Formula Inspector</span>
            </div>

            <h3 className="text-xl font-sans font-semibold text-paper mb-1">{selectedNode.label}</h3>
            <span className="text-xxs font-mono text-slate block mb-4">Node Hash ID: math.node.{selectedNode.id}</span>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate block mb-1 uppercase tracking-wider">Metric Definition / Code</span>
                <div className="bg-ink-900 font-mono text-xs text-brass/90 p-3 rounded-sm border border-ink-700 select-all overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedNode.formula}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate block mb-1 uppercase tracking-wider">Computed Value</span>
                  <div className="text-lg font-mono text-paper font-semibold select-all">{selectedNode.value}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate block mb-1 uppercase tracking-wider">Confidence Layer</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald/10 text-emerald text-[10px] font-mono border border-emerald/20 mt-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> {selectedNode.confidence}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate block mb-1.5 uppercase tracking-wider">Depends on (Predecessors)</span>
                {selectedNode.dependsOn.length === 0 ? (
                  <span className="text-xxs font-mono text-slate italic">None (Root source data input)</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.dependsOn.map((dep, i) => (
                      <span key={i} className="bg-ink-900 border border-ink-700 px-2 py-1 rounded-lg text-xxs font-mono text-paper-dim">
                        {dep}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-ink-700/60 pb-1 text-xxs leading-relaxed font-light text-paper-dim">
                This computation resolves directly over <span className="font-semibold text-paper">canonical close schema</span>, preserving version and snapshot references for every node. Metric-definition changes remain explicit and version-controlled.
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-ink-700 text-slate text-xxs font-mono flex items-center justify-between">
            <span>PIPELINE ENGINE</span>
            <span>SNAPSHOT v1.12</span>
          </div>
        </div>

      </div>

      {/* Expandable Tech Stack Reasoning note */}
      <div className="bg-ink-850 border border-ink-700 rounded-2xl shadow-soft overflow-hidden" id="architecture-block">
        <div 
          onClick={() => setTechStackExpanded(!techStackExpanded)}
          className="p-4 bg-ink-900/60 hover:bg-ink-900/90 transition-colors flex items-center justify-between cursor-pointer border-b border-ink-700"
          id="toggle-architect-header"
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-brass" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-paper font-semibold">04.4 · Technical Stack &amp; Architecture Reasoning</h4>
          </div>
          <span className="text-xs font-mono text-brass uppercase font-semibold">
            {techStackExpanded ? 'Collapse Schema Details [-]' : 'Expand Architecture Details [+]'}
          </span>
        </div>

        {techStackExpanded && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 border-t border-ink-700 animate-fade-in" id="architecture-panels">
            
            {/* Aspect 1 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-paper">
                <Layers className="w-3.5 h-3.5 text-brass" />
                <span className="text-xs font-semibold font-mono tracking-wide uppercase">CLIENT CAP</span>
              </div>
              <p className="text-xxs font-mono text-slate">Next.js &amp; Tailwind</p>
              <p className="text-xs text-paper-dim font-light leading-relaxed">
                Clean single-state dashboard components using standard declarative Recharts mapping directly to reconciled data formats. No heavy UI overhead.
              </p>
            </div>

            {/* Aspect 2 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-paper">
                <Cpu className="w-3.5 h-3.5 text-brass" />
                <span className="text-xs font-semibold font-mono tracking-wide uppercase">BACKEND API</span>
              </div>
              <p className="text-xxs font-mono text-slate font-light">Node.js Express / Python FastAPI</p>
              <p className="text-xs text-paper-dim font-light leading-relaxed">
                Exposes clean RPC methods for ingesting, scoring, and invoking LLM reconciles side-by-side with raw database lookups.
              </p>
            </div>

            {/* Aspect 3 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-paper">
                <Network className="w-3.5 h-3.5 text-brass" />
                <span className="text-xs font-semibold font-mono tracking-wide uppercase">CLOSE RUNNING</span>
              </div>
              <p className="text-xxs font-mono text-slate">Temporal Orchestration</p>
              <p className="text-xs text-paper-dim font-light leading-relaxed">
                The close cycle runs as a durable workflow. Each ingestion task and reconcile checklist is tracked with atomic retry thresholds and checkpoints.
              </p>
            </div>

            {/* Aspect 4 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-paper">
                <Database className="w-3.5 h-3.5 text-brass" />
                <span className="text-xs font-semibold font-mono tracking-wide uppercase">LEDGER STORE</span>
              </div>
              <p className="text-xxs font-mono text-slate">pgvector + DuckDB</p>
              <p className="text-xs text-paper-dim font-light leading-relaxed">
                Durable vector embeddings for finding overlapping account IDs. DuckDB handles high-speed offline in-memory metrics on CSV datasets.
              </p>
            </div>

            {/* Aspect 5 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-paper">
                <Brain className="w-3.5 h-3.5 text-brass" />
                <span className="text-xs font-semibold font-mono tracking-wide uppercase">AI ORCHESTRATION</span>
              </div>
              <p className="text-xxs font-mono text-slate">Gemini API Integrator</p>
              <p className="text-xs text-paper-dim font-light leading-relaxed">
                Leverages Gemini 3.5 Flash server-side. Prompts are injected with ledger context and raw anomaly patterns to formulate verifiable insights.
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
