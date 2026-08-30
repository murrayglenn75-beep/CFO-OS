import React, {
  useState,
} from 'react';

import {
  ShieldCheck,
  Database,
  BrainCircuit,
  LockKeyhole,
  Fingerprint,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  FileLock2,
  Activity,
  ArrowRight,
  TestTube2,
  UserCheck,
} from 'lucide-react';

import {
  apiFetch,
} from '../lib/api';

const layers = [
  {
    icon: Database,
    title:
      'Deterministic finance core',
    text:
      'Booked metrics and close logic are computed outside the LLM. Model prose cannot change ledger truth.',
  },
  {
    icon: BrainCircuit,
    title:
      'Untrusted AI boundary',
    text:
      'LLM output is treated as a proposal. Evidence, provenance, contradiction and ambiguity are evaluated separately.',
  },
  {
    icon: Fingerprint,
    title:
      'Evidence + provenance',
    text:
      'Every executive claim can expose supporting systems, source agreement, verification time and unresolved exceptions.',
  },
  {
    icon: LockKeyhole,
    title:
      'Action qualification',
    text:
      'A resolved belief does not grant execution authority. Authenticated tenant role, evidence state, policy and current close state are checked again.',
  },
];

const tests = [
  [
    'Indirect prompt injection in uploaded memo',
    'Contained',
    'Untrusted text cannot directly construct authority or execute tools.',
  ],
  [
    'PII in copilot prompt',
    'Redacted',
    'Email / ID / bank-pattern redaction is applied before model context.',
  ],
  [
    'Viewer attempts journal export',
    'Blocked',
    'Capability is denied by server-side role policy before any model decision.',
  ],
  [
    'Payment request with open reconciliation issues',
    'Blocked',
    'Consequential action remains human-controlled while exceptions are unresolved.',
  ],
];

interface PolicyResult {
  qualified?: boolean;
  status?: string;
  reason?: string;
  role?: string;
  error?: string;
}

export const TrustSecurity:
  React.FC = () => {
    const [
      result,
      setResult,
    ] =
      useState<
        PolicyResult | null
      >(null);

    const [
      checking,
      setChecking,
    ] =
      useState(false);

    const simulate =
      async () => {
        setChecking(true);
        setResult(null);

        try {
          const response =
            await apiFetch(
              '/api/actions/qualify',
              {
                method:
                  'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body:
                  JSON.stringify({
                    action:
                      'PUBLISH_BOARD_PACK',

                    evidenceQuality:
                      94,

                    sourceAgreement:
                      86,

                    unresolvedExceptions:
                      2,
                  }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            setResult({
              error:
                data.error ||
                `Policy API returned ${response.status}`,
            });

            return;
          }

          setResult(
            data,
          );
        } catch (
          error: unknown
        ) {
          setResult({
            error:
              error instanceof
              Error
                ? error.message
                : 'Unable to run policy check.',
          });
        } finally {
          setChecking(
            false,
          );
        }
      };

    return (
      <div className="page-shell animate-fade-in">
        <section className="page-heading">
          <div>
            <span className="eyebrow">
              09 — TRUST &
              SECURITY
            </span>

            <h1>
              Finance AI with a
              hard authority
              boundary.
            </h1>

            <p>
              CFO OS keeps
              deterministic
              financial truth
              separate from model
              reasoning, and model
              reasoning separate
              from action
              authority.
            </p>
          </div>

          <div className="security-posture">
            <ShieldCheck className="w-4 h-4" />

            <span>
              PUBLIC DEMO POSTURE
            </span>

            <b>
              Fail closed
            </b>
          </div>
        </section>

        <section className="security-hero-grid">
          {layers.map(
            ({
              icon: Icon,
              title,
              text,
            }) => (
              <article
                className="security-layer"
                key={
                  title
                }
              >
                <div className="security-icon">
                  <Icon className="w-5 h-5" />
                </div>

                <h3>
                  {title}
                </h3>

                <p>
                  {text}
                </p>
              </article>
            ),
          )}
        </section>

        <section className="two-col-grid">
          <article className="panel-card">
            <div className="panel-title-row">
              <div>
                <span className="eyebrow">
                  CONTROL PATH
                </span>

                <h2>
                  Authority
                  qualification
                </h2>
              </div>

              <FileLock2 className="w-5 h-5 text-brass" />
            </div>

            <div className="authority-flow">
              {[
                'Intent',
                'Evidence',
                'Provenance',
                'Tenant Role',
                'Close State',
                'Human Approval',
              ].map(
                (
                  item,
                  index,
                ) => (
                  <React.Fragment
                    key={
                      item
                    }
                  >
                    <span className="authority-node">
                      {
                        item
                      }
                    </span>

                    {index <
                      5 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate" />
                    )}
                  </React.Fragment>
                ),
              )}
            </div>

            <div className="policy-simulator">
              <label>
                Simulate
                publishing the
                board pack
              </label>

              <div className="read-only-pill">
                <UserCheck className="w-4 h-4" />

                Role resolved
                server-side
              </div>

              <button
                type="button"
                disabled={
                  checking
                }
                onClick={() => {
                  void simulate();
                }}
              >
                <TestTube2 className="w-4 h-4" />

                {checking
                  ? 'Checking…'
                  : 'Run policy check'}
              </button>
            </div>

            {result?.error && (
              <div className="policy-result fail">
                <XCircle className="w-4 h-4" />

                <div>
                  <b>
                    POLICY CHECK
                    FAILED
                  </b>

                  <span>
                    {
                      result.error
                    }
                  </span>
                </div>
              </div>
            )}

            {result &&
              !result.error && (
                <div
                  className={`policy-result ${
                    result.qualified
                      ? 'pass'
                      : 'fail'
                  }`}
                >
                  {result.qualified ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}

                  <div>
                    <b>
                      {result.status ||
                        'POLICY RESULT'}
                    </b>

                    <span>
                      {result.reason ||
                        'No reason returned.'}
                    </span>

                    {result.role && (
                      <small>
                        Database role:{' '}
                        {
                          result.role
                        }
                      </small>
                    )}
                  </div>
                </div>
              )}
          </article>

          <article className="panel-card">
            <div className="panel-title-row">
              <div>
                <span className="eyebrow">
                  ADVERSARIAL
                  CHECKS
                </span>

                <h2>
                  What the public
                  build
                  demonstrates
                </h2>
              </div>

              <Activity className="w-5 h-5 text-brass" />
            </div>

            <div className="security-test-list">
              {tests.map(
                ([
                  name,
                  status,
                  detail,
                ]) => (
                  <div
                    className="security-test"
                    key={
                      name
                    }
                  >
                    <div className="test-status">
                      <CheckCircle2 className="w-4 h-4" />

                      <span>
                        {
                          status
                        }
                      </span>
                    </div>

                    <div>
                      <b>
                        {
                          name
                        }
                      </b>

                      <p>
                        {
                          detail
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </article>
        </section>

        <section className="security-disclosure">
          <TriangleAlert className="w-5 h-5" />

          <div>
            <b>
              Security disclosure
              boundary
            </b>

            <p>
              This showcase
              demonstrates
              architecture,
              deterministic
              guardrails,
              authenticated
              identity and
              tenant-aware
              authorization. It
              does not claim formal
              verification,
              prompt-injection
              immunity, full
              enterprise
              production
              readiness, or a
              complete
              implementation of
              the private Brain AI
              research
              architecture.
            </p>
          </div>
        </section>
      </div>
    );
  };