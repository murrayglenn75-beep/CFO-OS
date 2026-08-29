# CFO OS v2 Architecture

## Design objective

CFO OS is built around an explicit separation of **financial truth**, **AI explanation**, and **execution authority**.

### 1. Finance Truth Core
Financial metrics are deterministic. Revenue, gross margin, operating expenses, EBITDA and cash are represented independently of model text. The Calculation Engine exposes dependency relationships so outputs can be traced back to source data.

### 2. Evidence and provenance state
Before AI explanation, the application tracks data-source quality, reconciliation state and unresolved exceptions. A numerical result can be correct while still carrying a review state because its source agreement or close-state evidence is incomplete.

### 3. Governed Copilot
The Copilot is a server-proxied, read-only reasoning surface. It has no tool bindings. Input is bounded, validated and redacted for selected PII patterns before being sent to the model. Each answer is returned with a deterministic Trust Envelope.

### 4. Action Qualification
Actions are evaluated outside the model using role, action type, evidence quality, source agreement and unresolved exception state. In the public demo, payment execution can never be model-qualified.

### 5. Auditability
Important AI queries and action-qualification decisions generate hash-linked audit events. This is a lightweight public demonstration of tamper-evident event sequencing, not a production immutable ledger.

## Deployment boundary

The browser receives no Gemini key. Model calls are proxied through Express. A production deployment should add real identity, tenant isolation, durable audit storage, KMS-backed secret management, database authorization, CSP tuning, observability and external security testing.
