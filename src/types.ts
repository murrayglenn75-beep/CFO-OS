export interface FinancialRecord {
  month: string;
  revenue: number;
  cogs: number;
  grossMargin: number;
  payroll: number;
  marketing: number;
  otherOpex: number;
  ebitda: number;
  cash: number;
}

export type ViewType =
  | 'command_center'
  | 'ingestion'
  | 'reconciliation'
  | 'calculation'
  | 'copilot'
  | 'audit_trail'
  | 'variance_explorer'
  | 'roi_impact'
  | 'trust_security';

export interface NavItem {
  id: string;
  view: ViewType;
  label: string;
  icon: string;
}

export interface IngestionSource {
  id: string;
  systemName: string;
  fileName: string;
  rowCount: number;
  lastSync: string;
  status: 'CLEAN' | 'WARNINGS';
  issues?: string[];
  scores: {
    completeness: number;
    consistency: number;
    accuracy: number;
    reconciliation: number;
  };
}

export interface ReconciliationRecord {
  id: string;
  entityName: string;
  status: 'AUTO-MATCHED' | 'NEEDS-REVIEW' | 'UNMATCHED' | 'RESOLVED-SEPARATE';
  method: 'embedding_similarity' | 'fuzzy_match' | 'llm_verification';
  confidence: number;
  variants: {
    system: string;
    name: string;
  }[];
  note: string;
}

export interface DagNode {
  id: string;
  label: string;
  formula: string;
  value: string;
  dependsOn: string[];
  version: string;
  confidence: string;
  type: 'source' | 'intermediate' | 'output';
  rowCount?: string;
}

export type TrustStatus = 'VERIFIED' | 'REVIEW_REQUIRED' | 'AMBIGUOUS' | 'MODEL_ESTIMATE' | 'BLOCKED';
export type ActionStatus = 'READ_ONLY' | 'HUMAN_APPROVAL_REQUIRED' | 'BLOCKED';

export interface TrustEnvelope {
  status: TrustStatus;
  evidenceQuality: number;
  sourceAgreement: number;
  sources: string[];
  unresolvedExceptions: number;
  lastVerified: string;
  actionStatus: ActionStatus;
  reason: string;
  auditId: string;
  injectionRisk?: 'LOW' | 'ELEVATED';
  redactionsApplied?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trust?: TrustEnvelope;
}
