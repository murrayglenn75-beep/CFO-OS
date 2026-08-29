import crypto from 'node:crypto';

export type TrustStatus =
  | 'VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'AMBIGUOUS'
  | 'MODEL_ESTIMATE'
  | 'BLOCKED';

export type ActionStatus =
  | 'READ_ONLY'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'BLOCKED';

export type SecurityRisk =
  | 'LOW'
  | 'ELEVATED';

export interface TrustEnvelope {
  status: TrustStatus;
  evidenceQuality: number;
  sourceAgreement: number;
  sources: string[];
  unresolvedExceptions: number;
  lastVerified: string;
  actionStatus: ActionStatus;
  reason: string;
  auditId: string;
  injectionRisk: SecurityRisk;
  dataLossRisk: SecurityRisk;
  redactionsApplied: number;
}

const isoSnapshot =
  '2026-06-01T05:14:00Z';

/*
 * -------------------------------------------------------
 * PROMPT-INJECTION DETECTION
 * -------------------------------------------------------
 */

export function detectPromptInjection(
  text: string,
): SecurityRisk {
  const patterns = [
    /*
     * Examples caught:
     *
     * ignore previous instructions
     * ignore all previous instructions
     * ignore system instructions
     * ignore previous system instructions
     * ignore all previous system instructions
     * override developer rules
     * disregard security controls
     */
    /\b(ignore|disregard|forget|override)\s+(?:all\s+)?(?:(?:previous|prior)\s+)?(?:(?:system|developer|security)\s+)?(?:instructions?|rules?|controls?)\b/i,

    /*
     * Hidden/system prompt extraction.
     */
    /(reveal|show|print|dump|repeat)\s+(the\s+)?(system|developer|hidden)\s+(prompt|instructions?|message)/i,

    /*
     * Attempts to bypass controls.
     */
    /(bypass|disable|evade|circumvent)\s+(the\s+)?(policy|controls?|guardrails?|safety|security)/i,

    /*
     * Explicit jailbreak terminology.
     */
    /\b(jailbreak|prompt\s+injection)\b/i,

    /*
     * Attempts to acquire tool execution.
     */
    /(execute|call|invoke|run)\s+(a\s+)?(tool|function|command)/i,

    /*
     * Exfiltration attempts.
     */
    /(exfiltrat(e|ion)|steal|leak)\s+(data|secrets?|credentials?|keys?)/i,

    /*
     * Privilege impersonation.
     */
    /(act|behave)\s+as\s+(the\s+)?(system|developer|administrator|root)/i,

    /*
     * Direct references to hidden instruction layers.
     */
    /developer\s+message/i,

    /system\s+prompt/i,
  ];

  return patterns.some(
    (pattern) =>
      pattern.test(text),
  )
    ? 'ELEVATED'
    : 'LOW';
}

/*
 * -------------------------------------------------------
 * LUHN CHECK FOR PAYMENT-CARD-LIKE VALUES
 * -------------------------------------------------------
 */

function passesLuhn(
  value: string,
): boolean {
  const digits =
    value.replace(
      /\D/g,
      '',
    );

  if (
    digits.length < 13 ||
    digits.length > 19
  ) {
    return false;
  }

  let sum = 0;

  let doubleDigit =
    false;

  for (
    let i =
      digits.length - 1;
    i >= 0;
    i -= 1
  ) {
    let digit =
      Number(
        digits[i],
      );

    if (
      doubleDigit
    ) {
      digit *= 2;

      if (
        digit > 9
      ) {
        digit -= 9;
      }
    }

    sum += digit;

    doubleDigit =
      !doubleDigit;
  }

  return (
    sum % 10 === 0
  );
}

/*
 * -------------------------------------------------------
 * SENSITIVE-DATA REDACTION
 * -------------------------------------------------------
 */

