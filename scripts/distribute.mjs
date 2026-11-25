#!/usr/bin/env node
// Distribute Strata Agent Framework directly into selected AI coding app directories in each tool's native format:
//   - kiro          (~/.kiro)            -> steering/strata-*.md, agents/strata-*.json, skills/strata-*/, hooks/strata-*.json
//   - pi            (~/.pi/agent)        -> AGENTS.md (managed block), agents/strata-*.md, skills/strata-*/
//   - claude        (~/.claude)          -> CLAUDE.md (managed block), agents/strata-*.md, skills/strata-*/
//   - qwen          (~/.qwen)            -> QWEN.md (managed block), agents/strata-*.md, skills/strata-*/
//   - gemini        (~/.gemini)          -> GEMINI.md (managed block), config/skills/strata-*/
//   - hermes        (~/.hermes)          -> SOUL.md (managed block), skills/strata-*/
//   - codex         (~/.codex)           -> AGENTS.md (managed block), skills/strata-*/
//   - opencode      (~/.config/opencode) -> AGENTS.md (managed block), agents/strata-*.md, skills/strata-*/
//   - agents        (~/.agents)          -> optional shared store (steering/, agents/, skills/, hooks/)
//   - plus any custom directory added via `--add <path>[:<layout>]` or key `c` in the checklist
//
// Self-Contained Per-App Deployment:
//   - Each deployed target has its skill/script paths rewritten to that target's own skills folder
//     (e.g. ~/.kiro/skills/..., ~/.pi/agent/skills/..., ~/.claude/skills/...) so no target depends on ~/.agents.
//   - Root instruction files (AGENTS.md, CLAUDE.md, GEMINI.md) use a non-destructive
//     `<!-- STRATA:START --> ... <!-- STRATA:END -->` block appended at the bottom so existing user content above is preserved.
//   - Saved target selection and custom directories live in `~/.agents/.strata-targets.json`.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import readline from "node:readline";
import { execFileSync } from "node:child_process";

const MANIFEST_NAME = ".strata-manifest.json";
const OLD_MANIFEST_NAME = ".ai-framework-manifest.json";
const TARGETS_CONFIG_NAME = ".strata-targets.json";
const BLOCK_START = "<!-- STRATA:START -->";
const BLOCK_END = "<!-- STRATA:END -->";

const LEGACY_SKILLS = new Set([
  "agent-roles", "analysis-requirements", "architecture-design", "backend-engineering", "briefing",
  "cloud-ops", "constraint-driven-development", "context-engineering", "data-engineering", "diagnosing-bugs",
  "discovery", "efficient-workflow", "grilling", "optimization-loop", "orchestration", "planning",
  "portable-summary", "product-strategy", "project-audit", "project-files", "project-lifecycle",
  "real-environment-verification", "reliability-engineering", "research-cache", "retro", "security-audit",
  "security-review", "security-trust", "systems-engineering", "systems-thinking", "teach",
  "to-questionnaire", "triage", "wait-what", "web-engineering", "writing-for-agents"
]);

const LEGACY_STEERING = new Set([
  "concise.md", "confidence-and-conflicts.md", "decision-rights.md", "definition-of-done.md",
  "discovery.md", "features.md", "fix-forward.md", "framing.md", "git-standards.md",
  "plan-and-verify.md", "project-contract.md", "project-files.md", "quality-testing.md",
  "script-first.md", "security.md", "session-tracking.md", "specs.md", "thinking-folder.md"
]);

const LEGACY_AGENTS = new Set([
  "director", "documenter", "implementer", "planner", "researcher", "reviewer", "security-reviewer", "strata", "strata-keeper"
]);

const LEGACY_HOOKS = new Set(["handoff-start.json"]);

const AWS_PREFIXES = [
  "aws-", "amazon-", "launch-with-aws", "signing-in-to-aws",
  "ocr-document-processing-skill", ".aws-cli-skills.lock"
];
const isAwsEntry = (name) => AWS_PREFIXES.some((p) => name === p || name.startsWith(p));

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const arg = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const argsAll = (n) => {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === n && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      out.push(argv[i + 1]);
      i++;
    }
  }
  return out;
};

const here = path.dirname(new URL(import.meta.url).pathname);
const source = path.resolve(arg("--source", path.dirname(here)));
const home = path.resolve(arg("--home", os.homedir()));
const dryRun = flag("--dry-run");
const checkOnly = flag("--check");
const pruneAws = flag("--prune-aws");
const yesFlag = flag("--yes") || flag("-y");
const targetsFlag = arg("--targets", null);
const addSpecs = argsAll("--add");
const removeSpecs = argsAll("--remove");

const shaBuf = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const shaFile = (p) => shaBuf(fs.readFileSync(p));

function expandHome(p) {
  if (!p) return p;
  if (p === "~") return home;
  if (p.startsWith("~/") || p.startsWith("~\\")) return path.join(home, p.slice(2));
  return p;
}

