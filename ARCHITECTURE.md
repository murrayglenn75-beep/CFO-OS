# CFO OS v2.1 Architecture

## Design objective

CFO OS separates **financial truth**, **AI explanation**, **identity/tenant authority**, and **execution authority**.

The language model is deliberately outside both the financial-truth boundary and the authorization boundary.

## 1. Finance Truth Core

Financial metrics are deterministic. Revenue, gross margin, operating expenses, EBITDA, and cash are represented independently of model text. The Calculation Engine exposes dependency relationships so outputs can be traced to source state.

## 2. Evidence and provenance state

Before AI explanation, the application tracks source quality, reconciliation state, and unresolved exceptions. A numerical result can be correct while still carrying a review state because evidence or close-state agreement is incomplete.

## 3. Identity and tenant boundary

Supabase verifies authenticated user identity. Protected API routes then resolve organization membership and derive the application role from database state.

`X-Organization-ID` is a tenant selector only. It grants no authority by itself.

Supported database roles are `owner`, `cfo`, `controller`, `accountant`, and `viewer`.

The server maps these to application authorization roles. Client-supplied authorization roles are rejected.

## 4. PostgreSQL tenant isolation

Tenant-aware tables use PostgreSQL Row Level Security with least-privilege grants. The public application path uses the authenticated user context rather than a service-role bypass credential.

## 5. Governed Copilot

The Copilot is a server-proxied, read-only reasoning surface with no tool bindings. Input is bounded, inspected for prompt injection, redacted for selected sensitive-data patterns, and subjected to outbound DLP checks.

## 6. Action Qualification

Actions are evaluated outside the model using server-resolved role, action type, evidence quality, source agreement, and unresolved exception state.

In the public demo, payment execution can never be model-qualified.

## 7. Auditability

Important AI queries and action-qualification decisions generate hash-linked runtime audit events associated with tenant and user context.

This remains an in-memory demonstration. It is not yet durable database-backed audit storage.

## Deployment boundary

The browser receives no Anthropic API secret and no Supabase service-role secret.

v2.2 should add durable append-only audit storage, managed/KMS-backed secrets, distributed abuse controls, stronger release attestation, observability, and independent adversarial testing.
