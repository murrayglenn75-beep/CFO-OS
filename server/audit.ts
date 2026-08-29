import crypto from 'node:crypto';

export interface AuditEvent {
  id: string;
  at: string;
  type: string;
  actor: string;
  outcome: string;
  previousHash: string;
  hash: string;
}

const events: AuditEvent[] = [];

export function appendAuditEvent(type: string, actor: string, outcome: string): AuditEvent {
  const previousHash = events.at(-1)?.hash ?? 'GENESIS';
  const at = new Date().toISOString();
  const payload = { at, type, actor, outcome, previousHash };
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const event = { id: hash.slice(0, 12), ...payload, hash };
  events.push(event);
  if (events.length > 100) events.shift();
  return event;
}

export function getAuditEvents() {
  return [...events].reverse();
}