export function redactSensitiveInput(
  text: string,
): {
  text: string;
  count: number;
} {
  let count = 0;

  let redacted =
    text;

  /*
   * Email addresses.
   */

  redacted =
    redacted.replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      () => {
        count += 1;

        return '<redacted-email>';
      },
    );

  /*
   * US SSN-style identifier.
   */

  redacted =
    redacted.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      () => {
        count += 1;

        return '<redacted-id>';
      },
    );

  /*
   * IBAN-like bank identifier.
   */

  redacted =
    redacted.replace(
      /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi,
      () => {
        count += 1;

        return '<redacted-bank-id>';
      },
    );

  /*
   * Anthropic-style API keys.
   */

  redacted =
    redacted.replace(
      /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
      () => {
        count += 1;

        return '<redacted-api-key>';
      },
    );

  /*
   * Generic sk-* API keys.
   */

  redacted =
    redacted.replace(
      /\bsk-[A-Za-z0-9_-]{20,}\b/g,
      () => {
        count += 1;

        return '<redacted-api-key>';
      },
    );

  /*
   * GitHub-style tokens.
   */

  redacted =
    redacted.replace(
      /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
      () => {
        count += 1;

        return '<redacted-token>';
      },
    );

  /*
   * AWS access-key identifiers.
   */

  redacted =
    redacted.replace(
      /\bAKIA[0-9A-Z]{16}\b/g,
      () => {
        count += 1;

        return '<redacted-access-key>';
      },
    );

  /*
   * JWT-like tokens.
   */

  redacted =
    redacted.replace(
      /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
      () => {
        count += 1;

        return '<redacted-jwt>';
      },
    );

  /*
   * Authorization bearer tokens.
   */

  redacted =
    redacted.replace(
      /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/gi,
      () => {
        count += 1;

        return 'Bearer <redacted-token>';
      },
    );

  /*
   * Common secret assignments.
   *
   * Examples:
   *
   * api_key=...
   * password=...
   * client_secret=...
   * access_token=...
   */

  redacted =
    redacted.replace(
      /\b(api[_-]?key|secret|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd)\b\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}["']?/gi,
      (
        _match,
        name: string,
      ) => {
        count += 1;

        return `${name}=<redacted-secret>`;
      },
    );

  /*
   * PEM/private-key material.
   */

  redacted =
    redacted.replace(
      /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g,
      () => {
        count += 1;

        return '<redacted-private-key>';
      },
    );

  /*
   * Payment-card-like values.
   *
   * Only redact numeric sequences
   * that pass the Luhn checksum.
   */

  redacted =
    redacted.replace(
      /\b(?:\d[ -]?){13,19}\b/g,
      (
        candidate,
      ) => {
        if (
          !passesLuhn(
            candidate,
          )
        ) {
          return candidate;
        }

        count += 1;

        return '<redacted-payment-card>';
      },
    );

  return {
    text:
      redacted,

    count,
  };
}

/*
 * -------------------------------------------------------
 * OUTBOUND MODEL-EGRESS INSPECTION
 *
 * This must run AFTER redaction
 * and BEFORE an external model call.
 * -------------------------------------------------------
 */

export function inspectOutboundContent(
  text: string,
): {
  risk: SecurityRisk;
  reasons: string[];
} {
  const reasons: string[] =
    [];

  const checks: Array<{
    reason: string;
    pattern: RegExp;
  }> = [
    {
      reason:
        'private-key-material',

      pattern:
        /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i,
    },

    {
      reason:
        'anthropic-api-key',

      pattern:
        /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
    },

    {
      reason:
        'generic-api-key',

      pattern:
        /\bsk-[A-Za-z0-9_-]{20,}\b/,
    },

    {
      reason:
        'github-token',

      pattern:
        /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    },

    {
      reason:
        'aws-access-key',

      pattern:
        /\bAKIA[0-9A-Z]{16}\b/,
    },

    {
      reason:
        'jwt-token',

      pattern:
        /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    },

    {
      reason:
        'bearer-token',

      pattern:
        /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/i,
    },

    {
      reason:
        'secret-assignment',

      pattern:
        /\b(api[_-]?key|secret|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd)\b\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}/i,
    },

    {
      reason:
        'email-address',

      pattern:
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    },

    {
      reason:
        'ssn-style-id',

      pattern:
        /\b\d{3}-\d{2}-\d{4}\b/,
    },

    {
      reason:
        'iban-like-bank-id',

      pattern:
        /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i,
    },
  ];

  for (
    const check of checks
  ) {
    if (
      check.pattern.test(
        text,
      )
    ) {
      reasons.push(
        check.reason,
      );
    }
  }

  return {
    risk:
      reasons.length > 0
        ? 'ELEVATED'
        : 'LOW',

    reasons,
  };
}

