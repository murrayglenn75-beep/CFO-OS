# Security Model

## Security posture

CFO OS assumes that model output can be wrong or manipulated. The model is therefore a **read-only, untrusted analytical caller**, not an authorization service.

## Controls implemented

- model secret stays server-side,
- Express disables framework identification,
- security response headers,
- bounded JSON request size,
- API rate limiting,
- bounded chat history and message length,
- role/content payload validation,
- selected PII-pattern redaction,
- prompt-injection risk signaling,
- no model tool access,
- deterministic Trust Envelope,
- deterministic action-qualification function,
- payment execution remains human-only,
- hash-linked audit event sequence.

## Explicit limitations

This demo does not include production authentication, RLS/tenant isolation, database-backed permissions, hardware-backed secrets, formal verification, full DLP, a WAF, durable audit storage, supply-chain signing or third-party penetration testing.

It does not claim prompt-injection immunity. The goal is to minimize blast radius by ensuring that model text cannot itself become privileged authority.
