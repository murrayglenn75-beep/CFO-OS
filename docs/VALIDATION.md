# Validation

The public rebuild includes deterministic tests for the trust/security layer.

Current test targets:

1. obvious prompt-injection patterns are raised to `ELEVATED`,
2. selected sensitive identifiers are redacted,
3. forward-looking requests are labeled `MODEL_ESTIMATE`,
4. model-driven payment execution remains human-controlled,
5. viewer role cannot publish a board pack.

Run:

```bash
npm test
npm run lint
npm run build
```

Additional production work should include API integration tests, property testing of finance calculations, replay tests for audit storage, authentication/authorization tests, dependency scanning, SAST/DAST and external adversarial testing.
