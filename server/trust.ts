import crypto from 'node:crypto';

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
  injectionRisk: 'LOW' | 'ELEVATED';
  redactionsApplied: number;
}

const isoSnapshot = '2026-06-01T05:14:00Z';

export function detectPromptInjection(text: string): 'LOW' | 'ELEVATED' {
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior|system|developer)\s+instructions?/i,
    /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
    /system\s+prompt/i,
    /developer\s+message/i,
    /bypass\s+(policy|controls?|guardrails?)/i,
    /execute\s+(a\s+)?tool/i,
    /exfiltrat(e|ion)/i,
  ];
  return patterns.some((pattern) => pattern.test(text)) ? 'ELEVATED' : 'LOW';
}

export function redactSensitiveInput(text: string): { text: string; count: number } {
  let count = 0;
  let redacted = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
    count += 1;
    return '<redacted-email>';
  });
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, () => {
    count += 1;
    return '<redacted-id>';
  });
  redacted = redacted.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi, () => {
    count += 1;
    return '<redacted-bank-id>';
  });
  return { text: redacted, count };
}

function auditId(input: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0, 16);
}

export function buildTrustEnvelope(question: string, injectionRisk: 'LOW' | 'ELEVATED', redactionsApplied: number): TrustEnvelope {
  const q = question.toLowerCase();
  const isForecast = /(forecast|predict|scenario|projection|q3)/.test(q);
  const isEbitda = /ebitda/.test(q);
  const isRevenue = /revenue|renewal|pipeline/.test(q);
  const isBoard = /board|summary|executive/.test(q);

  let status: TrustStatus = 'VERIFIED';
  let evidenceQuality = 96;
  let sourceAgreement = 94;
  let unresolvedExceptions = 0;
  let actionStatus: ActionStatus = 'READ_ONLY';
  let reason = 'Derived from reconciled synthetic finance records and deterministic calculations.';
  let sources = ['NetSuite', 'Mercury', 'Brex'];

  if (isEbitda || isRevenue || isBoard) {
    status = 'REVIEW_REQUIRED';
    evidenceQuality = 94;
    sourceAgreement = 86;
    unresolvedExceptions = 2;
    actionStatus = 'HUMAN_APPROVAL_REQUIRED';
    reason = 'Core figures reconcile, but two close-cycle exceptions remain unresolved and cannot silently acquire authority.';
    sources = ['NetSuite', 'Salesforce', 'Mercury', 'Brex'];
  }

  if (isForecast) {
    status = 'MODEL_ESTIMATE';
    evidenceQuality = 88;
    sourceAgreement = 82;
    unresolvedExceptions = 2;
    actionStatus = 'HUMAN_APPROVAL_REQUIRED';
    reason = 'Forward-looking output is a model estimate grounded in historical trend data, not a booked financial fact.';
    sources = ['NetSuite', 'Salesforce'];
  }

  if (injectionRisk === 'ELEVATED') {
    status = 'BLOCKED';
    actionStatus = 'BLOCKED';
    reason = 'Potential instruction-conflict pattern detected. The request may be answered only as read-only analysis; no privileged action or hidden instruction disclosure is permitted.';
  }

  const envelope = {
    status,
    evidenceQuality,
    sourceAgreement,
    sources,
    unresolvedExceptions,
    lastVerified: isoSnapshot,
    actionStatus,
    reason,
    injectionRisk,
    redactionsApplied,
  };

  return { ...envelope, auditId: auditId({ question, ...envelope }) };
}

export type DemoRole = 'CFO' | 'CONTROLLER' | 'ACCOUNTANT' | 'VIEWER';

export function qualifyAction(input: {
  role: DemoRole;
  action: 'EXPORT_JOURNAL' | 'APPROVE_RECONCILIATION' | 'SEND_PAYMENT' | 'PUBLISH_BOARD_PACK';
  evidenceQuality: number;
  sourceAgreement: number;
  unresolvedExceptions: number;
}) {
  const { role, action, evidenceQuality, sourceAgreement, unresolvedExceptions } = input;
  if (![evidenceQuality, sourceAgreement, unresolvedExceptions].every(Number.isFinite) ||
      evidenceQuality < 0 || evidenceQuality > 100 || sourceAgreement < 0 || sourceAgreement > 100 ||
      unresolvedExceptions < 0 || !Number.isInteger(unresolvedExceptions)) {
    return { qualified: false, status: 'BLOCKED', reason: 'Invalid or out-of-range policy evidence inputs.' } as const;
  }
  const permissions: Record<DemoRole, string[]> = {
    CFO: ['EXPORT_JOURNAL', 'APPROVE_RECONCILIATION', 'SEND_PAYMENT', 'PUBLISH_BOARD_PACK'],
    CONTROLLER: ['EXPORT_JOURNAL', 'APPROVE_RECONCILIATION', 'PUBLISH_BOARD_PACK'],
    ACCOUNTANT: ['EXPORT_JOURNAL'],
    VIEWER: [],
  };

  if (!permissions[role].includes(action)) {
    return { qualified: false, status: 'BLOCKED', reason: 'Role does not hold the required capability.' } as const;
  }
  if (unresolvedExceptions > 0 && ['SEND_PAYMENT', 'PUBLISH_BOARD_PACK'].includes(action)) {
    return { qualified: false, status: 'BLOCKED', reason: 'Unresolved close exceptions must be cleared before this action.' } as const;
  }
  if (evidenceQuality < 90 || sourceAgreement < 85) {
    return { qualified: false, status: 'REVIEW_REQUIRED', reason: 'Evidence quality or source agreement is below the demo policy floor.' } as const;
  }
  if (action === 'SEND_PAYMENT') {
    return { qualified: false, status: 'HUMAN_APPROVAL_REQUIRED', reason: 'Payment execution is never delegated to the model in this public build.' } as const;
  }
  return { qualified: true, status: 'QUALIFIED', reason: 'Role, evidence, provenance state, and policy checks are satisfied.' } as const;
}
