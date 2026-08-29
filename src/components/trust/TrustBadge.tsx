import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Sparkles } from 'lucide-react';
import { TrustStatus } from '../../types';

export const TrustBadge: React.FC<{ status: TrustStatus; compact?: boolean }> = ({ status, compact }) => {
  const map = {
    VERIFIED: { label: 'Verified', cls: 'trust-good', Icon: ShieldCheck },
    REVIEW_REQUIRED: { label: 'Review required', cls: 'trust-warn', Icon: ShieldAlert },
    AMBIGUOUS: { label: 'Ambiguous', cls: 'trust-warn', Icon: ShieldAlert },
    MODEL_ESTIMATE: { label: 'Model estimate', cls: 'trust-model', Icon: Sparkles },
    BLOCKED: { label: 'Blocked', cls: 'trust-bad', Icon: ShieldX },
  }[status];
  const Icon = map.Icon;
  return (
    <span className={`trust-badge ${map.cls} ${compact ? 'trust-compact' : ''}`}>
      <Icon className="w-3.5 h-3.5" /> {map.label}
    </span>
  );
};
