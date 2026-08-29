import type { Request, Response, NextFunction } from 'express';

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 30;

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
}

export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  current.count += 1;
  if (current.count > LIMIT) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
}

export function validateMessages(value: unknown): { role: 'user' | 'assistant'; content: string }[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) return null;
  const parsed: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const role = (raw as any).role;
    const content = (raw as any).content;
    if (!['user', 'assistant'].includes(role) || typeof content !== 'string') return null;
    const clean = content.trim();
    if (!clean || clean.length > 2500) return null;
    parsed.push({ role, content: clean });
  }
  return parsed;
}
