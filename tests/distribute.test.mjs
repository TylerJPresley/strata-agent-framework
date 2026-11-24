// SPDX-License-Identifier: MIT
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const distScript = path.join(repoRoot, "scripts", "distribute.mjs");

function makeHome(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dist-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function runDist(home, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [distScript, "--source", repoRoot, "--home", home, "--yes", ...extraArgs],
    { encoding: "utf8", env: { ...process.env, STRATA_BP_SOURCE: "/nonexistent" } }
  );
}

test("deploys to detected default app folders (kiro, pi, claude), rewrites skill paths per app, and skips unselected hermes", (t) => {
  const home = makeHome(t);
  fs.mkdirSync(path.join(home, ".kiro"), { recursive: true });
  fs.mkdirSync(path.join(home, ".pi", "agent"), { recursive: true });
  fs.mkdirSync(path.join(home, ".claude"), { recursive: true });
  fs.mkdirSync(path.join(home, ".hermes"), { recursive: true });

  // Simulate legacy symlink in ~/.pi/agent/agents -> ~/.agents/agents
  fs.symlinkSync(path.join(home, ".agents", "agents"), path.join(home, ".pi", "agent", "agents"));

  // Pre-populate user content in ~/.pi/agent/AGENTS.md to verify non-destructive bottom block
  fs.writeFileSync(path.join(home, ".pi", "agent", "AGENTS.md"), "# User Custom Pi Rules\n\nKeep this header.\n");

  const r = runDist(home);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  // Kiro gets steering/ and compiled agents/*.json with ~/.kiro/skills/... paths
  assert.ok(fs.existsSync(path.join(home, ".kiro", ".strata-manifest.json")));
  assert.ok(fs.existsSync(path.join(home, ".kiro", "skills", "strata-lifecycle", "scripts", "verify-plan.mjs")));
  const kiroSteering = fs.readFileSync(path.join(home, ".kiro", "steering", "strata-concise.md"), "utf8");
  assert.match(kiroSteering, /~\/\.kiro\/skills\/strata-lifecycle/);
  assert.doesNotMatch(kiroSteering, /~\/\.agents\/skills\//);

  // Pi gets real agents/ directory (symlink replaced) and managed block at bottom of AGENTS.md with ~/.pi/agent/skills/... paths
  assert.ok(!fs.lstatSync(path.join(home, ".pi", "agent", "agents")).isSymbolicLink(), "symlink should be replaced with real dir");
  const piAgentsMd = fs.readFileSync(path.join(home, ".pi", "agent", "AGENTS.md"), "utf8");
  assert.match(piAgentsMd, /# User Custom Pi Rules/);
  assert.match(piAgentsMd, /<!-- STRATA:START -->/);
  assert.match(piAgentsMd, /~\/\.pi\/agent\/skills\/strata-lifecycle/);

  // Claude gets CLAUDE.md with ~/.claude/skills/... paths
  const claudeMd = fs.readFileSync(path.join(home, ".claude", "CLAUDE.md"), "utf8");
  assert.match(claudeMd, /~\/\.claude\/skills\/strata-lifecycle/);

  // Hermes and agents-global are not deployed by default
  assert.ok(!fs.existsSync(path.join(home, ".hermes", ".strata-manifest.json")), "hermes should not be deployed by default");
  assert.ok(!fs.existsSync(path.join(home, ".agents", ".strata-manifest.json")), "agents-global should not be deployed by default");
  assert.ok(fs.existsSync(path.join(home, ".agents", ".strata-targets.json")), "config file still lives in ~/.agents");
});

test("--add deploys to a custom directory, preserves existing AGENTS.md lines above block, and --remove cleanly strips only the block", (t) => {
  const home = makeHome(t);
  const customDir = path.join(home, ".config", "voidrift");
  fs.mkdirSync(customDir, { recursive: true });
  fs.writeFileSync(path.join(customDir, "AGENTS.md"), "# Voidrift Project Rules\n\nRun npm test.\n");

  const r1 = runDist(home, ["--add", customDir]);
  assert.equal(r1.status, 0, r1.stdout + r1.stderr);
  const mfPath = path.join(customDir, ".strata-manifest.json");
  assert.ok(fs.existsSync(mfPath));
  const mf = JSON.parse(fs.readFileSync(mfPath, "utf8"));
  assert.equal(mf.version, "0.1.0");
  const deployedDoc = fs.readFileSync(path.join(customDir, "AGENTS.md"), "utf8");
  assert.match(deployedDoc, /# Voidrift Project Rules/);
  assert.match(deployedDoc, /<!-- STRATA:START -->/);
  assert.match(deployedDoc, /~\/\.config\/voidrift\/skills\/strata-lifecycle/);

  const r2 = runDist(home, ["--remove", customDir]);
  assert.equal(r2.status, 0, r2.stdout + r2.stderr);
  assert.ok(!fs.existsSync(mfPath), "manifest should be removed on uninstall");
  assert.ok(fs.existsSync(path.join(customDir, "AGENTS.md")), "existing AGENTS.md with user content should remain");
  const afterDoc = fs.readFileSync(path.join(customDir, "AGENTS.md"), "utf8");
  assert.match(afterDoc, /# Voidrift Project Rules/);
  assert.doesNotMatch(afterDoc, /<!-- STRATA:START -->/, "managed Strata block should be stripped on uninstall");
});

test("--targets selects exact targets and uninstalls previously deployed targets omitted from the list", (t) => {
  const home = makeHome(t);
  fs.mkdirSync(path.join(home, ".claude"), { recursive: true });
  fs.mkdirSync(path.join(home, ".gemini"), { recursive: true });

  const r1 = runDist(home, ["--targets", "claude,gemini"]);
  assert.equal(r1.status, 0, r1.stdout + r1.stderr);
  assert.ok(fs.existsSync(path.join(home, ".gemini", "GEMINI.md")));

  // Now omit gemini -> should automatically uninstall gemini
  const r2 = runDist(home, ["--targets", "claude"]);
  assert.equal(r2.status, 0, r2.stdout + r2.stderr);
  assert.ok(!fs.existsSync(path.join(home, ".gemini", "GEMINI.md")));
  assert.ok(!fs.existsSync(path.join(home, ".gemini", ".strata-manifest.json")));
});
