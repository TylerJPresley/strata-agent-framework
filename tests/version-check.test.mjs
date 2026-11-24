// SPDX-License-Identifier: MIT
// Tests for version-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { versionProblems } from '../scripts/version-check.mjs';

function fixture(t, over = {}) {
  const v = {
    vision: '0.1.0',
    visionBp: '0.3.0',
    changelog: '0.1.0',
    pkg: '0.1.0',
    pkgBp: '0.3.0',
    readme: '0.1.0',
    readmeBp: '0.3.0',
    skillBp: '0.3.0',
    guideBp: '0.3.0',
    ...over,
  };
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'version-check-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('skills/strata-lifecycle/references/vision.md', `# Vision\n\nVersion: ${v.vision}\nEmbedded Strata Blueprints: ${v.visionBp}\n`);
  put('CHANGELOG.md', `# Changelog\n\n## Unreleased\n\n## ${v.changelog}\n`);
  put(
    'package.json',
    JSON.stringify({
      name: 'strata-agent-framework',
      version: v.pkg,
      embedded: { 'strata-blueprints': v.pkgBp },
    })
  );
  put(
    'README.md',
    `# Strata Agent Framework\n\nVersion: \`${v.readme}\` · License: [MIT](LICENSE)\n\n> **Embedded \`strata-blueprints\` Skill (\`v${v.readmeBp}\`):**\n`
  );
  put('skills/strata-blueprints/SKILL.md', `---\nname: strata-blueprints\nmetadata:\n  version: "${v.skillBp}"\n---\n`);
  put('skills/strata-blueprints/references/strata-blueprints-guide.md', `# Guide\n\nVersion: ${v.guideBp}\n`);
  return root;
}

test('all versions equal: no problems', (t) => {
  assert.deepEqual(versionProblems(fixture(t)), []);
});

test('real repository passes versionProblems', () => {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  assert.deepEqual(versionProblems(repoRoot), []);
});

test('package.json version differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { pkg: '0.2.0' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /package\.json version 0\.2\.0 does not equal vision Version 0\.1\.0/);
});

test('package.json embedded strata-blueprints version differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { pkgBp: '0.4.0' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /package\.json embedded\["strata-blueprints"\] 0\.4\.0 does not equal vision Embedded Strata Blueprints 0\.3\.0/);
});

test('README embedded version differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { readmeBp: '0.2.0' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /README\.md Embedded strata-blueprints 0\.2\.0 does not equal vision Embedded Strata Blueprints 0\.3\.0/);
});

test('embedded SKILL.md version differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { skillBp: '0.4.0' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /skills\/strata-blueprints\/SKILL\.md version 0\.4\.0 does not equal vision Embedded Strata Blueprints 0\.3\.0/);
});

test('embedded guide Version differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { guideBp: '0.4.0' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /strata-blueprints-guide\.md Version 0\.4\.0 does not equal vision Embedded Strata Blueprints 0\.3\.0/);
});

test('changelog heading differing from vision fails', (t) => {
  const p = versionProblems(fixture(t, { changelog: '0.0.9' }));
  assert.equal(p.length, 1);
  assert.match(p[0], /vision Version 0\.1\.0 does not equal top released CHANGELOG heading 0\.0\.9/);
});
