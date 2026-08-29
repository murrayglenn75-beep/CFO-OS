import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const excludedDirs = new Set(['node_modules', '.git', 'dist', 'coverage']);
const textExts = new Set(['.ts','.tsx','.js','.mjs','.json','.md','.html','.css','.yml','.yaml','.example','.txt']);
const findings = [];

const forbidden = [
  { name: 'Google API key pattern', regex: /AIza[0-9A-Za-z_-]{30,}/g },
  { name: 'OpenAI-style secret pattern', regex: /(?:^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}/g },
  { name: 'Private key block', regex: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g },
  { name: 'AI Studio deployment reference', regex: /ai\.studio\/apps\//gi },
  { name: 'private assessment reference', regex: /nine-?67|nine67/gi },
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const relative = path.relative(root, full);
      if (relative === 'scripts/public-safety-check.mjs') continue;
      if (entry.name === '.env') findings.push({ file: relative, issue: '.env must not be committed' });
      const ext = path.extname(entry.name);
      if (!textExts.has(ext) && !['.gitignore'].includes(entry.name)) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const rule of forbidden) {
        if (rule.regex.test(text)) findings.push({ file: path.relative(root, full), issue: rule.name });
        rule.regex.lastIndex = 0;
      }
    }
  }
}

walk(root);
if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, message: 'No configured public-release leakage patterns found.' }, null, 2));
