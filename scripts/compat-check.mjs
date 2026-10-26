#!/usr/bin/env node
/**
 * Compatibility gate: verifies this plugin against the OpenClaw version
 * resolvable from node_modules (or OPENCLAW_PATH), then updates
 * docs/COMPAT.md with a PASS/FAIL row.
 *
 * Checks (all must pass):
 *   1. Every `openclaw/plugin-sdk/<sub>` subpath imported by src/ is exported
 *      by the installed openclaw package.json "exports" map.
 *   2. `tsc --noEmit` has zero errors.
 *   3. `vitest run` passes.
 *   4. `npm run build` succeeds and the bundle imports under plain Node and
 *      registers a channel with id "zaloclaw".
 *   5. The bundle contains no native addon dependency (`sharp` regression guard).
 *
 * Usage: node scripts/compat-check.mjs [--no-write]
 * Exit code 0 = PASS, 1 = FAIL.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const noWrite = process.argv.includes("--no-write");

const ocRoot = process.env.OPENCLAW_PATH ?? path.join(root, "node_modules", "openclaw");
const ocPkg = JSON.parse(fs.readFileSync(path.join(ocRoot, "package.json"), "utf8"));
const ocVersion = ocPkg.version;
const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass, detail }); process.stdout.write(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}\n`); };

// 1. subpath exports
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== "dist") yield* walk(p); } else if (p.endsWith(".ts")) yield p; } }
const used = new Set();
for (const f of [...walk(path.join(root, "src")), path.join(root, "index.ts")]) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/from\s+["'](openclaw\/[^"']+)["']/g)) used.add(m[1].replace(/^openclaw/, "."));
}
const missing = [...used].filter((k) => !ocPkg.exports?.[k]);
ok("sdk subpath exports", missing.length === 0, missing.length ? "missing: " + missing.join(", ") : `${used.size} subpaths`);

// 2. tsc
const tsc = spawnSync("npx", ["tsc", "--noEmit"], { cwd: root, encoding: "utf8" });
ok("tsc --noEmit", tsc.status === 0, tsc.status === 0 ? "" : (tsc.stdout + tsc.stderr).split("\n").filter((l) => /error TS/.test(l)).slice(0, 3).join(" | "));

// 3. vitest
const vt = spawnSync("npx", ["vitest", "run", "--reporter=dot"], { cwd: root, encoding: "utf8" });
const vtSummary = (vt.stdout + vt.stderr).split("\n").find((l) => /Tests\s+\d+/.test(l))?.trim() ?? "";
ok("vitest", vt.status === 0, vtSummary);

// 4. build + import smoke
const build = spawnSync("npm", ["run", "build", "--silent"], { cwd: root, encoding: "utf8" });
let smokePass = false, smokeDetail = "";
if (build.status === 0) {
  const probe = `
    const m = await import(${JSON.stringify(path.join(root, "dist", "index.js"))});
    let ch = null; m.default.register({ runtime: new Proxy({}, { get: () => () => {} }), registerChannel: (x) => { ch = x.plugin; }, registerTool: () => {} });
    if (ch?.id !== "zaloclaw") throw new Error("channel not registered");
    console.log("ok");`;
  const sm = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: root, encoding: "utf8" });
  smokePass = sm.status === 0 && /ok/.test(sm.stdout);
  smokeDetail = smokePass ? "" : (sm.stderr.split("\n")[0] ?? "").slice(0, 160);
} else smokeDetail = "build failed";
ok("build + import smoke", smokePass, smokeDetail);

// 5. no native addon deps
const bundle = fs.existsSync(path.join(root, "dist", "index.js")) ? fs.readFileSync(path.join(root, "dist", "index.js"), "utf8") : "";
ok("no sharp import (native addon guard)", !/from\s+"sharp"|require\("sharp"\)/.test(bundle));

const pass = results.every((r) => r.pass);
const pluginVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
process.stdout.write(`\nRESULT: ${pass ? "PASS" : "FAIL"}  zaloclaw ${pluginVersion} on OpenClaw ${ocVersion} (node ${process.version})\n`);

if (!noWrite) {
  const manifestPath = path.join(root, "docs", "COMPAT.md");
  let md = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";
  const marker = "<!-- compat-matrix -->";
  if (!md.includes(marker)) md += `\n\n## Verified matrix\n\n${marker}\n| ZaloClaw | OpenClaw | Node | Result | Date | Notes |\n|---|---|---|---|---|---|\n`;
  const date = new Date().toISOString().slice(0, 10);
  const failing = results.filter((r) => !r.pass).map((r) => r.name).join(", ");
  const row = `| ${pluginVersion} | ${ocVersion} | ${process.version} | ${pass ? "PASS" : "FAIL"} | ${date} | ${pass ? "automated gate" : "failed: " + failing} |`;
  const lines = md.split("\n");
  const idx = lines.findIndex((l) => l.startsWith(`| ${pluginVersion} | ${ocVersion} |`));
  if (idx >= 0) lines[idx] = row;
  else { const mk = lines.findIndex((l) => l.includes(marker)); const h = lines.findIndex((l, i) => i > mk && l.startsWith("|---")); lines.splice(h + 1, 0, row); }
  fs.writeFileSync(manifestPath, lines.join("\n"));
  process.stdout.write(`updated ${path.relative(root, manifestPath)}\n`);
}
process.exit(pass ? 0 : 1);