function prettyPath(absPath) {
  const rel = path.relative(home, absPath);
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) {
    return `~/${rel.split(path.sep).join("/")}`;
  }
  return absPath.split(path.sep).join("/");
}

function getSourceVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8")).version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function getSourceEmbeddedMeta() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
    return { version: pkg.version, embedded: pkg.embedded };
  } catch {
    return { version: getSourceVersion() };
  }
}

function syncEmbeddedStrataBlueprints() {
  const defaultUpstream = fs.existsSync(path.resolve(source, "..", "strata-blueprints", "skills", "strata-blueprints", "SKILL.md"))
    ? path.resolve(source, "..", "strata-blueprints", "skills", "strata-blueprints")
    : path.resolve(source, "..", "strata-bp", "skills", "strata-blueprints");
  const upstream = process.env.STRATA_BP_SOURCE || defaultUpstream;
  const syncScript = path.join(source, "scripts", "sync-skill.mjs");
  if (!fs.existsSync(path.join(upstream, "SKILL.md")) || !fs.existsSync(syncScript)) return true;
  const targetDir = path.join(source, "skills");
  try {
    execFileSync(process.execPath, [syncScript, upstream, "--target", targetDir, "--check"], { stdio: "pipe" });
    return true;
  } catch {
    if (checkOnly || dryRun) {
      try {
        execFileSync(process.execPath, [syncScript, upstream, "--target", targetDir, "--check"], { stdio: "inherit" });
      } catch {
        // print diff output
      }
      return false;
    }
    try {
      execFileSync(process.execPath, [syncScript, upstream, "--target", targetDir], { stdio: "inherit" });
      return true;
    } catch {
      return false;
    }
  }
}

function runSyncAgents() {
  const syncScript = path.join(source, "scripts", "sync-agents.mjs");
  if (!fs.existsSync(syncScript)) return true;
  try {
    execFileSync(
      process.execPath,
      checkOnly || dryRun ? [syncScript, "--check"] : [syncScript],
      { stdio: "inherit" }
    );
    return true;
  } catch {
    return false;
  }
}

function runSteeringLint() {
  const lint = path.join(source, "skills", "strata-lifecycle", "scripts", "steering-lint.mjs");
  if (!fs.existsSync(lint)) return true;
  try {
    execFileSync(
      process.execPath,
      [lint, "--steering-dir", path.join(source, "steering"), "--skills-dir", path.join(source, "skills")],
      { stdio: "inherit" }
    );
    return true;
  } catch {
    return false;
  }
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out.sort();
}

function removeEmptyParents(filePath, stopDir) {
  let dir = path.dirname(filePath);
  const stop = path.resolve(stopDir);
  while (dir.startsWith(stop) && dir !== stop) {
    if (!fs.existsSync(dir)) {
      dir = path.dirname(dir);
      continue;
    }
    try {
      if (fs.lstatSync(dir).isSymbolicLink()) break;
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

function parseMarkdownAgent(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { name: path.basename(mdPath, ".md"), description: "", prompt: raw.trim() };
  const fm = match[1];
  const body = match[2].trim();
  const name = (fm.match(/^name:\s*"?([^"\n]+)"?/m) || [])[1] || path.basename(mdPath, ".md");
  const description = (fm.match(/^description:\s*"?(.+?)"?$/m) || [])[1] || "";
  return { name, description, prompt: body };
}

function rewriteSkillsPathBuffer(buf, relPath, targetSkillsPrefix) {
  if (!/\.(md|json|mjs|criteria)$/.test(relPath)) return buf;
  const text = buf.toString("utf8");
  const next = text
    .replaceAll("~/.agents/skills/", `${targetSkillsPrefix}/`)
    .replaceAll("~/.kiro/skills/", `${targetSkillsPrefix}/`);
  return next === text ? buf : Buffer.from(next, "utf8");
}

function compileKiroAgentJson(mdPath, kiroTemplateJsonPath, targetSkillsPrefix) {
  const { name, description, prompt } = parseMarkdownAgent(mdPath);
  const base = fs.existsSync(kiroTemplateJsonPath)
    ? JSON.parse(fs.readFileSync(kiroTemplateJsonPath, "utf8"))
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
  const rawBuf = Buffer.from(JSON.stringify(base, null, 2) + "\n", "utf8");
  return rewriteSkillsPathBuffer(rawBuf, `${name}.json`, targetSkillsPrefix);
}

function buildManagedRootDoc(targetFilePath, strataBodyText, targetSkillsPrefix) {
  const rewrittenBody = strataBodyText
    .trim()
    .replaceAll("~/.agents/skills/", `${targetSkillsPrefix}/`)
    .replaceAll("~/.kiro/skills/", `${targetSkillsPrefix}/`);
  const managedBlock = `${BLOCK_START}\n${rewrittenBody}\n${BLOCK_END}\n`;

  if (!fs.existsSync(targetFilePath)) {
    return Buffer.from(managedBlock, "utf8");
  }

  const existing = fs.readFileSync(targetFilePath, "utf8");
  // If the existing file is an exact legacy raw copy of AGENTS.md (without markers), wrap it in markers
  if (!existing.includes(BLOCK_START) && existing.includes("# Global Agent Guidance (`~/.agents/AGENTS.md`)")) {
    return Buffer.from(managedBlock, "utf8");
  }

  const startIdx = existing.indexOf(BLOCK_START);
  const endIdx = existing.indexOf(BLOCK_END);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = existing.slice(0, startIdx).replace(/\s*$/, "");
    const after = existing.slice(endIdx + BLOCK_END.length).replace(/^\s*/, "");
    const parts = [];
    if (before) parts.push(before);
    parts.push(managedBlock.trimEnd());
    if (after) parts.push(after);
    return Buffer.from(parts.join("\n\n") + "\n", "utf8");
  }

  const trimmed = existing.replace(/\s*$/, "");
  if (!trimmed) return Buffer.from(managedBlock, "utf8");
  return Buffer.from(`${trimmed}\n\n${managedBlock}`, "utf8");
}

function stripManagedRootDoc(targetFilePath) {
  if (!fs.existsSync(targetFilePath)) return;
  const existing = fs.readFileSync(targetFilePath, "utf8");
  const startIdx = existing.indexOf(BLOCK_START);
  const endIdx = existing.indexOf(BLOCK_END);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = existing.slice(0, startIdx).replace(/\s*$/, "");
    const after = existing.slice(endIdx + BLOCK_END.length).replace(/^\s*/, "");
    const remaining = [before, after].filter(Boolean).join("\n\n").trim();
    if (!remaining) {
      fs.rmSync(targetFilePath, { force: true });
    } else {
      fs.writeFileSync(targetFilePath, remaining + "\n", "utf8");
    }
    return;
  }
  // Legacy full-file deploy fallback
  fs.rmSync(targetFilePath, { force: true });
}

function readManifest(harnessRoot) {
  for (const mf of [MANIFEST_NAME, OLD_MANIFEST_NAME]) {
    const p = path.join(harnessRoot, mf);
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch {
        // ignore corrupt manifest
      }
    }
  }
  return null;
}

