import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AuthenticationError,
  authenticateRequest,
  resolveTenantContext,
  type AuthenticatedIdentity,
} from '../server/auth';

type Membership = {
  organization_id: string;
  role: string;
};

function fakeRequest(authorization?: string) {
  return {
    get(name: string) {
      return name.toLowerCase() === 'authorization'
        ? authorization
        : undefined;
    },
  } as never;
}

function fakeIdentity(
  memberships: Membership[],
  options?: { error?: boolean; userId?: string },
): AuthenticatedIdentity {
  const userId = options?.userId ?? 'user-123';
  const filters = new Map<string, unknown>();

  const query = {
    select() {
      return this;
    },

    eq(column: string, value: unknown) {
      filters.set(column, value);
      return this;
    },

    async limit(count: number) {
      if (options?.error) {
        return {
          data: null,
          error: { message: 'synthetic query failure' },
        };
      }

      const rows = memberships
        .filter((membership) => {
          const requestedUser = filters.get('user_id');
          const requestedOrganization = filters.get('organization_id');

          if (requestedUser && requestedUser !== userId) {
            return false;
          }

          if (
            requestedOrganization &&
            membership.organization_id !== requestedOrganization
          ) {
            return false;
          }

          return true;
        })
        .slice(0, count);

      return {
        data: rows,
        error: null,
      };
    },
  };

  const supabase = {
    from(table: string) {
      assert.equal(table, 'organization_members');
      return query;
    },
  };

  return {
    token: 'synthetic-token',
    user: { id: userId },
    supabase,
  } as unknown as AuthenticatedIdentity;
}

async function assertAuthFailure(
  work: () => Promise<unknown>,
  status: number,
  message: RegExp,
) {
  await assert.rejects(
    work,
    (error: unknown) => {
      assert.ok(error instanceof AuthenticationError);
      assert.equal(error.status, status);
      assert.match(error.message, message);
      return true;
    },
  );
}

test(
  'missing bearer token fails closed before Supabase access',
  async () => {
    await assertAuthFailure(
      () => authenticateRequest(fakeRequest()),
      401,
      /Missing or invalid Authorization bearer token/,
    );
  },
);

test(
  'malformed bearer token fails closed before Supabase access',
  async () => {
    await assertAuthFailure(
      () => authenticateRequest(fakeRequest('Basic synthetic')),
      401,
      /Missing or invalid Authorization bearer token/,
    );
  },
);

test(
  'owner membership resolves to CFO application authority',
  async () => {
    const tenant = await resolveTenantContext(
      fakeIdentity([
        {
          organization_id: 'org-owner',
          role: 'owner',
        },
      ]),
      'org-owner',
    );

    assert.deepEqual(tenant, {
      organizationId: 'org-owner',
      databaseRole: 'owner',
      applicationRole: 'CFO',
    });
  },
);

test(
  'viewer membership remains VIEWER authority',
  async () => {
    const tenant = await resolveTenantContext(
      fakeIdentity([
        {
          organization_id: 'org-viewer',
          role: 'viewer',
        },
      ]),
      'org-viewer',
    );

    assert.equal(tenant.databaseRole, 'viewer');
    assert.equal(tenant.applicationRole, 'VIEWER');
  },
);

test(
  'cross-tenant selector is denied when membership is absent',
  async () => {
    const identity = fakeIdentity([
      {
        organization_id: 'org-authorized',
        role: 'owner',
      },
    ]);

    await assertAuthFailure(
      () => resolveTenantContext(identity, 'org-unauthorized'),
      403,
      /no authorized organization membership/,
    );
  },
);

test(
  'multiple memberships require explicit tenant selection',
  async () => {
    const identity = fakeIdentity([
      {
        organization_id: 'org-a',
        role: 'owner',
      },
      {
        organization_id: 'org-b',
        role: 'viewer',
      },
    ]);

    await assertAuthFailure(
      () => resolveTenantContext(identity),
      409,
      /must be selected explicitly/,
    );
  },
);

test(
  'membership lookup errors fail closed',
  async () => {
    const identity = fakeIdentity([], { error: true });

    await assertAuthFailure(
      () => resolveTenantContext(identity, 'org-a'),
      403,
      /Unable to resolve organization membership/,
    );
  },
);

test(
  'invalid database role is rejected',
  async () => {
    const identity = fakeIdentity([
      {
        organization_id: 'org-a',
        role: 'administrator',
      },
    ]);

    await assertAuthFailure(
      () => resolveTenantContext(identity, 'org-a'),
      403,
      /Organization membership is invalid/,
    );
  },
);
