import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const manifest = JSON.parse(
  fs.readFileSync('MANIFEST.sha256.json', 'utf8')
);

const mismatches = [];

for (const [file, expected] of Object.entries(manifest)) {
  let content;

  try {
    // Read Git's staged bytes rather than platform-dependent
    // working-tree bytes. Works consistently on Windows and Linux.
    content = execFileSync('git', ['show', `:${file}`]);
  } catch {
    mismatches.push({ file, error: 'missing from Git index' });
    continue;
  }

  const actual = crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');

  if (actual !== expected) {
    mismatches.push({ file, expected, actual });
  }
}

if (mismatches.length) {
  console.error(JSON.stringify({ ok: false, mismatches }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  filesVerified: Object.keys(manifest).length
}, null, 2));
