# Threat Model — Public Demo

| Threat | Public-build treatment |
|---|---|
| Direct prompt injection | Detect common instruction-conflict patterns; keep model read-only and tool-less. |
| Indirect prompt injection | Treat document/external content as data, not authority; no direct tool pathway exists. |
| Sensitive input disclosure | Redact selected identifiers before model calls; keep secrets server-side. |
| Hallucinated financial fact | Deterministic finance layer remains source of booked metrics; trust metadata distinguishes estimates. |
| Excessive agency | No model-accessible payment, journal, reconciliation or publication tools. |
| Privilege escalation | Action qualification is deterministic and role-aware outside the model. |
| Unresolved evidence | Consequential actions can be blocked while close exceptions remain open. |
| Unbounded model usage | Request size, history length and API rate are bounded. |
| Audit manipulation | Demo events are chained by previous-event hash; production would require durable signed storage. |

## Trust boundary

The model can influence prose. It cannot directly mutate financial state or create authority.
