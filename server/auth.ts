import type {
  Request,
} from 'express';

import {
  createClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js';

export type DatabaseRole =
  | 'owner'
  | 'cfo'
  | 'controller'
  | 'accountant'
  | 'viewer';

export type ApplicationRole =
  | 'CFO'
  | 'CONTROLLER'
  | 'ACCOUNTANT'
  | 'VIEWER';

export interface AuthenticatedIdentity {
  token: string;
  user: User;
  supabase: SupabaseClient;
}

export interface TenantContext {
  organizationId: string;
  databaseRole: DatabaseRole;
  applicationRole: ApplicationRole;
}

export class AuthenticationError extends Error {
  status: number;

  constructor(
    message: string,
    status = 401,
  ) {
    super(message);

    this.name =
      'AuthenticationError';

    this.status =
      status;
  }
}

function getSupabaseConfig() {
  const url =
    process.env
      .SUPABASE_URL
      ?.trim();

  const publishableKey =
    process.env
      .SUPABASE_PUBLISHABLE_KEY
      ?.trim();

  if (!url) {
    throw new Error(
      'SUPABASE_URL is not configured.',
    );
  }

  if (!publishableKey) {
    throw new Error(
      'SUPABASE_PUBLISHABLE_KEY is not configured.',
    );
  }

  return {
    url,
    publishableKey,
  };
}

function createAuthClient() {
  const {
    url,
    publishableKey,
  } =
    getSupabaseConfig();

  return createClient(
    url,
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

function createUserClient(
  token: string,
) {
  const {
    url,
    publishableKey,
  } =
    getSupabaseConfig();

  return createClient(
    url,
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },

      global: {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    },
  );
}

function extractBearerToken(
  req: Request,
) {
  const authorization =
    req.get(
      'authorization',
    );

  if (!authorization) {
    return null;
  }

  const match =
    authorization.match(
      /^Bearer\s+([^\s]+)$/i,
    );

  if (!match) {
    return null;
  }

  return match[1];
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

function mapApplicationRole(
  role: DatabaseRole,
): ApplicationRole {
  switch (role) {
    case 'owner':
    case 'cfo':
      return 'CFO';

    case 'controller':
      return 'CONTROLLER';

    case 'accountant':
      return 'ACCOUNTANT';

    case 'viewer':
      return 'VIEWER';
  }
}

export async function authenticateRequest(
  req: Request,
): Promise<AuthenticatedIdentity> {
  const token =
    extractBearerToken(
      req,
    );

  if (!token) {
    throw new AuthenticationError(
      'Missing or invalid Authorization bearer token.',
      401,
    );
  }

  const authClient =
    createAuthClient();

  const {
    data,
    error,
  } =
    await authClient.auth
      .getUser(
        token,
      );

  if (
    error ||
    !data.user
  ) {
    throw new AuthenticationError(
      'Supabase access token is invalid or expired.',
      401,
    );
  }

  return {
    token,
    user:
      data.user,
    supabase:
      createUserClient(
        token,
      ),
  };
}

export async function resolveTenantContext(
  identity: AuthenticatedIdentity,
  requestedOrganizationId?: string,
): Promise<TenantContext> {
  let query =
    identity.supabase
      .from(
        'organization_members',
      )
      .select(
        'organization_id, role',
      )
      .eq(
        'user_id',
        identity.user.id,
      );

  if (
    requestedOrganizationId
  ) {
    query =
      query.eq(
        'organization_id',
        requestedOrganizationId,
      );
  }

  const {
    data,
    error,
  } =
    await query.limit(
      2,
    );

  if (error) {
    throw new AuthenticationError(
      'Unable to resolve organization membership.',
      403,
    );
  }

  if (
    !data ||
    data.length === 0
  ) {
    throw new AuthenticationError(
      'Authenticated user has no authorized organization membership.',
      403,
    );
  }

  if (
    !requestedOrganizationId &&
    data.length > 1
  ) {
    throw new AuthenticationError(
      'Multiple organizations are available. An organization must be selected explicitly.',
      409,
    );
  }

  const membership =
    data[0];

  if (
    !membership
      .organization_id ||
    !isDatabaseRole(
      membership.role,
    )
  ) {
    throw new AuthenticationError(
      'Organization membership is invalid.',
      403,
    );
  }

  return {
    organizationId:
      membership
        .organization_id,

    databaseRole:
      membership.role,

    applicationRole:
      mapApplicationRole(
        membership.role,
      ),
  };
}