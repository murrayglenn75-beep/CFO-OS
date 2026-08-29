import React from 'react';
import { Database, GitMerge, LockKeyhole, Clock3 } from 'lucide-react';
import { TrustEnvelope } from '../../types';
import { TrustBadge } from './TrustBadge';

export const TrustStrip: React.FC<{ trust: TrustEnvelope }> = ({ trust }) => (
  <div className="trust-strip">
    <div className="trust-strip-top">
      <TrustBadge status={trust.status} compact />
      <span className="trust-audit">audit {trust.auditId}</span>
    </div>
    <div className="trust-strip-grid">
      <span><Database className="w-3.5 h-3.5" /> Evidence <b>{trust.evidenceQuality}/100</b></span>
      <span><GitMerge className="w-3.5 h-3.5" /> Agreement <b>{trust.sourceAgreement}%</b></span>
      <span><LockKeyhole className="w-3.5 h-3.5" /> Action <b>{trust.actionStatus.replaceAll('_', ' ')}</b></span>
      <span><Clock3 className="w-3.5 h-3.5" /> Verified <b>{new Date(trust.lastVerified).toLocaleString()}</b></span>
    </div>
    <p>{trust.reason}</p>
    <div className="trust-sources">Sources: {trust.sources.join(' · ')}{trust.unresolvedExceptions ? ` · ${trust.unresolvedExceptions} unresolved exceptions` : ''}</div>
  </div>
);
