
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
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',
        }}
      >
        Verifying CFO OS session…
      </div>
    );
  }

  if (
    !session
  ) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          padding:
            24,

          background:
            '#07101f',

          color:
            '#e5edf8',
        }}
      >
        <form
          onSubmit={
            signIn
          }
          style={{
            width:
              'min(420px, 100%)',

            padding:
              28,

            borderRadius:
              16,

            background:
              '#0f172a',

            border:
              '1px solid #334155',
          }}
        >
          <h1>
            CFO OS
          </h1>

          <p>
            Authenticate before accessing
            tenant-scoped finance data.
          </p>

          <input
            type="email"
            required
            placeholder="Email"
            value={
              email
            }
            onChange={(
              event,
            ) =>
              setEmail(
                event
                  .target
                  .value,
              )
            }
            style={{
              width:
                '100%',

              boxSizing:
                'border-box',

              marginBottom:
                12,

              padding:
                12,
            }}
          />

          <input
            type="password"
            required
            minLength={
              8
            }
            placeholder="Password"
            value={
              password
            }
            onChange={(
              event,
            ) =>
              setPassword(
                event
                  .target
                  .value,
              )
            }
            style={{
              width:
                '100%',

              boxSizing:
                'border-box',

              marginBottom:
                12,

              padding:
                12,
            }}
          />

          <button
            type="submit"
            disabled={
              busy
            }
          >
            Sign in
          </button>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={() => {
              void signUp();
            }}
            style={{
              marginLeft:
                10,
            }}
          >
            Create account
          </button>

          {message && (
            <p>
              {
                message
              }
            </p>
          )}
        </form>
      </div>
    );
  }

  if (
    tenantLoading
  ) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          background:
            '#07101f',

          color:
            '#e5edf8',
        }}
      >
        Loading secure tenant context…
      </div>
    );
  }

  if (
    memberships.length ===
    0
  ) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          padding:
            24,

          background:
            '#07101f',

          color:
            '#e5edf8',
        }}
      >
        <div
          style={{
            width:
              'min(520px, 100%)',

            padding:
              28,

            borderRadius:
              16,

            background:
              '#0f172a',

            border:
              '1px solid #334155',
          }}
        >
          <h1>
            Create your CFO OS organization
          </h1>

          <p>
            Your identity is verified. Create
            the first tenant before accessing
            finance data.
          </p>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={() => {
              void createOrganization();
            }}
          >
            {busy
              ? 'Creating…'
              : 'Create CFO OS organization'}
          </button>

          <button
            type="button"
            disabled={
              busy
            }
            onClick={() => {
              void signOut();
            }}
            style={{
              marginLeft:
                10,
            }}
          >
            Sign out
          </button>

          {message && (
            <p>
              {
                message
              }
            </p>
          )}
        </div>
      </div>
    );
  }

  if (
    !activeOrganizationId
  ) {
    return (
      <div
        style={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          padding:
            24,

          background:
            '#07101f',

          color:
            '#e5edf8',
        }}
      >
        <div>
          <h1>
            Select organization
          </h1>

          {memberships.map(
            (
              membership,
            ) => (
              <button
                key={
                  membership
                    .organization_id
                }
                type="button"
                onClick={() =>
                  selectOrganization(
                    membership
                      .organization_id,
                  )
                }
              >
                {
                  membership.role
                }{' '}
                —{' '}
                {
                  membership
                    .organization_id
                }
              </button>
            ),
          )}

          {message && (
            <p>
              {
                message
              }
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      <button
        type="button"
        onClick={() => {
          void signOut();
        }}
        style={{
          position:
            'fixed',

          right:
            18,

          bottom:
            18,

          zIndex:
            1000,
        }}
      >
        Sign out
      </button>
    </>
  );
}