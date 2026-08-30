# Threat Model — CFO OS v2.1 Public Demo

| Threat | Public-build treatment |
|---|---|
| Missing or malformed authentication | Protected routes require a valid Supabase bearer token and fail closed. |
| Cross-tenant access | Organization ID is a selector only; membership is verified before tenant context is accepted. |
| Client role spoofing | Client-supplied authorization role is rejected; role is derived server-side from membership. |
| Database cross-tenant access | PostgreSQL RLS and least-privilege grants provide a second tenant-enforcement layer. |
| Multiple-tenant ambiguity | Explicit organization selection is required when more than one membership exists. |
| Direct prompt injection | Detect common instruction-conflict patterns; keep model read-only and tool-less. |
| Indirect prompt injection | Treat external/document content as data rather than authority; no direct tool pathway exists. |
| Sensitive input disclosure | Redact selected sensitive patterns before model calls and inspect provider egress. |
| Hallucinated financial fact | Deterministic finance layer remains source of booked metrics; trust metadata distinguishes estimates. |
| Excessive agency | No model-accessible payment, journal, reconciliation, or publication tools. |
| Privilege escalation | Action qualification is deterministic and uses the server-resolved tenant role. |
| Unresolved evidence | Consequential actions can be blocked while close exceptions remain open. |
| Unbounded model usage | Request size, history length, message size, and API rate are bounded. |
| Audit manipulation | Runtime events are hash-linked; durable append-only database audit remains future work. |

## Primary trust rule

The model can influence prose. It cannot create identity, tenant membership, database authority, financial truth, or execution authority.

## Residual risks

This public implementation still has residual risks typical of a portfolio/reference system, including process-local rate limiting, non-durable audit storage, incomplete enterprise DLP, lack of independent penetration testing, and lack of formal verification/compliance certification.
