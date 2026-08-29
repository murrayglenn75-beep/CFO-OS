import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('MANIFEST.sha256.json', 'utf8'));
const mismatches = [];
for (const [file, expected] of Object.entries(manifest)) {
  if (!fs.existsSync(file)) { mismatches.push({ file, error: 'missing' }); continue; }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (actual !== expected) mismatches.push({ file, expected, actual });
}
if (mismatches.length) { console.error(JSON.stringify({ ok:false, mismatches }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, filesVerified:Object.keys(manifest).length }, null, 2));
