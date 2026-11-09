# PMO 3x3 project governance pilot

A deliberately small, deterministic research module for the three dimensions **Value / Effort / Risk**. Outputs estimated value less delivery effort and an explicit risk-specific expected contingency (probability × monetary impact). All input amounts use Decimal strings to avoid binary rounding. No real financial data or AI-controlled funding decisions.

The three artefacts proposed for future product integration:
- Prioritized scope list with owner, estimated value, effort, risk and benefit basis.
- Weekly status report and plan, with evidence for amber/red project status.
- Risk log recording probability, impact, proposed mitigation, risk-specific contingency and owner.

Three governance cadences: daily stand-up, weekly status, monthly steering. These are defaults, **not substitutes for legal, safety or financial controls**.

Run: `cd research && python -m unittest -v test_pmo_3x3.py`.

Acceptance before UI integration: verify financial assumptions with project owners, add overlapping-risk and correlation handling, dates and currencies, approvals, status evidence, benchmark prioritization results and accessible UX. The pilot explicitly returns `requires_human_review` and never auto-approves investment.