/*
 * -------------------------------------------------------
 * AUDIT IDENTIFIER
 * -------------------------------------------------------
 */

function auditId(
  input: unknown,
) {
  return crypto
    .createHash(
      'sha256',
    )
    .update(
      JSON.stringify(
        input,
      ),
    )
    .digest(
      'hex',
    )
    .slice(
      0,
      16,
    );
}

/*
 * -------------------------------------------------------
 * TRUST ENVELOPE
 * -------------------------------------------------------
 */

export function buildTrustEnvelope(
  question: string,
  injectionRisk: SecurityRisk,
  redactionsApplied: number,
  dataLossRisk: SecurityRisk = 'LOW',
): TrustEnvelope {
  const q =
    question.toLowerCase();

  const isForecast =
    /(forecast|predict|scenario|projection|q3)/.test(
      q,
    );

  const isEbitda =
    /ebitda/.test(
      q,
    );

  const isRevenue =
    /revenue|renewal|pipeline/.test(
      q,
    );

  const isBoard =
    /board|summary|executive/.test(
      q,
    );

  let status: TrustStatus =
    'VERIFIED';

  let evidenceQuality =
    96;

  let sourceAgreement =
    94;

  let unresolvedExceptions =
    0;

  let actionStatus: ActionStatus =
    'READ_ONLY';

  let reason =
    'Derived from reconciled synthetic finance records and deterministic calculations.';

  let sources = [
    'NetSuite',
    'Mercury',
    'Brex',
  ];

  /*
   * Close figures with unresolved
   * exceptions require review.
   */

  if (
    isEbitda ||
    isRevenue ||
    isBoard
  ) {
    status =
      'REVIEW_REQUIRED';

    evidenceQuality =
      94;

    sourceAgreement =
      86;

    unresolvedExceptions =
      2;

    actionStatus =
      'HUMAN_APPROVAL_REQUIRED';

    reason =
      'Core figures reconcile, but two close-cycle exceptions remain unresolved and cannot silently acquire authority.';

    sources = [
      'NetSuite',
      'Salesforce',
      'Mercury',
      'Brex',
    ];
  }

  /*
   * Forward-looking answers are
   * explicitly model estimates.
   */

  if (
    isForecast
  ) {
    status =
      'MODEL_ESTIMATE';

    evidenceQuality =
      88;

    sourceAgreement =
      82;

    unresolvedExceptions =
      2;

    actionStatus =
      'HUMAN_APPROVAL_REQUIRED';

    reason =
      'Forward-looking output is a model estimate grounded in historical trend data, not a booked financial fact.';

    sources = [
      'NetSuite',
      'Salesforce',
    ];
  }

  /*
   * Prompt-injection blocks short-circuit
   * normal evidence evaluation.
   *
   * Do not display apparently strong
   * finance evidence on a blocked request.
   */

  if (
    injectionRisk ===
    'ELEVATED'
  ) {
    status =
      'BLOCKED';

    evidenceQuality =
      0;

    sourceAgreement =
      0;

    sources =
      [];

    unresolvedExceptions =
      0;

    actionStatus =
      'BLOCKED';

    reason =
      'Potential instruction-conflict pattern detected. Evidence evaluation was not performed and no provider or privileged action is authorized.';
  }

  /*
   * DLP / egress failure also
   * short-circuits evidence evaluation.
   */

  if (
    dataLossRisk ===
    'ELEVATED'
  ) {
    status =
      'BLOCKED';

    evidenceQuality =
      0;

    sourceAgreement =
      0;

    sources =
      [];

    unresolvedExceptions =
      0;

    actionStatus =
      'BLOCKED';

    reason =
      'Outbound sensitive-data inspection failed. Evidence evaluation was not performed and the request cannot be sent to an external model provider.';
  }

  const envelope = {
    status,
    evidenceQuality,
    sourceAgreement,
    sources,
    unresolvedExceptions,

    lastVerified:
      isoSnapshot,

    actionStatus,
    reason,
    injectionRisk,
    dataLossRisk,
    redactionsApplied,
  };

  return {
    ...envelope,

    auditId:
      auditId({
        question,
        ...envelope,
      }),
  };
}

