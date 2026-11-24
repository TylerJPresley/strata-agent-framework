// SPDX-License-Identifier: MIT
// version-check.mjs: skills/strata-lifecycle/references/vision.md holds the single source of the framework version
// (`Version: X.Y.Z`) and the embedded Strata Blueprints version (`Embedded Strata Blueprints: A.B.C`).
// versionProblems(root) returns problem strings; empty means every copy agrees across:
//   - skills/strata-lifecycle/references/vision.md (`Version:` and `Embedded Strata Blueprints:`)
//   - CHANGELOG.md (top released `## X.Y.Z` heading)
//   - package.json (`version` and `embedded["strata-blueprints"]`)
//   - README.md (`Version: \`X.Y.Z\`` and embedded note `vA.B.C`)
//   - skills/strata-blueprints/SKILL.md (`metadata.version`)
//   - skills/strata-blueprints/references/strata-blueprints-guide.md (`Version:`)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function versionProblems(root) {
  const vision = join(root, 'skills', 'strata-lifecycle', 'references', 'vision.md');
  const changelog = join(root, 'CHANGELOG.md');
  if (!existsSync(vision)) return ['skills/strata-lifecycle/references/vision.md is missing'];
  if (!existsSync(changelog)) return ['CHANGELOG.md is missing'];

  const visionText = readFileSync(vision, 'utf8');
  const vm = visionText.match(/^Version:\s*(\S+)\s*$/m);
  if (!vm) return ["no 'Version:' line in skills/strata-lifecycle/references/vision.md"];
  const em = visionText.match(/^Embedded Strata Blueprints:\s*(\S+)\s*$/m);
  if (!em) return ["no 'Embedded Strata Blueprints:' line in skills/strata-lifecycle/references/vision.md"];

  const version = vm[1];
  const bpVersion = em[1];
  const problems = [];

  let topReleased = null;
  for (const line of readFileSync(changelog, 'utf8').split('\n')) {
    const hm = line.match(/^##\s+(.+?)\s*$/);
    if (hm && hm[1] !== 'Unreleased') {
      topReleased = hm[1];
      break;
    }
  }
  if (topReleased === null) problems.push('CHANGELOG.md has no released heading');
  else if (topReleased !== version) {
    problems.push(`vision Version ${version} does not equal top released CHANGELOG heading ${topReleased}`);
  }

  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) {
    problems.push('package.json is missing');
  } else {
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    } catch {
      pkg = {};
    }
    if (pkg.version !== version) {
      problems.push(`package.json version ${pkg.version} does not equal vision Version ${version}`);
    }
    const pkgBp = pkg?.embedded?.['strata-blueprints'];
    if (pkgBp !== bpVersion) {
      problems.push(`package.json embedded["strata-blueprints"] ${pkgBp} does not equal vision Embedded Strata Blueprints ${bpVersion}`);
    }
  }

  const readmePath = join(root, 'README.md');
  if (!existsSync(readmePath)) {
    problems.push('README.md is missing');
  } else {
    const readmeText = readFileSync(readmePath, 'utf8');
    const rvm = readmeText.match(/^Version:\s*`([^`]+)`/m);
    if (!rvm) {
      problems.push('README.md is missing the Version header line');
    } else if (rvm[1] !== version) {
      problems.push(`README.md Version ${rvm[1]} does not equal vision Version ${version}`);
    }
    const rbm = readmeText.match(/Embedded `strata-blueprints` Skill \(`v([^`]+)`\)/);
    if (!rbm) {
      problems.push('README.md is missing the Embedded strata-blueprints Skill version note');
    } else if (rbm[1] !== bpVersion) {
      problems.push(`README.md Embedded strata-blueprints ${rbm[1]} does not equal vision Embedded Strata Blueprints ${bpVersion}`);
    }
  }

  const bpSkillPath = join(root, 'skills', 'strata-blueprints', 'SKILL.md');
  if (!existsSync(bpSkillPath)) {
    problems.push('skills/strata-blueprints/SKILL.md is missing');
  } else {
    const sm = readFileSync(bpSkillPath, 'utf8').match(/^\s+version:\s*"?([^"\s]+)"?\s*$/m);
    if (!sm || sm[1] !== bpVersion) {
      problems.push(`skills/strata-blueprints/SKILL.md version ${sm ? sm[1] : 'missing'} does not equal vision Embedded Strata Blueprints ${bpVersion}`);
    }
  }

  const bpGuidePath = join(root, 'skills', 'strata-blueprints', 'references', 'strata-blueprints-guide.md');
  if (!existsSync(bpGuidePath)) {
    problems.push('skills/strata-blueprints/references/strata-blueprints-guide.md is missing');
  } else {
    const gm = readFileSync(bpGuidePath, 'utf8').match(/^Version:\s*(\S+)\s*$/m);
    if (!gm || gm[1] !== bpVersion) {
      problems.push(`skills/strata-blueprints/references/strata-blueprints-guide.md Version ${gm ? gm[1] : 'missing'} does not equal vision Embedded Strata Blueprints ${bpVersion}`);
    }
  }

  return problems;
}
