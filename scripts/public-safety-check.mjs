
import fs from 'node:fs';
import path from 'node:path';
import {
  execFileSync,
} from 'node:child_process';

const root =
  process.cwd();

const scannerPath =
  'scripts/public-safety-check.mjs';

const textExts =
  new Set([
    '.ts',
    '.tsx',
    '.js',
    '.mjs',
    '.cjs',
    '.json',
    '.md',
    '.html',
    '.css',
    '.yml',
    '.yaml',
    '.example',
    '.txt',
  ]);

const findings = [];

const forbidden = [
  {
    name:
      'Google API key pattern',

    regex:
      /AIza[0-9A-Za-z_-]{30,}/g,
  },

  {
    name:
      'Anthropic/OpenAI-style secret pattern',

    regex:
      /(?:^|[^A-Za-z0-9])sk-(?:ant-)?[A-Za-z0-9_-]{20,}/g,
  },

  {
    name:
      'GitHub token pattern',

    regex:
      /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  },

  {
    name:
      'AWS access key pattern',

    regex:
      /\bAKIA[0-9A-Z]{16}\b/g,
  },

  {
    name:
      'Private key block',

    regex:
      /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g,
  },

  {
    name:
      'AI Studio deployment reference',

    regex:
      /ai\.studio\/apps\//gi,
  },

  {
    name:
      'private assessment reference',

    regex:
      /nine-?67|nine67/gi,
  },
];

/*
 * -------------------------------------------------------
 * FILE ENUMERATION
 * -------------------------------------------------------
 *
 * Scan:
 *   - files already tracked by Git
 *   - untracked files that are NOT ignored
 *
 * Do NOT scan ignored local files such as .env.
 *
 * If .env were ever force-added to Git, it would appear
 * here as a tracked file and fail the check below.
 * -------------------------------------------------------
 */

function gitVisibleFiles() {
  const output =
    execFileSync(
      'git',
      [
        'ls-files',
        '--cached',
        '--others',
        '--exclude-standard',
        '-z',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

  return output
    .split('\0')
    .filter(Boolean)
    .map(
      (file) =>
        file.replaceAll(
          '\\',
          '/',
        ),
    );
}

/*
 * -------------------------------------------------------
 * SECRET / RELEASE CHECK
 * -------------------------------------------------------
 */

function scanFile(
  relative,
) {
  if (
    relative ===
    scannerPath
  ) {
    /*
     * The scanner contains the detection expressions
     * themselves and therefore must not scan itself.
     */
    return;
  }

  const filename =
    path.basename(
      relative,
    );

  /*
   * A tracked runtime environment file is never allowed.
   * .env.example remains allowed.
   */

  if (
    filename === '.env' ||
    (
      filename.startsWith(
        '.env.',
      ) &&
      filename !==
        '.env.example'
    )
  ) {
    findings.push({
      file:
        relative,

      issue:
        'Runtime environment file must not be committed',
    });

    return;
  }

  const extension =
    path.extname(
      filename,
    );

  const readable =
    textExts.has(
      extension,
    ) ||
    filename ===
      '.gitignore';

  if (!readable) {
    return;
  }

  const full =
    path.join(
      root,
      relative,
    );

  if (
    !fs.existsSync(full)
  ) {
    return;
  }

  const stat =
    fs.statSync(full);

  if (
    !stat.isFile()
  ) {
    return;
  }

  /*
   * Avoid unexpectedly loading huge generated files.
   */

  if (
    stat.size >
    2_000_000
  ) {
    return;
  }

  const text =
    fs.readFileSync(
      full,
      'utf8',
    );

  for (
    const rule of forbidden
  ) {
    rule.regex.lastIndex =
      0;

    if (
      rule.regex.test(
        text,
      )
    ) {
      findings.push({
        file:
          relative,

        issue:
          rule.name,
      });
    }

    rule.regex.lastIndex =
      0;
  }
}

/*
 * -------------------------------------------------------
 * RUN
 * -------------------------------------------------------
 */

let files;

try {
  files =
    gitVisibleFiles();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,

        error:
          'Unable to enumerate Git-visible files',

        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      null,
      2,
    ),
  );

  process.exit(1);
}

for (
  const file of files
) {
  scanFile(
    file,
  );
}

if (
  findings.length
) {
  console.error(
    JSON.stringify(
      {
        ok: false,

        scannedFiles:
          files.length,

        findings,
      },
      null,
      2,
    ),
  );

  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,

      scannedFiles:
        files.length,

      message:
        'No configured public-release leakage patterns found in Git-visible files.',
    },
    null,
    2,
  ),
);