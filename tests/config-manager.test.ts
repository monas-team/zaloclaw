import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync, chmodSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readOpenClawConfig, writeOpenClawConfig, rollbackConfig } from "../src/config/config-manager.js";

const TEST_DIR = join(tmpdir(), `zaloclaw-config-test-${process.pid}`);
const CONFIG_PATH = join(TEST_DIR, "openclaw.json");

function writeRaw(path: string, data: object): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
}

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("writeOpenClawConfig (atomic)", () => {
  it("writes valid JSON that can be read back", () => {
    const config = { channels: { zaloclaw: { enabled: true } } };
    writeRaw(CONFIG_PATH, { old: true });
    writeOpenClawConfig(config, CONFIG_PATH);
    const result = readOpenClawConfig(CONFIG_PATH);
    expect(result.channels?.zaloclaw?.enabled).toBe(true);
  });

  it("creates a .bak backup of the previous file", () => {
    const original = { version: 1 };
    writeRaw(CONFIG_PATH, original);
    writeOpenClawConfig({ version: 2 } as any, CONFIG_PATH);
    const bakPath = CONFIG_PATH + ".bak";
    expect(existsSync(bakPath)).toBe(true);
    const backup = JSON.parse(readFileSync(bakPath, "utf-8"));
    expect(backup.version).toBe(1);
  });

  it("sets mode 0600 on the written file", () => {
    writeRaw(CONFIG_PATH, {});
    writeOpenClawConfig({ test: true } as any, CONFIG_PATH);
    const stats = statSync(CONFIG_PATH);
    expect(stats.mode & 0o777).toBe(0o600);
  });

  it("preserves original file if write target dir does not exist", () => {
    const badPath = join(TEST_DIR, "nonexistent", "subdir", "config.json");
    expect(() => writeOpenClawConfig({ test: true } as any, badPath)).toThrow();
  });

  it("does not leave temp files on failure", () => {
    const badPath = join(TEST_DIR, "nonexistent", "config.json");
    try { writeOpenClawConfig({} as any, badPath); } catch {}
    const files = require("node:fs").readdirSync(TEST_DIR);
    const temps = files.filter((f: string) => f.includes(".tmp"));
    expect(temps).toHaveLength(0);
  });

  it("works when target file does not yet exist (fresh install)", () => {
    writeOpenClawConfig({ fresh: true } as any, CONFIG_PATH);
    expect(existsSync(CONFIG_PATH)).toBe(true);
    const result = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    expect(result.fresh).toBe(true);
  });
});

describe("rollbackConfig", () => {
  it("restores from .bak file", () => {
    writeRaw(CONFIG_PATH, { version: 1 });
    writeOpenClawConfig({ version: 2 } as any, CONFIG_PATH);
    const current = readOpenClawConfig(CONFIG_PATH);
    expect((current as any).version).toBe(2);

    rollbackConfig(CONFIG_PATH);
    const restored = readOpenClawConfig(CONFIG_PATH);
    expect((restored as any).version).toBe(1);
  });

  it("throws when no backup exists", () => {
    writeRaw(CONFIG_PATH, {});
    expect(() => rollbackConfig(CONFIG_PATH)).toThrow("No backup file");
  });

  it("refuses to restore invalid JSON backup", () => {
    writeRaw(CONFIG_PATH, { ok: true });
    writeFileSync(CONFIG_PATH + ".bak", "not valid json{{{", "utf-8");
    expect(() => rollbackConfig(CONFIG_PATH)).toThrow("invalid JSON");
  });
});

describe("readOpenClawConfig", () => {
  it("reads valid config", () => {
    writeRaw(CONFIG_PATH, { channels: { zaloclaw: { dmPolicy: "open" } } });
    const config = readOpenClawConfig(CONFIG_PATH);
    expect(config.channels?.zaloclaw?.dmPolicy).toBe("open");
  });

  it("throws for missing file", () => {
    expect(() => readOpenClawConfig(join(TEST_DIR, "nonexistent.json"))).toThrow("Failed to read config");
  });

  it("throws for invalid JSON", () => {
    writeFileSync(CONFIG_PATH, "{bad json", "utf-8");
    expect(() => readOpenClawConfig(CONFIG_PATH)).toThrow("Failed to read config");
  });
});
