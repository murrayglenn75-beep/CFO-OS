import crypto from 'node:crypto';
import type {
  Request,
  Response,
  NextFunction,
} from 'express';

const buckets = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

const WINDOW_MS = 60_000;
const LIMIT = 30;

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < 500) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incomingRequestId =
    req.header('x-request-id');

  const id =
    incomingRequestId &&
    /^[a-zA-Z0-9._-]{8,128}$/.test(
      incomingRequestId,
    )
      ? incomingRequestId
      : crypto.randomUUID();

  res.locals.requestId = id;

  res.setHeader(
    'X-Request-ID',
    id,
  );

  next();
}

export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff',
  );

  res.setHeader(
    'X-Frame-Options',
    'DENY',
  );

  res.setHeader(
    'Referrer-Policy',
    'no-referrer',
  );

  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  res.setHeader(
    'Cross-Origin-Resource-Policy',
    'same-origin',
  );

  res.setHeader(
    'Cross-Origin-Opener-Policy',
    'same-origin',
  );

  if (req.path.startsWith('/api/')) {
    res.setHeader(
      'Cache-Control',
      'no-store, max-age=0',
    );

    res.setHeader(
      'Pragma',
      'no-cache',
    );
  }

  if (
    process.env.NODE_ENV ===
    'production'
  ) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "object-src 'none'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self'",
        "connect-src 'self'",
      ].join('; '),
    );
  }

  next();
}

export function apiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key =
    req.ip ||
    req.socket.remoteAddress ||
    'unknown';

  const now = Date.now();

  cleanupExpiredBuckets(now);

  const current =
    buckets.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    buckets.set(
      key,
      {
        count: 1,
        resetAt:
          now + WINDOW_MS,
      },
    );

    return next();
  }

  current.count += 1;

  if (
    current.count > LIMIT
  ) {
    const retryAfter =
      Math.max(
        1,
        Math.ceil(
          (
            current.resetAt -
            now
          ) / 1000,
        ),
      );

    res.setHeader(
      'Retry-After',
      retryAfter,
    );

    return res
      .status(429)
      .json({
        error:
          'Rate limit exceeded',
        requestId:
          res.locals
            .requestId,
      });
  }

  next();
}

export function requireJson(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    req.method === 'POST' &&
    !req.is(
      'application/json',
    )
  ) {
    return res
      .status(415)
      .json({
        error:
          'Content-Type must be application/json',
        requestId:
          res.locals
            .requestId,
      });
  }

  next();
}

export function validateMessages(
  value: unknown,
):
  | {
      role:
        | 'user'
        | 'assistant';
      content: string;
    }[]
  | null {
  if (
    !Array.isArray(
      value,
    ) ||
    value.length === 0 ||
    value.length > 8
  ) {
    return null;
  }

  const parsed: {
    role:
      | 'user'
      | 'assistant';
    content: string;
  }[] = [];

  for (
    const raw of value
  ) {
    if (
      !raw ||
      typeof raw !==
        'object'
    ) {
      return null;
    }

    const role =
      (raw as any).role;

    const content =
      (raw as any)
        .content;

    if (
      ![
        'user',
        'assistant',
      ].includes(role) ||
      typeof content !==
        'string'
    ) {
      return null;
    }

    const clean =
      content.trim();

    if (
      !clean ||
      clean.length >
        2500
    ) {
      return null;
    }

    parsed.push({
      role,
      content: clean,
    });
  }

  return parsed;
}