// SPDX-License-Identifier: MIT
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { syncAgents } from "../scripts/sync-agents.mjs";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

test("real repository agents/{kiro,pi,claude,qwen,opencode} are in sync with agents/prompts", () => {
  assert.deepEqual(syncAgents(repoRoot, { check: true }), []);
});

test("syncAgents compiles app-specific tool names and flags drift in --check mode", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sync-agents-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const promptsDir = path.join(root, "agents", "prompts");
  fs.mkdirSync(promptsDir, { recursive: true });
  fs.writeFileSync(
    path.join(promptsDir, "strata-director.md"),
    '---\nname: strata-director\ndescription: "Lead"\ncolor: purple\ntools: read, grep, find, ls, write, edit, bash\nprompt_mode: append\nallowed_subagents: all\nexclude_extensions: pi-web-access\n---\nDirector body.\n'
  );
  fs.writeFileSync(
    path.join(promptsDir, "strata-planner.md"),
    '---\nname: strata-planner\ndescription: "Planner"\ncolor: blue\ntools: read, grep, find, ls, write, edit\nprompt_mode: append\nexclude_extensions: pi-web-access\n---\nPlanner body.\n'
  );
  fs.writeFileSync(
    path.join(promptsDir, "strata-researcher.md"),
    '---\nname: strata-researcher\ndescription: "Researcher"\ncolor: teal\ntools: read, grep, find, ls, write, edit, bash\nprompt_mode: append\n---\nResearcher body.\n'
  );

  // Initial check fails because per-app files don't exist yet
  assert.ok(syncAgents(root, { check: true }).length > 0);

  // Generate per-app files
  assert.deepEqual(syncAgents(root, { check: false }), []);
  assert.deepEqual(syncAgents(root, { check: true }), []);

  // Kiro has all 3 including strata-director.json
  assert.ok(fs.existsSync(path.join(root, "agents", "kiro", "strata-director.json")));
  assert.ok(fs.existsSync(path.join(root, "agents", "kiro", "strata-planner.json")));

  // Pi, Claude, Qwen, OpenCode exclude strata-director.md and use app-native tool names
  for (const app of ["pi", "claude", "qwen", "opencode"]) {
    assert.ok(!fs.existsSync(path.join(root, "agents", app, "strata-director.md")));
  }

  const qwenPlanner = fs.readFileSync(path.join(root, "agents", "qwen", "strata-planner.md"), "utf8");
  assert.match(qwenPlanner, /- read_file/);
  assert.match(qwenPlanner, /- grep_search/);
  assert.doesNotMatch(qwenPlanner, /run_shell_command/);

  const qwenResearcher = fs.readFileSync(path.join(root, "agents", "qwen", "strata-researcher.md"), "utf8");
  assert.match(qwenResearcher, /color: cyan/); // teal mapped to valid Qwen color cyan
  assert.match(qwenResearcher, /- web_fetch/);

  const claudeResearcher = fs.readFileSync(path.join(root, "agents", "claude", "strata-researcher.md"), "utf8");
  assert.match(claudeResearcher, /tools: Read, Grep, Glob, LS, Write, Edit, Bash, WebFetch, WebSearch/);
});