function layoutSpec(layout) {
  switch (layout) {
    case "kiro":
      return { layout: "kiro", rootDoc: null, skillSubdir: "skills", agentSubdir: "agents", steeringSubdir: "steering", hookSubdir: "hooks" };
    case "claude":
      return { layout: "claude", rootDoc: "CLAUDE.md", skillSubdir: "skills", agentSubdir: "agents" };
    case "qwen":
      return { layout: "qwen", rootDoc: "QWEN.md", skillSubdir: "skills", agentSubdir: "agents" };
    case "gemini":
      return { layout: "gemini", rootDoc: "GEMINI.md", skillSubdir: path.join("config", "skills") };
    case "pi":
    case "opencode":
      return { layout, rootDoc: "AGENTS.md", skillSubdir: "skills", agentSubdir: "agents" };
    case "hermes":
      return { layout: "hermes", rootDoc: "SOUL.md", skillSubdir: "skills" };
    case "codex":
      return { layout: "codex", rootDoc: "AGENTS.md", skillSubdir: "skills" };
    case "agents":
    case "agents-global":
    default:
      return { layout: "agents-global", rootDoc: null, skillSubdir: "skills", agentSubdir: "agents", steeringSubdir: "steering", hookSubdir: "hooks" };
  }
}

function inferLayoutFromDir(absDir, explicitLayout) {
  if (explicitLayout) return explicitLayout;
  const base = path.basename(absDir).toLowerCase();
  const full = absDir.toLowerCase();
  if (base.includes("kiro")) return "kiro";
  if (base.includes("claude")) return "claude";
  if (base.includes("qwen")) return "qwen";
  if (base.includes("gemini")) return "gemini";
  if (full.includes("/.pi/") || base === "pi") return "pi";
  if (base.includes("hermes")) return "hermes";
  if (base.includes("codex")) return "codex";
  if (base.includes("opencode")) return "opencode";
  if (base === ".agents" || base === "agents") return "agents-global";
  return "pi"; // Default for custom project/app folders: AGENTS.md (managed block) + agents/ + skills/
}

function loadTargetsConfig() {
  const cfgPath = path.join(home, ".agents", TARGETS_CONFIG_NAME);
  if (fs.existsSync(cfgPath)) {
    try {
      return JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    } catch {
      // ignore corrupt config
    }
  }
  return { selected: null, custom: [] };
}

