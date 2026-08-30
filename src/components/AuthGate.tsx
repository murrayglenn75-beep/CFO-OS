
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import type {
  Session,
} from '@supabase/supabase-js';

import {
  supabase,
} from '../lib/supabase';

import {
  clearActiveOrganizationId,
  getActiveOrganizationId,
  setActiveOrganizationId,
} from '../lib/api';

interface AuthGateProps {
  children: ReactNode;
}

type DatabaseRole =
  | 'owner'
  | 'cfo'
  | 'controller'
  | 'accountant'
  | 'viewer';

interface Membership {
  organization_id: string;
  role: DatabaseRole;
}

interface BootstrapResponse {
  organizationId?: string;
  databaseRole?: DatabaseRole;
  error?: string;
  requestId?: string;
}

function isDatabaseRole(
  value: unknown,
): value is DatabaseRole {
  return [
    'owner',
    'cfo',
    'controller',
    'accountant',
    'viewer',
  ].includes(
    String(value),
  );
}

export function AuthGate({
  children,
}: AuthGateProps) {
  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    tenantLoading,
    setTenantLoading,
  ] = useState(false);

  const [
    memberships,
    setMemberships,
  ] = useState<Membership[]>(
    [],
  );

  const [
    activeOrganizationId,
    setActiveOrganization,
  ] = useState<string | null>(
    null,
  );

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getSession()
      .then(
        ({
          data,
          error,
        }) => {
          if (
            !mounted
          ) {
            return;
          }

          if (
            error
          ) {
            setMessage(
              error.message,
            );
          }

          setSession(
            data.session,
          );
        },
      )
      .finally(() => {
        if (
          mounted
        ) {
          setLoading(
            false,
          );
        }
      });

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            nextSession,
          ) => {
            if (
              !mounted
            ) {
              return;
            }

            setSession(
              nextSession,
            );

            if (
              !nextSession
            ) {
              clearActiveOrganizationId();

              setMemberships(
                [],
              );

              setActiveOrganization(
                null,
              );
            }
          },
        );

    return () => {
      mounted = false;

      subscription
        .unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !session?.user
    ) {
      return;
    }

    let cancelled =
      false;

    async function loadTenant() {
      setTenantLoading(
        true,
      );

      setMessage('');

      try {
        /*
         * Ensure the authenticated user
         * has a matching public profile.
         *
         * Supabase RLS permits only the
         * user to create/update their row.
         */
        const {
          error:
            profileError,
        } =
          await supabase
            .from(
              'profiles',
            )
            .upsert(
              {
                id:
                  session!
                    .user
                    .id,
              },
              {
                onConflict:
                  'id',
              },
            );

        if (
          profileError
        ) {
          throw new Error(
            `Profile bootstrap failed: ${profileError.message}`,
          );
        }

        /*
         * Membership discovery remains
         * RLS-scoped in Supabase.
         */
        const {
          data,
          error:
            membershipError,
        } =
          await supabase
            .from(
              'organization_members',
            )
            .select(
              'organization_id, role',
            )
            .eq(
              'user_id',
              session!
                .user
                .id,
            );

        if (
          membershipError
        ) {
          throw new Error(
            `Organization lookup failed: ${membershipError.message}`,
          );
        }

        if (
          cancelled
        ) {
          return;
        }

        const rows =
          (
            data ??
            []
          ) as Membership[];

        setMemberships(
          rows,
        );

        const storedOrganizationId =
          getActiveOrganizationId();

        const storedMembership =
          rows.find(
            (
              membership,
            ) =>
              membership
                .organization_id ===
              storedOrganizationId,
          );

        const selected =
          storedMembership ??
          rows[0] ??
          null;

        if (
          selected
        ) {
          setActiveOrganizationId(
            selected
              .organization_id,
          );

          setActiveOrganization(
            selected
              .organization_id,
          );
        } else {
          clearActiveOrganizationId();

          setActiveOrganization(
            null,
          );
        }
      } catch (
        error: unknown
      ) {
        if (
          !cancelled
        ) {
          setMessage(
            error instanceof
              Error
              ? error.message
              : 'Unable to initialize CFO OS tenant.',
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setTenantLoading(
            false,
          );
        }
      }
    }

    void loadTenant();

    return () => {
      cancelled = true;
    };
  }, [
    session,
  ]);

  async function signIn(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);
    setMessage('');

    const {
      error,
    } =
      await supabase.auth
        .signInWithPassword({
          email:
            email
              .trim()
              .toLowerCase(),

          password,
        });

    if (
      error
    ) {
      setMessage(
        error.message,
      );
    }

    setBusy(false);
  }

  async function signUp() {
    setBusy(true);
    setMessage('');

    const {
      data,
      error,
    } =
      await supabase.auth
        .signUp({
          email:
            email
              .trim()
              .toLowerCase(),

          password,
        });

    if (
      error
    ) {
      setMessage(
        error.message,
      );
    } else if (
      !data.session
    ) {
      setMessage(
        'Account created. Check your email to confirm it.',
      );
    }

    setBusy(false);
  }

  async function createOrganization() {
    if (
      !session?.user ||
      !session.access_token
    ) {
      setMessage(
        'Your authenticated session is unavailable. Sign in again.',
      );

      return;
    }

    setBusy(true);

    setMessage(
      'Creating secure CFO OS organization…',
    );

    try {
      const response =
        await window.fetch(
          '/api/organizations/bootstrap',
          {
            method:
              'POST',

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                {},
              ),
          },
        );

      const result =
        (
          await response.json()
        ) as BootstrapResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ??
            `Organization bootstrap failed with HTTP ${response.status}.`,
        );
      }

      if (
        !result.organizationId
      ) {
        throw new Error(
          'Organization bootstrap returned no organization ID.',
        );
      }

      if (
        !isDatabaseRole(
          result.databaseRole,
        )
      ) {
        throw new Error(
          'Organization bootstrap returned an invalid database role.',
        );
      }

      const membership:
        Membership = {
          organization_id:
            result.organizationId,

          role:
            result.databaseRole,
        };

      setMemberships([
        membership,
      ]);

      setActiveOrganizationId(
        membership.organization_id,
      );

      setActiveOrganization(
        membership.organization_id,
      );

      setMessage('');
    } catch (
      error: unknown
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create CFO OS organization.',
      );
    } finally {
      setBusy(false);
    }
  }

  function selectOrganization(
    organizationId: string,
  ) {
    const authorized =
      memberships.some(
        (
          membership,
        ) =>
          membership
            .organization_id ===
          organizationId,
      );

    if (
      !authorized
    ) {
      setMessage(
        'That organization is not available to this account.',
      );

      return;
    }

    setActiveOrganizationId(
      organizationId,
    );

    setActiveOrganization(
      organizationId,
    );

    setMessage('');
  }

  async function signOut() {
    clearActiveOrganizationId();

    await supabase.auth
      .signOut();
  }

  if (
    loading
  ) {
    return (
      <div className="auth-shell auth-loading-shell">
        <div className="auth-loading-card" role="status" aria-live="polite">
          <div className="auth-brand-mark" aria-hidden="true">
            <span>CFO</span><b>OS</b>
          </div>
          <span className="auth-spinner" aria-hidden="true" />
          <div>
            <strong>Verifying secure session</strong>
            <p>Establishing identity before finance data is exposed.</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    !session
  ) {
    const accountCreated =
      message.startsWith(
        'Account created.',
      );

    return (
      <div className="auth-shell">
        <div className="auth-stage">
          <section className="auth-story" aria-label="CFO OS product overview">
            <div>
              <div className="auth-brand-row">
                <div className="auth-brand-mark">
                  <span>CFO</span><b>OS</b>
                </div>
                <span className="auth-demo-chip">Synthetic public demo</span>
              </div>

              <span className="auth-eyebrow">Governed finance intelligence</span>
              <h1>Finance truth before AI opinion.</h1>
              <p className="auth-story-copy">
                Deterministic close logic, evidence provenance, reconciliation,
                and governed AI explanation in one auditable operating layer.
              </p>
            </div>

            <div className="auth-feature-grid">
              <div className="auth-feature">
                <span>01</span>
                <b>Deterministic core</b>
                <p>Financial calculations remain outside the language model.</p>
              </div>
              <div className="auth-feature">
                <span>02</span>
                <b>Tenant scoped</b>
                <p>Identity and organization access are resolved before API use.</p>
              </div>
              <div className="auth-feature">
                <span>03</span>
                <b>Human authority</b>
                <p>AI can explain evidence; it cannot approve financial actions.</p>
              </div>
            </div>

            <div className="auth-trust-note">
              <span className="auth-status-dot" />
              <div>
                <b>Security posture</b>
                <p>Authenticated · tenant-aware · read-only AI authority</p>
              </div>
            </div>
          </section>

          <form
            className="auth-card"
            onSubmit={signIn}
            aria-busy={busy}
          >
            <div className="auth-card-heading">
              <span className="auth-eyebrow">Secure workspace</span>
              <h2>Sign in to CFO OS</h2>
              <p>
                Authenticate before accessing tenant-scoped finance data.
              </p>
            </div>

            <div className="auth-field-stack">
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <div className="auth-actions">
              <button
                className="auth-primary"
                type="submit"
                disabled={busy}
              >
                {busy ? 'Signing in…' : 'Sign in'}
                <span aria-hidden="true">→</span>
              </button>

              <button
                className="auth-secondary"
                type="button"
                disabled={busy}
                onClick={() => {
                  void signUp();
                }}
              >
                Create account
              </button>
            </div>

            {message && (
              <p
                className={`auth-message ${accountCreated ? 'success' : ''}`}
                role={accountCreated ? 'status' : 'alert'}
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <div className="auth-card-footer">
              <span className="auth-status-dot" />
              <span>Identity is verified before tenant context is loaded.</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (
    tenantLoading
  ) {
    return (
      <div className="auth-shell auth-loading-shell">
        <div className="auth-loading-card" role="status" aria-live="polite">
          <div className="auth-brand-mark" aria-hidden="true">
            <span>CFO</span><b>OS</b>
          </div>
          <span className="auth-spinner" aria-hidden="true" />
          <div>
            <strong>Loading tenant context</strong>
            <p>Resolving authorized organization membership.</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    memberships.length ===
    0
  ) {
    return (
      <div className="auth-shell auth-centered-shell">
        <section className="auth-single-card">
          <div className="auth-brand-row">
            <div className="auth-brand-mark">
              <span>CFO</span><b>OS</b>
            </div>
            <span className="auth-verified-chip">Identity verified</span>
          </div>

          <span className="auth-eyebrow">Tenant bootstrap</span>
          <h1>Create your CFO OS organization</h1>
          <p>
            Your identity is verified. Create the first tenant before accessing
            finance data. Membership will be established server-side.
          </p>

          <div className="auth-callout">
            <span>Authority boundary</span>
            <b>Organization ownership is derived by the trusted backend.</b>
          </div>

          <div className="auth-actions auth-actions-row">
            <button
              className="auth-primary"
              type="button"
              disabled={busy}
              onClick={() => {
                void createOrganization();
              }}
            >
              {busy
                ? 'Creating organization…'
                : 'Create CFO OS organization'}
              <span aria-hidden="true">→</span>
            </button>

            <button
              className="auth-secondary"
              type="button"
              disabled={busy}
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </button>
          </div>

          {message && (
            <p className="auth-message" role="status" aria-live="polite">
              {message}
            </p>
          )}
        </section>
      </div>
    );
  }

  if (
    !activeOrganizationId
  ) {
    return (
      <div className="auth-shell auth-centered-shell">
        <section className="auth-single-card">
          <div className="auth-brand-row">
            <div className="auth-brand-mark">
              <span>CFO</span><b>OS</b>
            </div>
            <span className="auth-verified-chip">Authenticated</span>
          </div>

          <span className="auth-eyebrow">Organization context</span>
          <h1>Select organization</h1>
          <p>
            Choose an organization already authorized for this account.
          </p>

          <div className="auth-org-list">
            {memberships.map(
              (
                membership,
              ) => (
                <button
                  key={membership.organization_id}
                  type="button"
                  className="auth-org-option"
                  onClick={() =>
                    selectOrganization(
                      membership.organization_id,
                    )
                  }
                >
                  <span>
                    <b>{membership.role}</b>
                    <small>{membership.organization_id}</small>
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              ),
            )}
          </div>

          <button
            className="auth-link-button"
            type="button"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out of this account
          </button>

          {message && (
            <p className="auth-message" role="alert" aria-live="polite">
              {message}
            </p>
          )}
        </section>
      </div>
    );
  }

  return <>{children}</>;
}
