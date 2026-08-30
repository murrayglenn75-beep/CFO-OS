# CFO OS Security Model — v2.1

## Security posture

CFO OS treats the language model as an **untrusted, read-only analytical component**.

Model output is not financial truth, authentication state, tenant membership, policy state, or execution authority.

> **A model may propose or explain. Deterministic controls outside the model decide what is trusted and what is allowed.**

This repository is a public synthetic portfolio implementation. It demonstrates security architecture and defensive controls; it is not presented as production certification or formal proof of security.

## Identity and authentication

Protected API routes require a valid Supabase access token. The server verifies the token before tenant authority is resolved. Missing or malformed bearer credentials fail closed.

No client-provided role is trusted as authorization evidence.

## Tenant membership

After identity verification, the server resolves organization membership from the database.

`X-Organization-ID` is only a requested tenant selector. The server verifies membership before resolving a role.

If a user has multiple organizations and no selector is provided, explicit tenant selection is required rather than guessed.

Unknown organizations, invalid roles, and membership lookup failures fail closed.

## Role mapping

Database roles are `owner`, `cfo`, `controller`, `accountant`, and `viewer`.

Application roles are derived server-side from those database roles.

## Row Level Security

v2.1 uses PostgreSQL Row Level Security for tenant-aware application data, together with least-privilege grants.

The public application path does not rely on a Supabase service-role credential to bypass RLS.

RLS is a database enforcement layer in addition to the Express tenant boundary.

## Model authority

The AI Copilot is read-only and has no tool bindings.

Provider failure does not grant additional authority. Payment execution is never delegated to the model in this public build.

## Prompt-injection containment

CFO OS does not claim prompt-injection immunity.

The application inspects the full conversation for common instruction-conflict, prompt-extraction, execution-authority, and security-bypass patterns. Elevated risk fails closed before external-provider execution.

## Sensitive-data protection

Selected sensitive patterns are redacted before provider egress. Redaction is followed by outbound inspection and a final fail-closed egress inspection immediately before external-model execution.

This is defense-in-depth demonstration logic, not an enterprise DLP replacement.

## Deterministic action authority

Consequential action qualification is outside the model.

The server supplies the authorization role from verified tenant membership. The client cannot override it.

`SEND_PAYMENT` remains human-approval-required even with otherwise perfect evidence inputs.

## Audit

Runtime audit events are user- and tenant-associated and hash-linked in memory.

This demonstrates tamper-evident sequencing concepts but is **not durable database-backed audit storage**.

## Validation

The v2.1 deterministic regression suite contains 24 tests: 16 governed-AI/trust tests and 8 identity/tenant tests.

The identity/tenant tests cover missing and malformed authentication, role mapping, cross-tenant denial, explicit multi-tenant selection, lookup failure, and invalid-role rejection.

## Explicit limitations

The public build does not yet provide durable database-backed append-only audit storage, enterprise IAM/SSO federation, managed/KMS-backed secrets, distributed rate limiting, full enterprise DLP, signed release artifacts with complete SBOM/attestation, independent penetration testing, formal verification, or compliance certification.
