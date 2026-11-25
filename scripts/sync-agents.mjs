#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Compile and verify per-app subagent files under agents/<app>/ from canonical prompts in agents/prompts/strata-*.md:
//   - agents/kiro/strata-*.json     (all 8 agents, preserving Kiro permission rules and tools)
//   - agents/pi/strata-*.md         (7 specialists, Pi tool names + prompt_mode + exclude_extensions)
//   - agents/claude/strata-*.md     (7 specialists, Claude Code tool names)
//   - agents/qwen/strata-*.md       (7 specialists, Qwen Code tool names + valid Qwen color enum)
//   - agents/opencode/strata-*.md   (7 specialists, OpenCode tool names)
//
// Usage:
//   node scripts/sync-agents.mjs          # compile and write all agents/<app>/ files
//   node scripts/sync-agents.mjs --check  # exit 1 if any agents/<app>/ file is missing or out of sync

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LEGACY_AGENTS = new Set([
  "director", "documenter", "implementer", "planner", "researcher", "reviewer", "security-reviewer", "strata", "strata-keeper"
]);

const PI_TO_QWEN_TOOLS = {
  read: "read_file",
  grep: "grep_search",
  find: "glob",
  ls: "list_directory",
  write: "write_file",
  edit: "edit",
  bash: "run_shell_command",
};

const PI_TO_CLAUDE_TOOLS = {
  read: "Read",
  grep: "Grep",
  find: "Glob",
  ls: "LS",
  write: "Write",
  edit: "Edit",
  bash: "Bash",
};

const PI_TO_OPENCODE_TOOLS = {
  read: "read",
  grep: "grep",
  find: "glob",
  ls: "list",
  write: "write",
  edit: "edit",
  bash: "bash",
};

const QWEN_ALLOWED_COLORS = new Set([
  "red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"
]);

export function parsePromptTemplate(mdText, fallbackName = "") {
  const match = mdText.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      name: fallbackName,
      description: "",
      color: "blue",
      tools: ["read", "grep", "find", "ls", "write", "edit", "bash"],
      promptMode: "append",
      allowedSubagents: null,
      excludeExtensions: null,
      prompt: mdText.trim(),
    };
  }
  const fm = match[1];
  const body = match[2].trim();
  const name = (fm.match(/^name:\s*"?([^"\n]+)"?/m) || [])[1]?.trim() || fallbackName;
  const description = (fm.match(/^description:\s*"?(.+?)"?$/m) || [])[1]?.trim() || "";
  const color = (fm.match(/^color:\s*"?([^"\n]+)"?/m) || [])[1]?.trim() || "blue";
  const toolsLine = (fm.match(/^tools:\s*(.+)$/m) || [])[1] || "";
  const tools = toolsLine.split(",").map((s) => s.trim()).filter(Boolean);
  const promptMode = (fm.match(/^prompt_mode:\s*([^\n]+)/m) || [])[1]?.trim() || null;
  const allowedSubagents = (fm.match(/^allowed_subagents:\s*([^\n]+)/m) || [])[1]?.trim() || null;
  const excludeExtensions = (fm.match(/^exclude_extensions:\s*([^\n]+)/m) || [])[1]?.trim() || null;
  return { name, description, color, tools, promptMode, allowedSubagents, excludeExtensions, prompt: body };
}

function mapTools(piTools, mapping, allowWeb) {
  const mapped = [];
  for (const t of piTools) {
    const m = mapping[t];
    if (m && !mapped.includes(m)) mapped.push(m);
  }
  for (const w of allowWeb) {
    if (!mapped.includes(w)) mapped.push(w);
  }
  return mapped;
}

export function renderAppMarkdownAgent(app, parsed) {
  const { name, description, color, tools, promptMode, allowedSubagents, excludeExtensions, prompt } = parsed;
  const hasWebAccess = !excludeExtensions || !excludeExtensions.includes("pi-web-access");
  const lines = ["---", `name: ${name}`, `description: ${JSON.stringify(description)}`];

  if (app === "pi") {
    if (color) lines.push(`color: ${color}`);
    if (tools.length) lines.push(`tools: ${tools.join(", ")}`);
    if (promptMode) lines.push(`prompt_mode: ${promptMode}`);
    if (allowedSubagents) lines.push(`allowed_subagents: ${allowedSubagents}`);
    if (excludeExtensions) lines.push(`exclude_extensions: ${excludeExtensions}`);
  } else if (app === "claude") {
    const claudeColor = color === "teal" ? "cyan" : color;
    if (claudeColor) lines.push(`color: ${claudeColor}`);
    const claudeTools = mapTools(tools, PI_TO_CLAUDE_TOOLS, hasWebAccess ? ["WebFetch", "WebSearch"] : []);
    if (claudeTools.length) lines.push(`tools: ${claudeTools.join(", ")}`);
  } else if (app === "qwen") {
    const qwenColor = QWEN_ALLOWED_COLORS.has(color) ? color : color === "teal" ? "cyan" : "blue";
    lines.push(`color: ${qwenColor}`);
    const qwenTools = mapTools(tools, PI_TO_QWEN_TOOLS, hasWebAccess ? ["web_fetch", "web_search"] : []);
    if (qwenTools.length) {
      lines.push("tools:");
      for (const t of qwenTools) lines.push(`  - ${t}`);
    }
  } else if (app === "opencode") {
    const ocTools = mapTools(tools, PI_TO_OPENCODE_TOOLS, hasWebAccess ? ["webfetch"] : []);
    lines.push("mode: subagent");
    if (ocTools.length) lines.push(`tools: ${ocTools.join(", ")}`);
  }

  lines.push("---", prompt, "");
  return lines.join("\n");
}

