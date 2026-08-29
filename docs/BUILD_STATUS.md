# Public Build Validation Status

## Completed in the rebuild workspace

- TypeScript/TSX syntax transpilation across source, server and test files: **PASS**
- Deterministic trust/security checks: **7/7 PASS**
  - prompt-injection risk detection,
  - normal finance query remains low risk,
  - selected PII redaction,
  - forecasts labeled model estimates,
  - payment remains human-controlled,
  - viewer board-publication attempt blocked,
  - invalid policy evidence values fail closed.
- Public-release leakage scan: run before packaging.
- Synthetic-data disclosure and private-project reference cleanup: completed.
- May 2026 calculation graph COGS / gross-profit inconsistency: corrected.

## Environment limitation

A full dependency install/build could not be completed inside the packaging workspace because npm registry downloads returned DNS `EAI_AGAIN` errors. This is an environment/network limitation, not recorded as a passing build.

The repository includes GitHub Actions CI that runs `npm ci`, `npm run lint`, `npm test`, and `npm run build` on push / pull request. The first GitHub CI run should therefore be treated as the authoritative full dependency + compile validation for the public repository.
