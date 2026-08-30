import type {
  Express,
  NextFunction,
  Request,
  Response,
} from 'express';

import {
  AuthenticationError,
  authenticateRequest,
  resolveTenantContext,
} from './auth';

import {
  bootstrapOrganization,
} from './tenant';

function sendAuthError(
  error: unknown,
  res: Response,
) {
  if (
    error instanceof
    AuthenticationError
  ) {
    return res
      .status(
        error.status,
      )
      .json({
        error:
          error.message,

        requestId:
          res.locals
            .requestId,
      });
  }

  console.error(
    'Identity boundary failure',
    {
      requestId:
        res.locals
          .requestId,

      errorType:
        error instanceof
          Error
          ? error.name
          : 'UnknownError',
    },
  );

  return res
    .status(500)
    .json({
      error:
        'Identity security boundary failed closed.',

      requestId:
        res.locals
          .requestId,
    });
}

async function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    /*
     * -----------------------------------------------------
     * VERIFIED IDENTITY
     * -----------------------------------------------------
     *
     * The access token is verified against
     * Supabase before any tenant authority
     * is resolved.
     */

    const identity =
      await authenticateRequest(
        req,
      );

    /*
     * -----------------------------------------------------
     * TENANT SELECTION
     * -----------------------------------------------------
     *
     * X-Organization-ID is only a selector.
     * It grants no authority by itself.
     *
     * resolveTenantContext() verifies that
     * the authenticated user actually holds
     * membership in the selected tenant.
     */

    const requestedOrganizationId =
      req
        .get(
          'x-organization-id',
        )
        ?.trim() ||
      undefined;

    const tenant =
      await resolveTenantContext(
        identity,
        requestedOrganizationId,
      );

    /*
     * Downstream routes receive verified
     * identity and tenant context through
     * server-controlled response locals.
     *
     * No authorization role is accepted
     * from the request body here.
     */

    res.locals.identity =
      identity;

    res.locals.tenant =
      tenant;

    next();
  } catch (
    error: unknown
  ) {
    sendAuthError(
      error,
      res,
    );
  }
}

export function registerIdentitySecurity(
  app: Express,
) {
  /*
   * -----------------------------------------------------
   * FIRST-TENANT BOOTSTRAP
   * -----------------------------------------------------
   *
   * Requires a valid Supabase identity,
   * but does not require an existing tenant
   * because this route creates the first one.
   */

  app.post(
    '/api/organizations/bootstrap',

    async (
      req,
      res,
    ) => {
      try {
        const identity =
          await authenticateRequest(
            req,
          );

        const membership =
          await bootstrapOrganization(
            identity,
          );

        return res.json({
          organizationId:
            membership
              .organizationId,

          databaseRole:
            membership
              .databaseRole,

          requestId:
            res.locals
              .requestId,
        });
      } catch (
        error: unknown
      ) {
        return sendAuthError(
          error,
          res,
        );
      }
    },
  );

  /*
   * -----------------------------------------------------
   * AUTHENTICATED + TENANT-SCOPED API BOUNDARY
   * -----------------------------------------------------
   *
   * Every route below requires:
   *
   * 1. Valid Supabase JWT
   * 2. Valid organization membership
   * 3. Server-resolved tenant role
   */

  app.use(
    [
      '/api/audit',
      '/api/copilot/chat',
      '/api/actions/qualify',
    ],

    (
      req,
      res,
      next,
    ) => {
      void requireTenant(
        req,
        res,
        next,
      );
    },
  );
}