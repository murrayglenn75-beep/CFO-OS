# Validation — CFO OS v2.1

The public build includes deterministic regression tests for both the governed-AI trust layer and the identity/tenant boundary.

## Automated test suite

Current result:

```text
24 / 24 passing
```

Coverage includes prompt-injection detection, sensitive-data redaction, outbound secret blocking, fail-closed trust behavior, payment-authority separation, viewer authorization restrictions, missing/malformed bearer authentication, server-side role resolution, cross-tenant denial, explicit multi-tenant selection, lookup failure, and invalid-role rejection.

## Release validation commands

```bash
npm run security:scan-public
npm run lint
npm test
npm audit
npm run build
npm run verify:manifest
```

Current validated state before the v2.1 release commit:

```text
TypeScript           PASS
Tests                24 / 24 PASS
Production build     PASS
Dependency audit     0 vulnerabilities
Public leakage scan  PASS
```

The production build may emit a non-blocking Vite chunk-size warning for the current client bundle.

Automated tests improve regression confidence but are not equivalent to independent penetration testing, formal verification, or compliance certification.