function saveTargetsConfig(selectedNames, customList) {
  const cfgDir = path.join(home, ".agents");
  fs.mkdirSync(cfgDir, { recursive: true });
  const cfgPath = path.join(cfgDir, TARGETS_CONFIG_NAME);
  const data = {
    updatedAt: new Date().toISOString(),
    selected: selectedNames,
    custom: customList.map((c) => ({ name: c.name, root: c.root, layout: c.layout })),
  };
  fs.writeFileSync(cfgPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function parseAddSpec(spec) {
  let rawPath = spec;
  let explicitLayout = null;
  const colonIdx = spec.lastIndexOf(":");
  if (colonIdx > 1) {
    const maybeLayout = spec.slice(colonIdx + 1);
    if (["agents", "agents-global", "kiro", "pi", "claude", "qwen", "gemini", "hermes", "codex", "opencode"].includes(maybeLayout)) {
      rawPath = spec.slice(0, colonIdx);
      explicitLayout = maybeLayout === "agents" ? "agents-global" : maybeLayout;
    }
  }
  const absRoot = path.resolve(expandHome(rawPath));
  const layout = inferLayoutFromDir(absRoot, explicitLayout);
  const rawBase = path.basename(absRoot).replace(/^\./, "") || "custom";
  return { name: rawBase, root: absRoot, ...layoutSpec(layout), isCustom: true };
}

const commonTargets = [
  { name: "kiro", root: path.join(home, ".kiro"), ...layoutSpec("kiro"), defaultSelected: true },
  { name: "pi", root: path.join(home, ".pi", "agent"), ...layoutSpec("pi"), defaultSelected: true },
  { name: "claude", root: path.join(home, ".claude"), ...layoutSpec("claude"), defaultSelected: true },
  { name: "qwen", root: path.join(home, ".qwen"), ...layoutSpec("qwen"), defaultSelected: false },
  { name: "gemini", root: path.join(home, ".gemini"), ...layoutSpec("gemini"), defaultSelected: false },
  { name: "hermes", root: path.join(home, ".hermes"), ...layoutSpec("hermes"), defaultSelected: false },
  { name: "codex", root: path.join(home, ".codex"), ...layoutSpec("codex"), defaultSelected: false },
  { name: "opencode", root: path.join(home, ".config", "opencode"), ...layoutSpec("opencode"), defaultSelected: false },
  { name: "agents-global", root: path.join(home, ".agents"), ...layoutSpec("agents-global"), defaultSelected: false },
];

const savedConfig = loadTargetsConfig();
const customTargetsMap = new Map();
for (const c of savedConfig.custom || []) {
  if (c && c.root) {
    const abs = path.resolve(expandHome(c.root));
    customTargetsMap.set(abs, {
      name: c.name || path.basename(abs).replace(/^\./, ""),
      root: abs,
      ...layoutSpec(c.layout || inferLayoutFromDir(abs)),
      isCustom: true,
    });
  }
}

const newlyAddedRoots = new Set();
for (const spec of addSpecs) {
  const parsed = parseAddSpec(spec);
  customTargetsMap.set(parsed.root, parsed);
  newlyAddedRoots.add(parsed.root);
}

const removedSet = new Set();
for (const rem of removeSpecs) {
  const abs = path.resolve(expandHome(rem));
  removedSet.add(rem);
  removedSet.add(abs);
  if (!customTargetsMap.has(abs) && fs.existsSync(abs)) {
    const mf = readManifest(abs);
    const layout = (mf && mf.layout) || inferLayoutFromDir(abs);
    customTargetsMap.set(abs, {
      name: path.basename(abs).replace(/^\./, "") || "custom",
      root: abs,
      ...layoutSpec(layout),
      isCustom: true,
    });
  }
}

const catalog = [...commonTargets, ...customTargetsMap.values()];

function computeTargetPlan(t) {
  const prevManifest = readManifest(t.root);
  const prevFiles = (prevManifest && prevManifest.files) || {};
  const deployedVersion = prevManifest ? prevManifest.version || "legacy" : null;
  const hasManifest = prevManifest !== null;
  const existsOnDisk = fs.existsSync(t.root);
  const desired = new Map();
  const targetSkillsPrefix = prettyPath(path.join(t.root, t.skillSubdir));

  const addDesired = (rel, rawBuf) => {
    const normRel = rel.split(path.sep).join("/");
    const contentBuf = rewriteSkillsPathBuffer(rawBuf, normRel, targetSkillsPrefix);
    desired.set(normRel, {
      tgtPath: path.join(t.root, normRel),
      contentBuf,
      sha: shaBuf(contentBuf),
    });
  };

  const addDir = (srcSubdir, tgtRelPrefix = srcSubdir, filterFn = null) => {
    const srcDir = path.join(source, srcSubdir);
    for (const abs of walk(srcDir)) {
      const subRel = path.relative(srcDir, abs);
      if (filterFn && !filterFn(subRel, abs)) continue;
      addDesired(path.join(tgtRelPrefix, subRel), fs.readFileSync(abs));
    }
  };

  const strataAgentsPath = path.join(source, "templates", "AGENTS.md");
  const strataAgentsText = fs.readFileSync(
    fs.existsSync(strataAgentsPath) ? strataAgentsPath : path.join(source, "AGENTS.md"),
    "utf8"
  );

  if (t.rootDoc) {
    const docBuf = buildManagedRootDoc(path.join(t.root, t.rootDoc), strataAgentsText, targetSkillsPrefix);
    desired.set(t.rootDoc, {
      tgtPath: path.join(t.root, t.rootDoc),
      contentBuf: docBuf,
      sha: shaBuf(docBuf),
      isManagedRootDoc: true,
    });
  }

  if (t.layout === "agents-global") {
    addDir("steering", "steering");
    addDir(fs.existsSync(path.join(source, "agents", "prompts")) ? path.join("agents", "prompts") : "agents", "agents");
    addDir("skills", "skills");
    addDir("hooks", "hooks");
  } else if (t.layout === "kiro") {
    for (const dir of ["steering", "skills", "hooks"]) {
      addDir(dir, dir);
    }
    const kiroAgentsDir = path.join(source, "agents", "kiro");
    if (fs.existsSync(kiroAgentsDir)) {
      addDir(path.join("agents", "kiro"), "agents");
    } else {
      const agentsDir = fs.existsSync(path.join(source, "agents", "prompts"))
        ? path.join(source, "agents", "prompts")
        : path.join(source, "agents");
      if (fs.existsSync(agentsDir)) {
        for (const mdFile of fs.readdirSync(agentsDir).filter((x) => x.endsWith(".md")).sort()) {
          const baseName = path.basename(mdFile, ".md");
          const mdPath = path.join(agentsDir, mdFile);
          const tmplPath = path.join(source, "agents-kiro", `${baseName}.json`);
          addDesired(`agents/${baseName}.json`, compileKiroAgentJson(mdPath, tmplPath, targetSkillsPrefix));
        }
      }
    }
  } else {
    // Non-Kiro harnesses deploy from their dedicated per-app folder (agents/<layout>/),
    // falling back to agents/pi/ or agents/prompts/ when a custom layout is used.
    if (t.agentSubdir) {
      const appAgentRel = fs.existsSync(path.join(source, "agents", t.layout))
        ? path.join("agents", t.layout)
        : fs.existsSync(path.join(source, "agents", "pi"))
          ? path.join("agents", "pi")
          : "agents";
      addDir(appAgentRel, t.agentSubdir, (subRel) => subRel !== "strata-director.md");
    }
    if (t.skillSubdir) addDir("skills", t.skillSubdir);
  }

  // Detect if any target subdir is currently a legacy symlink (e.g. ~/.pi/agent/agents -> ~/.agents/agents)
  const symlinkSubdirs = new Set();
  for (const sub of [t.skillSubdir, t.agentSubdir, t.steeringSubdir, t.hookSubdir].filter(Boolean)) {
    const p = path.join(t.root, sub);
    try {
      if (fs.lstatSync(p).isSymbolicLink()) symlinkSubdirs.add(sub.split(path.sep).join("/"));
    } catch {
      // does not exist
    }
  }
  t.symlinkSubdirs = symlinkSubdirs;

  const ops = [];
  for (const [rel, item] of desired.entries()) {
    const underSymlink = [...symlinkSubdirs].some((s) => rel === s || rel.startsWith(s + "/"));
    if (underSymlink || !fs.existsSync(item.tgtPath)) {
      ops.push({ harness: t.name, status: "NEW", rel, ...item });
    } else {
      const diskSha = shaFile(item.tgtPath);
      if (diskSha === item.sha) {
        ops.push({ harness: t.name, status: "SAME", rel, ...item });
      } else if (prevFiles[rel] && prevFiles[rel] !== diskSha) {
        ops.push({ harness: t.name, status: "DRIFTED", rel, ...item });
      } else {
        ops.push({ harness: t.name, status: "CHANGED", rel, ...item });
      }
    }
  }

  const scheduleDeleteIfAbsent = (fAbs) => {
    const rel = path.relative(t.root, fAbs).split(path.sep).join("/");
    if (!desired.has(rel) && !ops.some((o) => o.rel === rel)) {
      ops.push({ harness: t.name, status: "DELETE", rel, tgtPath: fAbs });
    }
  };

  for (const oldRel of Object.keys(prevFiles)) {
    if (!desired.has(oldRel)) {
      const oldPath = path.join(t.root, oldRel);
      if (fs.existsSync(oldPath)) scheduleDeleteIfAbsent(oldPath);
    }
  }

  const oldMfPath = path.join(t.root, OLD_MANIFEST_NAME);
  if (fs.existsSync(oldMfPath)) scheduleDeleteIfAbsent(oldMfPath);

  if (t.skillSubdir && !symlinkSubdirs.has(t.skillSubdir.split(path.sep).join("/"))) {
    const skillRoot = path.join(t.root, t.skillSubdir);
    if (fs.existsSync(skillRoot)) {
      for (const entry of fs.readdirSync(skillRoot)) {
        const isStrataOrLegacy = entry.startsWith("strata-") || LEGACY_SKILLS.has(entry);
        const isAws = pruneAws && isAwsEntry(entry);
        if (isStrataOrLegacy || isAws) {
          const entryAbs = path.join(skillRoot, entry);
          const files = fs.statSync(entryAbs).isDirectory() ? walk(entryAbs) : [entryAbs];
          for (const fAbs of files) scheduleDeleteIfAbsent(fAbs);
        }
      }
    }
  }

  if (t.steeringSubdir && !symlinkSubdirs.has(t.steeringSubdir.split(path.sep).join("/"))) {
    const stRoot = path.join(t.root, t.steeringSubdir);
    if (fs.existsSync(stRoot)) {
      for (const entry of fs.readdirSync(stRoot)) {
        if (entry.startsWith("strata-") || LEGACY_STEERING.has(entry)) {
          scheduleDeleteIfAbsent(path.join(stRoot, entry));
        }
      }
    }
  }

  if (t.agentSubdir && !symlinkSubdirs.has(t.agentSubdir.split(path.sep).join("/"))) {
    const agRoot = path.join(t.root, t.agentSubdir);
    if (fs.existsSync(agRoot)) {
      for (const entry of fs.readdirSync(agRoot)) {
        const base = entry.replace(/\.(md|json)$/, "");
        if (base.startsWith("strata-") || LEGACY_AGENTS.has(base)) {
          scheduleDeleteIfAbsent(path.join(agRoot, entry));
        }
      }
    }
  }

  if (t.hookSubdir && !symlinkSubdirs.has(t.hookSubdir.split(path.sep).join("/"))) {
    const hkRoot = path.join(t.root, t.hookSubdir);
    if (fs.existsSync(hkRoot)) {
      for (const entry of fs.readdirSync(hkRoot)) {
        if (entry.startsWith("strata-") || LEGACY_HOOKS.has(entry)) {
          scheduleDeleteIfAbsent(path.join(hkRoot, entry));
        }
      }
    }
  }

  const counts = { NEW: 0, CHANGED: 0, DRIFTED: 0, DELETE: 0, SAME: 0 };
  for (const o of ops) counts[o.status] = (counts[o.status] || 0) + 1;
  const mutations = counts.NEW + counts.CHANGED + counts.DRIFTED + counts.DELETE;

  let selected = false;
  if (removedSet.has(t.name) || removedSet.has(t.root)) {
    selected = false;
  } else if (targetsFlag) {
    const wanted = new Set(targetsFlag.split(",").map((s) => s.trim()).filter(Boolean));
    selected = wanted.has(t.name) || wanted.has(t.root) || (t.name === "agents-global" && wanted.has("agents"));
  } else if (newlyAddedRoots.has(t.root)) {
    selected = true;
  } else if (Array.isArray(savedConfig.selected)) {
    selected = savedConfig.selected.includes(t.name) || savedConfig.selected.includes(t.root);
  } else if (hasManifest) {
    selected = true;
  } else {
    selected = Boolean(t.defaultSelected && existsOnDisk);
  }

  t.hasManifest = hasManifest;
  t.deployedVersion = deployedVersion;
  t.prevFiles = prevFiles;
  t.existsOnDisk = existsOnDisk;
  t.desired = desired;
  t.ops = ops;
  t.counts = counts;
  t.mutations = mutations;
  t.selected = selected;
}

if (!checkOnly) {
  if (!syncEmbeddedStrataBlueprints()) {
    console.error("distribute: strata-blueprints sync check failed; aborting");
    process.exit(1);
  }
  if (!runSyncAgents()) {
    console.error("distribute: sync-agents failed; aborting");
    process.exit(1);
  }
  if (!runSteeringLint()) {
    console.error("distribute: steering-lint failed; aborting");
    process.exit(1);
  }
}

const srcVersion = getSourceVersion();
for (const t of catalog) computeTargetPlan(t);

function formatChecklistStatus(t) {
  if (!t.selected) {
    if (t.hasManifest) {
      const managedCount = Object.keys(t.prevFiles).length;
      return `v${t.deployedVersion} -> WILL UNINSTALL (${managedCount} files)`;
    }
    if (t.existsOnDisk) return "not deployed (detected on disk)";
    return "not found on disk";
  }

  const c = t.counts;
  const parts = [];
  if (c.NEW) parts.push(`${c.NEW} new`);
  if (c.CHANGED) parts.push(`${c.CHANGED} changed`);
  if (c.DRIFTED) parts.push(`${c.DRIFTED} drifted`);
  if (c.DELETE) parts.push(`${c.DELETE} delete`);

  if (!t.hasManifest) {
    return `NEW DEPLOY -> v${srcVersion} (${parts.join(", ") || `${t.desired.size} files`})`;
  }
  const verLabel =
    t.deployedVersion !== srcVersion ? `v${t.deployedVersion} -> v${srcVersion}` : `v${t.deployedVersion}`;
  if (t.mutations === 0 && t.deployedVersion === srcVersion) {
    return `${verLabel} · up to date (${c.SAME} files)`;
  }
  return `${verLabel} · UPDATE: ${parts.join(", ") || "version metadata"}`;
}

async function runInteractiveChecklist(items) {
  return new Promise((resolvePromise) => {
    let cursor = 0;
    let promptCustom = false;
    let customInput = "";
    const stdin = process.stdin;
    const stdout = process.stdout;
    let lastLines = 0;

    const render = () => {
      if (lastLines > 0) {
        stdout.write(`\x1b[${lastLines}A\x1b[0J`);
      }
      const lines = [];
      lines.push(`Strata Agent Framework v${srcVersion}`);
      lines.push(`Select targets (↑/↓ move, Space toggle, c add custom dir, a all-detected, n none, Enter confirm, q quit):`);
      lines.push(`Tip: pass --add <dir>[:layout] or press 'c' to add a custom directory (e.g. ~/.config/voidrift)`);
      lines.push(``);
      for (let i = 0; i < items.length; i++) {
        const t = items[i];
        const pointer = !promptCustom && i === cursor ? ">" : " ";
        const box = t.selected ? "[x]" : "[ ]";
        const nameCol = `${i + 1}. ${t.name}`.padEnd(17);
        const pathCol = prettyPath(t.root).padEnd(22);
        const statusCol = formatChecklistStatus(t);
        lines.push(`${pointer} ${box} ${nameCol} ${pathCol} ${statusCol}`);
      }
      if (promptCustom) {
        lines.push(``);
        lines.push(`Add custom directory (path[:layout], Enter to add, Esc to cancel): ${customInput}`);
      }
      stdout.write(lines.join("\n") + "\n");
      lastLines = lines.length;
    };

    readline.emitKeypressEvents(stdin);
    const wasRaw = stdin.isRaw;
    if (stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    render();

    const cleanup = () => {
      stdin.removeListener("keypress", onKey);
      if (stdin.setRawMode) stdin.setRawMode(Boolean(wasRaw));
      stdin.pause();
    };

    const onKey = (str, key) => {
      if (!key) return;
      if (promptCustom) {
        if (key.ctrl && key.name === "c") {
          cleanup();
          stdout.write("\ndistribute: cancelled\n");
          process.exit(0);
        }
        if (key.name === "escape") {
          promptCustom = false;
          customInput = "";
          render();
          return;
        }
        if (key.name === "return" || key.name === "enter") {
          const spec = customInput.trim();
          promptCustom = false;
          customInput = "";
          if (spec) {
            const parsed = parseAddSpec(spec);
            computeTargetPlan(parsed);
            parsed.selected = true;
            customTargetsMap.set(parsed.root, parsed);
            const existingIdx = items.findIndex((x) => x.root === parsed.root);
            if (existingIdx >= 0) {
              items[existingIdx] = parsed;
              cursor = existingIdx;
            } else {
              items.push(parsed);
              cursor = items.length - 1;
            }
          }
          render();
          return;
        }
        if (key.name === "backspace") {
          customInput = customInput.slice(0, -1);
          render();
          return;
        }
        if (str && !key.ctrl && !key.meta && str.length === 1 && str >= " ") {
          customInput += str;
          render();
        }
        return;
      }

      if ((key.ctrl && key.name === "c") || key.name === "q" || key.name === "escape") {
        cleanup();
        stdout.write("\ndistribute: cancelled\n");
        process.exit(0);
      }
      if (key.name === "return" || key.name === "enter") {
        cleanup();
        stdout.write("\n");
        resolvePromise();
        return;
      }
      if (str === "c" || str === "+") {
        promptCustom = true;
        customInput = "";
        render();
      } else if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + items.length) % items.length;
        render();
      } else if (key.name === "down" || key.name === "j") {
        cursor = (cursor + 1) % items.length;
        render();
      } else if (key.name === "space") {
        items[cursor].selected = !items[cursor].selected;
        render();
      } else if (str === "a") {
        for (const t of items) {
          if (t.existsOnDisk || t.hasManifest || t.isCustom) t.selected = true;
        }
        render();
      } else if (str === "n") {
        for (const t of items) t.selected = false;
        render();
      } else if (str >= "1" && str <= "9") {
        const idx = Number(str) - 1;
        if (idx < items.length) {
          cursor = idx;
          items[idx].selected = !items[idx].selected;
          render();
        }
      }
    };

    stdin.on("keypress", onKey);
  });
}

const shouldPrompt =
  !checkOnly &&
  !yesFlag &&
  !targetsFlag &&
  process.stdin.isTTY &&
  process.stdout.isTTY;

if (shouldPrompt) {
  await runInteractiveChecklist(catalog);
}

const activeTargets = catalog.filter((t) => t.selected);
const uninstallTargets = catalog.filter((t) => !t.selected && t.hasManifest);

console.log(`Source: ${source} (v${srcVersion})`);
console.log(
  `Active targets: ${activeTargets.map((t) => `${t.name} (${prettyPath(t.root)})`).join(", ") || "none"}\n`
);

let totalMutations = 0;
for (const t of activeTargets) {
  const c = t.counts;
  totalMutations += t.mutations;
  const verNote = t.deployedVersion ? ` [deployed: v${t.deployedVersion}]` : " [new]";
  console.log(
    `[${t.name}] ${t.root}${verNote}: ${c.NEW} NEW, ${c.CHANGED} CHANGED, ${c.DRIFTED} DRIFTED, ${c.DELETE} DELETE, ${c.SAME} SAME`
  );
  for (const o of t.ops.filter((x) => x.status !== "SAME")) {
    console.log(`  ${o.status.padEnd(7)} ${o.rel}`);
  }
}

for (const t of uninstallTargets) {
  const filesToRemove = Object.keys(t.prevFiles).filter((rel) => fs.existsSync(path.join(t.root, rel)));
  totalMutations += filesToRemove.length + 1;
  console.log(`[${t.name}] ${t.root} [deployed: v${t.deployedVersion}]: UNINSTALL (${filesToRemove.length} managed file(s))`);
}

if (checkOnly) {
  const bpOk = syncEmbeddedStrataBlueprints();
  const agentsOk = runSyncAgents();
  const lintOk = runSteeringLint();
  if (totalMutations > 0 || !lintOk || !bpOk || !agentsOk) {
    console.log(
      `\ncheck: ${totalMutations} file(s) out of sync${!lintOk ? " (and steering-lint failed)" : ""}${!bpOk ? " (and strata-blueprints out of sync)" : ""}${!agentsOk ? " (and agents/<app>/ out of sync)" : ""}`
    );
    process.exit(1);
  }
  console.log("\ncheck: all selected harnesses match manifest and lint passed");
  process.exit(0);
}

if (dryRun) {
  console.log("\ndry-run: no files written or deleted");
  process.exit(0);
}

const pkgMeta = getSourceEmbeddedMeta();
for (const t of activeTargets) {
  for (const sub of t.symlinkSubdirs || []) {
    const symPath = path.join(t.root, sub);
    try {
      if (fs.lstatSync(symPath).isSymbolicLink()) fs.unlinkSync(symPath);
    } catch {
      // ignore
    }
  }
  for (const o of t.ops) {
    if (o.status === "NEW" || o.status === "CHANGED" || o.status === "DRIFTED") {
      fs.mkdirSync(path.dirname(o.tgtPath), { recursive: true });
      fs.writeFileSync(o.tgtPath, o.contentBuf);
    } else if (o.status === "DELETE") {
      if (o.rel === t.rootDoc) {
        stripManagedRootDoc(o.tgtPath);
      } else {
        fs.rmSync(o.tgtPath, { force: true });
        removeEmptyParents(o.tgtPath, t.root);
      }
    }
  }
  const manifestObj = {
    managedBy: "strata-agent-framework",
    ...pkgMeta,
    source,
    layout: t.layout,
    updatedAt: new Date().toISOString(),
    files: Object.fromEntries([...t.desired.entries()].map(([rel, item]) => [rel, item.sha])),
  };
  fs.mkdirSync(t.root, { recursive: true });
  fs.writeFileSync(path.join(t.root, MANIFEST_NAME), JSON.stringify(manifestObj, null, 2) + "\n", "utf8");
}

for (const t of uninstallTargets) {
  for (const rel of Object.keys(t.prevFiles)) {
    const p = path.join(t.root, rel);
    if (t.rootDoc && rel === t.rootDoc) {
      stripManagedRootDoc(p);
    } else if (fs.existsSync(p)) {
      fs.rmSync(p, { force: true });
      removeEmptyParents(p, t.root);
    }
  }
  for (const mf of [MANIFEST_NAME, OLD_MANIFEST_NAME]) {
    const mfPath = path.join(t.root, mf);
    if (fs.existsSync(mfPath)) fs.rmSync(mfPath, { force: true });
  }
}

const remainingCustom = [...customTargetsMap.values()].filter((c) => !removedSet.has(c.name) && !removedSet.has(c.root));
saveTargetsConfig(
  activeTargets.map((t) => (t.isCustom ? t.root : t.name)),
  remainingCustom
);

console.log(
  `\ndistribute: applied ${totalMutations} change(s) across ${activeTargets.length} active harness(es)` +
    (uninstallTargets.length ? ` and uninstalled ${uninstallTargets.length} harness(es)` : "")
);
console.log(`tip: add a custom directory anytime with --add <dir>[:layout] (e.g. node scripts/distribute.mjs --add ~/.config/voidrift)`);
