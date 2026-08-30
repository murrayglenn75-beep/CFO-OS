
import {
  supabase,
} from './supabase';

export const ACTIVE_ORGANIZATION_KEY =
  'cfo-os-active-organization-id';

export function setActiveOrganizationId(
  organizationId: string,
) {
  window.localStorage.setItem(
    ACTIVE_ORGANIZATION_KEY,
    organizationId,
  );
}

export function getActiveOrganizationId() {
  return window.localStorage.getItem(
    ACTIVE_ORGANIZATION_KEY,
  );
}

export function clearActiveOrganizationId() {
  window.localStorage.removeItem(
    ACTIVE_ORGANIZATION_KEY,
  );
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: {
      session,
    },
    error,
  } =
    await supabase.auth
      .getSession();

  if (error) {
    throw new Error(
      `Unable to read authentication session: ${error.message}`,
    );
  }

  if (
    !session
      ?.access_token
  ) {
    throw new Error(
      'Authentication required. Sign in again.',
    );
  }

  const headers =
    new Headers(
      init.headers,
    );

  headers.set(
    'Authorization',
    `Bearer ${session.access_token}`,
  );

  const organizationId =
    getActiveOrganizationId();

  if (
    organizationId
  ) {
    headers.set(
      'X-Organization-ID',
      organizationId,
    );
  }

  return fetch(
    input,
    {
      ...init,
      headers,
    },
  );
}