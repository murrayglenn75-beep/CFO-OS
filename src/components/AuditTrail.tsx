import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  CornerDownRight,
  History,
  Link2,
  ShieldCheck,
} from 'lucide-react';

import {
  apiFetch,
} from '../lib/api';

import {
  TrustBadge,
} from './trust/TrustBadge';

interface RuntimeEvent {
  id: string;
  at: string;
  type: string;
  actor: string;
  outcome: string;
  previousHash: string;
  hash: string;
}

const metrics = [
  {
    name: 'Revenue',
    value: '$1,862,000',
    formula:
      'SUM(recognized invoice lines)',
    sources:
      'NetSuite + Salesforce',
    evidence: '94/100',
    status:
      'REVIEW_REQUIRED' as const,
    lineage: [
      'ERP invoice lines',
      'recognition rules',
      'reconciled revenue',
      '$1.862M',
    ],
  },
  {
    name: 'Gross margin',
    value: '61.6%',
    formula:
      '(revenue − COGS) / revenue',
    sources: 'NetSuite',
    evidence: '99/100',
    status:
      'VERIFIED' as const,
    lineage: [
      'ERP ledger',
      'COGS mapping',
      'gross profit',
      '61.6%',
    ],
  },
  {
    name: 'EBITDA',
    value: '−$137,008',
    formula:
      'gross profit − payroll − marketing − other OpEx',
    sources:
      'NetSuite + Gusto + Brex',
    evidence: '94/100',
    status:
      'REVIEW_REQUIRED' as const,
    lineage: [
      'reconciled P&L',
      'OpEx allocation',
      'EBITDA graph',
      '−$137K',
    ],
  },
  {
    name: 'Cash',
    value: '$3,544,000',
    formula:
      'bank-verified ending balance',
    sources: 'Mercury',
    evidence: '100/100',
    status:
      'VERIFIED' as const,
    lineage: [
      'bank feed',
      'cash reconciliation',
      'treasury view',
      '$3.544M',
    ],
  },
];

export const AuditTrail: React.FC = () => {
  const [
    events,
    setEvents,
  ] =
    useState<
      RuntimeEvent[]
    >([]);

  useEffect(() => {
    let cancelled =
      false;

    async function loadAudit() {
      try {
        const response =
          await apiFetch(
            '/api/audit',
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Audit API returned ${response.status}`,
          );
        }

        const data =
          await response.json();

        if (
          !cancelled
        ) {
          setEvents(
            Array.isArray(
              data.events,
            )
              ? data.events
              : [],
          );
        }
      } catch {
        if (
          !cancelled
        ) {
          setEvents([]);
        }
      }
    }

    void loadAudit();

    return () => {
      cancelled =
        true;
    };
  }, []);

  return (
    <div className="page-shell animate-fade-in">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            07 — AUDIT & LINEAGE
          </span>

          <h1>
            Every claim should
            have a path back to
            evidence.
          </h1>

          <p>
            Financial lineage and
            runtime policy
            decisions are visible
            separately, so an AI
            explanation never
            becomes an
            untraceable source of
            truth.
          </p>
        </div>

        <div className="read-only-pill">
          <ShieldCheck className="w-4 h-4" />
          Hash-linked runtime
          events
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-title-row">
          <div>
            <span className="eyebrow">
              FINANCIAL LINEAGE
            </span>

            <h2>
              Active metric
              evidence
            </h2>
          </div>

          <Link2 className="w-5 h-5 text-brass" />
        </div>

        <div className="audit-metric-list">
          {metrics.map(
            (
              metric,
            ) => (
              <article
                className="audit-metric"
                key={
                  metric.name
                }
              >
                <div className="audit-metric-head">
                  <div>
                    <span>
                      {
                        metric.name
                      }
                    </span>

                    <strong>
                      {
                        metric.value
                      }
                    </strong>
                  </div>

                  <TrustBadge
                    status={
                      metric.status
                    }
                    compact
                  />
                </div>

                <p>
                  {
                    metric.formula
                  }
                </p>

                <small>
                  {
                    metric.sources
                  }{' '}
                  · evidence{' '}
                  {
                    metric.evidence
                  }
                </small>

                <div className="audit-lineage">
                  {metric.lineage.map(
                    (
                      item,
                      index,
                    ) => (
                      <React.Fragment
                        key={
                          item
                        }
                      >
                        <span>
                          {
                            item
                          }
                        </span>

                        {index <
                          metric
                            .lineage
                            .length -
                            1 && (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </React.Fragment>
                    ),
                  )}
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-title-row">
          <div>
            <span className="eyebrow">
              RUNTIME CONTROL LOG
            </span>

            <h2>
              AI + policy events
              from this session
            </h2>
          </div>

          <History className="w-5 h-5 text-brass" />
        </div>

        {events.length ===
        0 ? (
          <div className="empty-audit">
            <CornerDownRight className="w-4 h-4" />

            <span>
              Ask the Copilot or
              run an action
              qualification check
              to generate session
              audit events.
            </span>
          </div>
        ) : (
          <div className="runtime-events">
            {events.map(
              (
                event,
              ) => (
                <div
                  className="runtime-event"
                  key={
                    event.id
                  }
                >
                  <span className="audit-dot" />

                  <div>
                    <b>
                      {
                        event.type
                      }
                    </b>

                    <p>
                      {
                        event.outcome
                      }
                    </p>

                    <small>
                      {new Date(
                        event.at,
                      ).toLocaleString()}{' '}
                      · actor{' '}
                      {
                        event.actor
                      }
                    </small>
                  </div>

                  <code>
                    {
                      event.id
                    }
                  </code>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
};