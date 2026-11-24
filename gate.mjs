#!/usr/bin/env node
// The project gate. Exit 0 only when every check passes; exit 1 otherwise.
// The plan's criteria run `node gate.mjs` from the repo root; scripts/push.mjs does not run it.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const testDir = existsSync(join(root, 'tests')) ? 'tests' : 'scripts';
const tests = readdirSync(join(root, testDir))
  .filter((f) => f.endsWith('.test.mjs'))
  .sort()
  .map((f) => join(testDir, f));

if (tests.length === 0) {
  console.error(`gate: no test files found in ${testDir}/`);
  process.exit(1);
}

const steeringLintPath = existsSync(join(root, 'skills', 'strata-lifecycle', 'scripts', 'steering-lint.mjs'))
  ? 'skills/strata-lifecycle/scripts/steering-lint.mjs'
  : 'scripts/steering-lint.mjs';

const checks = [
  ['steering-lint', [steeringLintPath, '--steering-dir', join(root, 'steering'), '--skills-dir', join(root, 'skills')]],
  ['tests', ['--test', ...tests]],
];

// The checks run with a private TMPDIR that the gate creates, inspects and removes: leftovers fail the gate.
const tmp = mkdtempSync(join(tmpdir(), 'gate-'));
let failed = null;
let leftovers = [];
try {
  for (const [name, args] of checks) {
    console.log(`gate: ${name}`);
    const r = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: { ...process.env, TMPDIR: tmp } });
    if (r.status !== 0) {
      failed = `${name} failed`;
      break;
    }
  }
  leftovers = readdirSync(tmp);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (!failed && leftovers.length > 0) {
  failed = `tests left ${leftovers.length} temp entries: ${leftovers.slice(0, 5).join(', ')}`;
}
if (failed) {
  console.error(`gate: ${failed}`);
  process.exit(1);
}
console.log('gate: all checks passed');
