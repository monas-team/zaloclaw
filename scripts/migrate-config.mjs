#!/usr/bin/env node
/**
 * ZaloClaw 2.5.x -> 2.6.x (OpenClaw 2026.10+) config migration.
 *
 * What it does (idempotent, dry-run by default):
 *   1. Backs up openclaw.json and zaloclaw-credentials.json to
 *      ~/.openclaw/.zaloclaw-migration-backup/<timestamp>/ (mode 0700/0600).
 *   2. Ensures plugins.entries.zaloclaw.enabled = true. OpenClaw >= 2026.10
 *      refuses to start an external channel plugin without this explicit
 *      trust flag ("installed without explicit trust").
 *   3. Removes config keys retired upstream that would now only emit warnings
 *      (commands.useAccessGroups).
 *   4. Validates channels.zaloclaw against the plugin's zod schema. On any
 *      validation error it STOPS and prints the issues. It never touches the
 *      credentials/session file beyond copying it to the backup dir.
 *
 * Usage:
 *   node scripts/migrate-config.mjs            # dry run, prints the diff
 *   node scripts/migrate-config.mjs --apply    # write changes
 *   node scripts/migrate-config.mjs --rollback <backup-dir>
 *
 * Secrets: this script never prints token/cookie/imei values. It only reports
 * key names.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const HOME = process.env.OPENCLAW_HOME ?? path.join(os.homedir(), ".openclaw");
const CONFIG = path.join(HOME, "openclaw.json");
const CREDS = path.join(HOME, "zaloclaw-credentials.json");
const BACKUP_ROOT = path.join(HOME, ".zaloclaw-migration-backup");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const rollbackIdx = args.indexOf("--rollback");

function log(msg) { process.stdout.write(msg + "\n"); }
function fail(msg) { process.stderr.write("ERROR: " + msg + "\n"); process.exit(1); }

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { fail(`cannot read/parse ${p}: ${e.message}`); }
}

function backup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(BACKUP_ROOT, stamp);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.copyFileSync(CONFIG, path.join(dir, "openclaw.json"));
  fs.chmodSync(path.join(dir, "openclaw.json"), 0o600);
  if (fs.existsSync(CREDS)) {
    fs.copyFileSync(CREDS, path.join(dir, "zaloclaw-credentials.json"));
    fs.chmodSync(path.join(dir, "zaloclaw-credentials.json"), 0o600);
  }
  return dir;
}

function rollback(dir) {
  if (!fs.existsSync(path.join(dir, "openclaw.json"))) fail(`no openclaw.json in ${dir}`);
  // Snapshot current state before rolling back, so rollback itself is reversible.
  const safety = backup();
  log(`current state saved to ${safety}`);
  fs.copyFileSync(path.join(dir, "openclaw.json"), CONFIG);
  const credBak = path.join(dir, "zaloclaw-credentials.json");
  if (fs.existsSync(credBak)) { fs.copyFileSync(credBak, CREDS); fs.chmodSync(CREDS, 0o600); }
  log(`rolled back config${fs.existsSync(credBak) ? " + credentials" : ""} from ${dir}`);
}

async function loadSchema() {
  // The compiled bundle exports nothing we can reach, so build the schema
  // module on the fly from source with esbuild (dev dependency).
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, "..");
  // Emit next to node_modules so bare "openclaw/..." imports resolve.
  const out = path.join(root, `.schema-probe-${process.pid}.mjs`);
  const { build } = await import(path.join(root, "node_modules", "esbuild", "lib", "main.js"));
  await build({
    entryPoints: [path.join(root, "src", "config", "config-schema.ts")],
    bundle: true, platform: "node", format: "esm", packages: "external",
    outfile: out, logLevel: "error", absWorkingDir: root,
  });
  try { return await import(out); } finally { fs.rmSync(out, { force: true }); }
}

function diffKeys(before, after, prefix = "", acc = []) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const k of keys) {
    const p = prefix ? `${prefix}.${k}` : k;
    const b = before?.[k], a = after?.[k];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    if (b && a && typeof b === "object" && typeof a === "object" && !Array.isArray(b)) diffKeys(b, a, p, acc);
    else acc.push(`${b === undefined ? "+" : a === undefined ? "-" : "~"} ${p}`);
  }
  return acc;
}

async function main() {
  if (rollbackIdx >= 0) {
    const dir = args[rollbackIdx + 1];
    if (!dir) fail("--rollback needs a backup directory");
    return rollback(dir);
  }

  if (!fs.existsSync(CONFIG)) fail(`${CONFIG} not found`);
  const before = readJson(CONFIG);
  const after = structuredClone(before);

  // 1. explicit trust for external plugin
  after.plugins ??= {};
  after.plugins.entries ??= {};
  after.plugins.entries.zaloclaw ??= {};
  if (after.plugins.entries.zaloclaw.enabled !== true) after.plugins.entries.zaloclaw.enabled = true;

  // 2. retired upstream keys
  if (after.commands && "useAccessGroups" in after.commands) {
    delete after.commands.useAccessGroups;
    if (Object.keys(after.commands).length === 0) delete after.commands;
  }

  // 3. validate channel config (if present)
  const channel = after.channels?.zaloclaw;
  if (channel) {
    const { ZaloClawConfigSchema } = await loadSchema();
    const r = ZaloClawConfigSchema.safeParse(channel);
    if (!r.success) {
      log("channels.zaloclaw FAILED schema validation. Nothing written. Issues:");
      for (const i of r.error.issues) log(`  - ${i.path.join(".") || "(root)"}: ${i.message}`);
      process.exit(2);
    }
    log("channels.zaloclaw: schema OK");
  } else {
    log("channels.zaloclaw: not configured (nothing to validate)");
  }

  log(`credentials file: ${fs.existsSync(CREDS) ? "present (will be backed up, not modified)" : "absent"}`);

  const changes = diffKeys(before, after);
  if (changes.length === 0) { log("config already migrated; no changes."); return; }
  log("changes:"); for (const c of changes) log("  " + c);

  if (!apply) { log("\n(dry run) re-run with --apply to write."); return; }

  const dir = backup();
  log(`backup written to ${dir}`);

  // Atomic write: temp file → fsync → validate → rename
  const content = JSON.stringify(after, null, 2) + "\n";
  const tmpPath = CONFIG + `.migrate-${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmpPath, content, { mode: 0o600 });
    const fd = fs.openSync(tmpPath, "r");
    try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    JSON.parse(fs.readFileSync(tmpPath, "utf8"));
    fs.renameSync(tmpPath, CONFIG);
  } catch (writeErr) {
    try { fs.unlinkSync(tmpPath); } catch {}
    fail(`atomic write failed: ${writeErr.message}. Original config is untouched.`);
  }
  log("openclaw.json updated. Rollback: node scripts/migrate-config.mjs --rollback " + dir);
}

main().catch((e) => fail(e?.stack ?? String(e)));
