# Semantic metric definition pilot

Research-only prototype inspired by NVIDIA Auto Ontology. It deliberately does not connect databases or permit natural-language SQL execution. See `research/metric_ontology.mjs` for two explicit, approved metric definitions over synthetic integer-minor-unit rows.

Run: `node --test research/test_metric_ontology.mjs`

No financial records are written. The tests verify gross/net interpretation, pending exclusion, invalid data and ambiguous metric rejection. Five local Node tests passed 2026-11-04.

Before production use: reconcile actual finance definitions with stakeholders; specify source tables, currency conversions, return/refund statuses and date boundaries; authenticate/authorize tenant-specific reads; use parameterized read-only SQL and RLS; record column/row lineage without exposing sensitive values; verify against a finance-approved golden dataset. Protect NVIDIA Auto Ontology services behind a trusted auth boundary; no direct public FastAPI exposure or trusted identity forwarding from untrusted clients.
