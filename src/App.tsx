import { useEffect, useState } from 'react';
import { ViewType, NavItem } from './types';
import { SYNTHETIC_FINANCIALS, INGESTION_SOURCES_DATA, RECONCILIATION_RECORDS_DATA, DAG_NODES_DATA } from './data';
import { CommandCenter } from './components/CommandCenter';
import { Ingestion } from './components/Ingestion';
import { Reconciliation } from './components/Reconciliation';
import { CalculationEngine } from './components/CalculationEngine';
import { AICopilot } from './components/AICopilot';
import { AuditTrail } from './components/AuditTrail';
import { RoiImpact } from './components/RoiImpact';
import { VarianceExplorer } from './components/VarianceExplorer';
import { TrustSecurity } from './components/TrustSecurity';
import { supabase } from './lib/supabase';
import { clearActiveOrganizationId } from './lib/api';
import {
  LayoutDashboard, Database, ArrowUpDown, Binary, BotMessageSquare, History,
  TrendingUp, GitBranch, ShieldCheck, Sun, Moon, FlaskConical, CircleDot, LogOut
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('command_center');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  const handleSignOut = async () => {
    clearActiveOrganizationId();
    await supabase.auth.signOut();
  };

  const navItems: NavItem[] = [
    { id: '01', view: 'command_center', label: 'Command Center', icon: 'LayoutDashboard' },
    { id: '02', view: 'ingestion', label: 'Data Ingestion', icon: 'Database' },
    { id: '03', view: 'reconciliation', label: 'Reconciliation', icon: 'ArrowUpDown' },
    { id: '04', view: 'calculation', label: 'Finance Truth Core', icon: 'Binary' },
    { id: '05', view: 'copilot', label: 'Governed Copilot', icon: 'BotMessageSquare' },
    { id: '06', view: 'variance_explorer', label: 'Variance Explorer', icon: 'GitBranch' },
    { id: '07', view: 'audit_trail', label: 'Audit Trail', icon: 'History' },
    { id: '08', view: 'roi_impact', label: 'ROI & Impact', icon: 'TrendingUp' },
    { id: '09', view: 'trust_security', label: 'Trust & Security', icon: 'ShieldCheck' },
  ];

  const icons: Record<string, any> = { LayoutDashboard, Database, ArrowUpDown, Binary, BotMessageSquare, GitBranch, History, TrendingUp, ShieldCheck };

  const renderView = () => {
    switch (activeView) {
      case 'command_center': return <CommandCenter data={SYNTHETIC_FINANCIALS} onNavigate={setActiveView} />;
      case 'ingestion': return <Ingestion sources={INGESTION_SOURCES_DATA} />;
      case 'reconciliation': return <Reconciliation records={RECONCILIATION_RECORDS_DATA} />;
      case 'calculation': return <CalculationEngine nodes={DAG_NODES_DATA} />;
      case 'copilot': return <AICopilot />;
      case 'variance_explorer': return <VarianceExplorer onNavigate={(v) => setActiveView(v as ViewType)} />;
      case 'audit_trail': return <AuditTrail />;
      case 'roi_impact': return <RoiImpact />;
      case 'trust_security': return <TrustSecurity />;
      default: return <CommandCenter data={SYNTHETIC_FINANCIALS} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div>
          <div className="brand-block">
            <div className="brand-mark"><span>CFO</span><b>OS</b></div>
            <p>Governed finance intelligence</p>
          </div>

          <div className="demo-banner"><FlaskConical className="w-3.5 h-3.5" /><span>Synthetic public demo</span></div>

          <nav className="side-nav">
            {navItems.map((item) => {
              const Icon = icons[item.icon] || LayoutDashboard;
              return <button key={item.id} className={activeView === item.view ? 'active' : ''} onClick={() => setActiveView(item.view)}><span className="nav-index">{item.id}</span><Icon className="w-4 h-4"/><span>{item.label}</span></button>;
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="system-status"><CircleDot className="w-3.5 h-3.5"/><div><span>Close state</span><b>Review required</b></div></div>
          <div className="sidebar-metrics"><span>Evidence <b>94</b></span><span>Agreement <b>86%</b></span></div>
          <p>Model authority: <b>read only</b></p>
          <button className="sidebar-signout" type="button" onClick={() => { void handleSignOut(); }}>
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left"><span className="close-chip">MAY 2026 · FINAL CLOSE</span><span className="snapshot">Snapshot 01 Jun 2026 · 05:14 UTC</span></div>
          <div className="topbar-right"><span className="authority-chip"><ShieldCheck className="w-3.5 h-3.5"/> Human execution authority</span><button className="mobile-signout" type="button" aria-label="Sign out" title="Sign out" onClick={() => { void handleSignOut(); }}><LogOut className="w-4 h-4"/></button><button className="theme-toggle" onClick={() => setTheme((x) => x === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}</button></div>
        </header>
        <main className="content-canvas">{renderView()}</main>
      </div>
    </div>
  );
}