export function renderKiroAgentJson(parsed, existingJsonPath) {
  const { name, description, prompt } = parsed;
  const base = fs.existsSync(existingJsonPath)
    ? JSON.parse(fs.readFileSync(existingJsonPath, "utf8"))
    : { name, description, prompt, tools: ["read", "grep", "glob", "write", "shell"], resources: [], model: "auto" };
  base.name = name;
  if (description) base.description = description;
  base.prompt = prompt;

  if (base.permissions && Array.isArray(base.permissions.rules)) {
    for (const rule of base.permissions.rules) {
      if (Array.isArray(rule.match)) {
        const extras = [];
        for (const m of rule.match) {
          if (LEGACY_AGENTS.has(m)) {
            extras.push(m === "strata" || m === "strata-keeper" ? "strata-architect" : `strata-${m}`);
          }
        }
        for (const e of extras) {
          if (!rule.match.includes(e)) rule.match.push(e);
        }
      }
    }
  }
  return JSON.stringify(base, null, 2) + "\n";
}

export function syncAgents(repoRoot, { check = false } = {}) {
  const promptsDir = path.join(repoRoot, "agents", "prompts");
  const problems = [];
  if (!fs.existsSync(promptsDir)) {
    return [`agents/prompts directory missing at ${promptsDir}`];
  }

  const promptFiles = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".md")).sort();
  if (promptFiles.length === 0) {
    return [`no prompt .md files found in ${promptsDir}`];
  }

  const markdownApps = ["pi", "claude", "qwen", "opencode"];
  const expectedFilesByApp = new Map([
    ["kiro", new Set()],
    ...markdownApps.map((a) => [a, new Set()]),
  ]);

  for (const mdFile of promptFiles) {
    const baseName = path.basename(mdFile, ".md");
    const raw = fs.readFileSync(path.join(promptsDir, mdFile), "utf8");
    const parsed = parsePromptTemplate(raw, baseName);

    // 1. Kiro gets all 8 compiled JSON files (including strata-director.json)
    const kiroRel = path.join("agents", "kiro", `${baseName}.json`);
    const kiroAbs = path.join(repoRoot, kiroRel);
    const expectedKiro = renderKiroAgentJson(parsed, kiroAbs);
    expectedFilesByApp.get("kiro").add(`${baseName}.json`);
    if (!fs.existsSync(kiroAbs)) {
      if (check) problems.push(`missing ${kiroRel}`);
      else {
        fs.mkdirSync(path.dirname(kiroAbs), { recursive: true });
        fs.writeFileSync(kiroAbs, expectedKiro, "utf8");
      }
    } else {
      const current = fs.readFileSync(kiroAbs, "utf8");
      if (current !== expectedKiro) {
        if (check) problems.push(`out of sync: ${kiroRel}`);
        else fs.writeFileSync(kiroAbs, expectedKiro, "utf8");
      }
    }

    // 2. Non-Kiro harnesses enhance their default main agent via AGENTS.md / CLAUDE.md / QWEN.md,
    // so they deploy only the 7 specialist subagents (excluding strata-director.md).
    if (baseName === "strata-director") continue;

    for (const app of markdownApps) {
      const appRel = path.join("agents", app, `${baseName}.md`);
      const appAbs = path.join(repoRoot, appRel);
      const expectedMd = renderAppMarkdownAgent(app, parsed);
      expectedFilesByApp.get(app).add(`${baseName}.md`);
      if (!fs.existsSync(appAbs)) {
        if (check) problems.push(`missing ${appRel}`);
        else {
          fs.mkdirSync(path.dirname(appAbs), { recursive: true });
          fs.writeFileSync(appAbs, expectedMd, "utf8");
        }
      } else {
        const current = fs.readFileSync(appAbs, "utf8");
        if (current !== expectedMd) {
          if (check) problems.push(`out of sync: ${appRel}`);
          else fs.writeFileSync(appAbs, expectedMd, "utf8");
        }
      }
    }
  }

  // Check for unexpected extra files in agents/<app>/
  for (const [app, expectedSet] of expectedFilesByApp.entries()) {
    const appDir = path.join(repoRoot, "agents", app);
    if (!fs.existsSync(appDir)) continue;
    for (const entry of fs.readdirSync(appDir)) {
      if (!expectedSet.has(entry)) {
        const rel = path.join("agents", app, entry);
        if (check) problems.push(`unexpected file in ${rel}`);
        else fs.rmSync(path.join(appDir, entry), { force: true });
      }
    }
  }

  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..");
  const check = process.argv.includes("--check");
  const problems = syncAgents(repoRoot, { check });
  if (problems.length > 0) {
    for (const p of problems) console.error(`sync-agents: ${p}`);
    process.exit(1);
  }
  console.log(check ? "sync-agents: all per-app agent directories in sync" : "sync-agents: generated agents/{kiro,pi,claude,qwen,opencode}");
}
