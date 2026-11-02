# Design-first independent review gate

Scope: Finance reconciliation and decision-review gate.

## Workflow
1. **Elephant:** document problem, user, constraints, alternatives, intended behavior, exact files/interfaces, acceptance criteria and evidence sources. **No implementation yet.**
2. **Comprehension review:** a fresh-context reviewer receives the written spec (not the author's discussion) and explains requirements back. Any mismatch blocks approval.
3. **Adversarial review:** separate fresh-context reviewers test edge cases, dependencies, security, failure modes, rollout and rollback. Record independent findings with evidence.
4. **Authorization:** human owner and existing independent authority controls approve the reviewed scope before coding. Reviewers cannot grant tool permissions or alter constitutional constraints.
5. **Implementation:** change only approved files; tests must map to acceptance criteria. Significant scope drift triggers renewed review.
6. **Verification:** independent checks of code, effect existence, safety, regression tests, provenance and cost/latency where relevant. Record pass/fail and evidence; do not assert success without external state checks.

## Project-specific requirements
Specify financial invariants, reconciliation sources, evidence pointers, authorization boundaries, approval thresholds and rollback. Fresh reviewers challenge calculations and data leakage assumptions. Model experimentation never changes source-of-truth ledger calculations; use nanochat only in an isolated research lane.

## Mandatory review checklist
- [ ] Problem and non-goals documented
- [ ] Inputs, outputs, interfaces and affected files explicit
- [ ] Security/data flow, privacy and retention mapped
- [ ] Existing behavior and baseline measurements captured
- [ ] Independent comprehension reviewer signs off
- [ ] Independent adversarial review findings resolved
- [ ] Human/independent authority gate approves implementation
- [ ] Tests cover happy path, edge cases, adverse effects and rollback
- [ ] Actual artifact/action existence independently verified
- [ ] Regression, cost/latency and provenance documented

## Experimental research lane
Use [nanochat](https://github.com/karpathy/nanochat) as a reference for tokenizer, training, inference and evaluation mechanics; experiments must be isolated, opt-in and benchmarked against a baseline. Never assume training is feasible on local hardware or that external models confer authority.

## References
- https://github.com/google/elephant-goldfish-model
- https://github.com/karpathy/nanochat

**Status:** Process specification only. This file does not implement gates or demonstrate that tests pass.