/*
 * -------------------------------------------------------
 * ACTION AUTHORIZATION
 * -------------------------------------------------------
 */

export type DemoRole =
  | 'CFO'
  | 'CONTROLLER'
  | 'ACCOUNTANT'
  | 'VIEWER';

export function qualifyAction(
  input: {
    role: DemoRole;

    action:
      | 'EXPORT_JOURNAL'
      | 'APPROVE_RECONCILIATION'
      | 'SEND_PAYMENT'
      | 'PUBLISH_BOARD_PACK';

    evidenceQuality: number;

    sourceAgreement: number;

    unresolvedExceptions: number;
  },
) {
  const {
    role,
    action,
    evidenceQuality,
    sourceAgreement,
    unresolvedExceptions,
  } = input;

  /*
   * Fail closed on malformed
   * policy evidence.
   */

  if (
    ![
      evidenceQuality,
      sourceAgreement,
      unresolvedExceptions,
    ].every(
      Number.isFinite,
    ) ||
    evidenceQuality < 0 ||
    evidenceQuality > 100 ||
    sourceAgreement < 0 ||
    sourceAgreement > 100 ||
    unresolvedExceptions < 0 ||
    !Number.isInteger(
      unresolvedExceptions,
    )
  ) {
    return {
      qualified:
        false,

      status:
        'BLOCKED',

      reason:
        'Invalid or out-of-range policy evidence inputs.',
    } as const;
  }

  /*
   * Demo capability map.
   *
   * Production roles should ultimately
   * come from authenticated,
   * database-backed identity.
   */

  const permissions: Record<
    DemoRole,
    string[]
  > = {
    CFO: [
      'EXPORT_JOURNAL',
      'APPROVE_RECONCILIATION',
      'SEND_PAYMENT',
      'PUBLISH_BOARD_PACK',
    ],

    CONTROLLER: [
      'EXPORT_JOURNAL',
      'APPROVE_RECONCILIATION',
      'PUBLISH_BOARD_PACK',
    ],

    ACCOUNTANT: [
      'EXPORT_JOURNAL',
    ],

    VIEWER:
      [],
  };

  if (
    !permissions[
      role
    ].includes(
      action,
    )
  ) {
    return {
      qualified:
        false,

      status:
        'BLOCKED',

      reason:
        'Role does not hold the required capability.',
    } as const;
  }

  /*
   * Consequential actions cannot
   * proceed while close exceptions exist.
   */

  if (
    unresolvedExceptions > 0 &&
    [
      'SEND_PAYMENT',
      'PUBLISH_BOARD_PACK',
    ].includes(
      action,
    )
  ) {
    return {
      qualified:
        false,

      status:
        'BLOCKED',

      reason:
        'Unresolved close exceptions must be cleared before this action.',
    } as const;
  }

  /*
   * Evidence/provenance quality floor.
   */

  if (
    evidenceQuality < 90 ||
    sourceAgreement < 85
  ) {
    return {
      qualified:
        false,

      status:
        'REVIEW_REQUIRED',

      reason:
        'Evidence quality or source agreement is below the demo policy floor.',
    } as const;
  }

  /*
   * PAYMENT AUTHORITY CANNOT BE
   * DELEGATED TO THE MODEL.
   */

  if (
    action ===
    'SEND_PAYMENT'
  ) {
    return {
      qualified:
        false,

      status:
        'HUMAN_APPROVAL_REQUIRED',

      reason:
        'Payment execution is never delegated to the model in this public build.',
    } as const;
  }

  return {
    qualified:
      true,

    status:
      'QUALIFIED',

    reason:
      'Role, evidence, provenance state, and policy checks are satisfied.',
  } as const;
}