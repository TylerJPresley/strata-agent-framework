#!/usr/bin/env node
// Run a plan's acceptance criteria and print a short summary. Full output goes to a log.
// usage: node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <criteria-file> [--timeout SECONDS] [--log FILE] [--check] [--require-review]
// --check only validates the file (parses, no duplicate names, no empty commands, at least one criterion) and runs nothing; exit 2 if invalid.
// --require-review additionally verifies that the sibling <slug>.review.md file exists and starts with "PASS".
// criteria file: one criterion per line, `name :: shell command`; `#` starts a comment.
// A criterion passes when its command exits 0. Exit code: 0 all pass, 1 any fail, 2 usage error.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; };
const VALUE_FLAGS = new Set(["--timeout", "--log"]);
const rawArg = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && VALUE_FLAGS.has(argv[i - 1])));
const file = rawArg && !fs.existsSync(rawArg) && fs.existsSync(path.join("_internal", "plans", `${rawArg}.criteria`))
  ? path.join("_internal", "plans", `${rawArg}.criteria`)
  : rawArg;
const checkOnly = argv.includes("--check");
const requireReview = argv.includes("--require-review");
if (!file || !fs.existsSync(file)) { console.error("usage: verify-plan.mjs <criteria-file|plan-slug> [--timeout SECONDS] [--log FILE] [--check] [--require-review]"); process.exit(2); }
const timeoutMs = (Number(opt("--timeout", 600)) || 600) * 1000;
const logFile = opt("--log", path.join("_internal", "scratch", `verify-${path.basename(file)}.log`));

function checkReviewVerdict() {
  const reviewFile = file.replace(/(\.criteria|\.txt)$/, "") + ".review.md";
  if (!fs.existsSync(reviewFile)) {
    console.log(`FAIL  review-verdict  [missing ${reviewFile} — spawn strata-reviewer in fresh context]`);
    return false;
  }
  const firstLine = (fs.readFileSync(reviewFile, "utf8").split(/\r?\n/).find((l) => l.trim().length > 0) || "").trim();
  if (firstLine !== "PASS") {
    console.log(`FAIL  review-verdict  [${reviewFile} first line is "${firstLine}", expected "PASS"]`);
    return false;
  }
  console.log(`PASS  review-verdict  (${reviewFile})`);
  return true;
}

const criteria = [];
for (const [i, raw] of fs.readFileSync(file, "utf8").split("\n").entries()) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const at = line.indexOf(" :: ");
  if (at < 0) { console.error(`${file}:${i + 1}: expected "name :: command"`); process.exit(2); }
  const c = { name: line.slice(0, at).trim(), cmd: line.slice(at + 4).trim() };
  if (!c.name || !c.cmd) { console.error(`${file}:${i + 1}: empty name or command`); process.exit(2); }
  if (criteria.some((x) => x.name === c.name)) { console.error(`${file}:${i + 1}: duplicate criterion name "${c.name}"`); process.exit(2); }
  criteria.push(c);
}
if (!criteria.length) { console.error("no criteria found"); process.exit(2); }
if (checkOnly) {
  console.log(`ok: ${criteria.length} criteria in ${file}`);
  if (requireReview && !checkReviewVerdict()) process.exit(1);
  process.exit(0);
}

fs.mkdirSync(path.dirname(logFile), { recursive: true });
const log = [];
const results = criteria.map((c) => {
  const t0 = Date.now();
  const r = spawnSync("bash", ["-c", c.cmd], { encoding: "utf8", timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 });
  const timedOut = r.error?.code === "ETIMEDOUT";
  const ok = r.status === 0 && !r.error;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const lastLine = ((r.stdout ?? "") + (r.stderr ?? "")).trim().split("\n").filter(Boolean).pop() ?? "";
  log.push(`=== ${c.name} [${ok ? "PASS" : "FAIL"}] ${secs}s\n$ ${c.cmd}\n${r.stdout ?? ""}${r.stderr ?? ""}${timedOut ? "TIMED OUT\n" : ""}`);
  return { ...c, ok, timedOut, secs, status: r.status, lastLine };
});
fs.writeFileSync(logFile, log.join("\n"));

const failed = results.filter((r) => !r.ok);
console.log(`verify-plan: ${results.length - failed.length}/${results.length} criteria pass  (log: ${logFile})`);
for (const r of results.slice(0, 20)) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  [exit ${r.timedOut ? "timeout" : r.status}] ${r.lastLine.slice(0, 100)}`}`);
if (results.length > 20) console.log(`... ${results.length - 20} more in the log`);

const reviewOk = !requireReview || checkReviewVerdict();

process.exit(failed.length || !reviewOk ? 1 : 0);
