import {
  randomUUID,
} from 'node:crypto';

import type {
  AuthenticatedIdentity,
  DatabaseRole,
} from './auth';

export interface OrganizationMembership {
  organizationId: string;
  databaseRole: DatabaseRole;
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

export async function bootstrapOrganization(
  identity: AuthenticatedIdentity,
): Promise<OrganizationMembership> {
  /*
   * -------------------------------------------------------
   * EXISTING MEMBERSHIP CHECK
   * -------------------------------------------------------
   *
   * This query uses the authenticated
   * user's JWT and remains RLS-protected.
   */

  const {
    data: existing,
    error: existingError,
  } =
    await identity.supabase
      .from(
        'organization_members',
      )
      .select(
        'organization_id, role',
      )
      .eq(
        'user_id',
        identity.user.id,
      )
      .limit(
        1,
      );

  if (
    existingError
  ) {
    throw new Error(
      `Unable to check organization membership: ${existingError.message}`,
    );
  }

  const existingMembership =
    existing?.[0];

  if (
    existingMembership
  ) {
    if (
      !existingMembership
        .organization_id ||
      !isDatabaseRole(
        existingMembership
          .role,
      )
    ) {
      throw new Error(
        'Existing organization membership is invalid.',
      );
    }

    return {
      organizationId:
        existingMembership
          .organization_id,

      databaseRole:
        existingMembership
          .role,
    };
  }

  /*
   * -------------------------------------------------------
   * FIRST TENANT CREATION
   * -------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Do not chain .select() onto this INSERT.
   *
   * The organizations SELECT policy requires
   * organization membership. During the INSERT
   * response lifecycle that membership may not
   * yet be visible to the RETURNING/SELECT policy.
   *
   * We therefore generate the UUID server-side,
   * perform the RLS-protected INSERT without
   * RETURNING, and verify the owner membership
   * afterward.
   */

  const organizationId =
    randomUUID();

  const {
    error:
      organizationError,
  } =
    await identity.supabase
      .from(
        'organizations',
      )
      .insert({
        id:
          organizationId,

        name:
          'CFO OS Demo Organization',

        created_by:
          identity.user.id,
      });

  if (
    organizationError
  ) {
    throw new Error(
      `Organization creation failed: ${organizationError.message}`,
    );
  }

  /*
   * -------------------------------------------------------
   * VERIFY OWNER BOOTSTRAP
   * -------------------------------------------------------
   *
   * The database AFTER INSERT trigger creates
   * the authenticated user as organization owner.
   *
   * We then verify that membership through RLS.
   */

  const {
    data:
      membership,
    error:
      membershipError,
  } =
    await identity.supabase
      .from(
        'organization_members',
      )
      .select(
        'organization_id, role',
      )
      .eq(
        'organization_id',
        organizationId,
      )
      .eq(
        'user_id',
        identity.user.id,
      )
      .single();

  if (
    membershipError
  ) {
    throw new Error(
      `Owner membership verification failed: ${membershipError.message}`,
    );
  }

  if (
    !membership
      ?.organization_id ||
    !isDatabaseRole(
      membership.role,
    )
  ) {
    throw new Error(
      'Owner membership was not created correctly.',
    );
  }

  if (
    membership
      .organization_id !==
    organizationId
  ) {
    throw new Error(
      'Owner membership organization mismatch.',
    );
  }

  return {
    organizationId:
      membership
        .organization_id,

    databaseRole:
      membership.role,
  };
}