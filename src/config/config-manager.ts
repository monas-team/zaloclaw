import { readFileSync, writeFileSync, copyFileSync, renameSync, mkdirSync, existsSync, chmodSync, openSync, fsyncSync, closeSync, unlinkSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import type { ZaloClawConfig } from "../runtime/types.js";

const DEFAULT_CONFIG_PATH = join(homedir(), ".openclaw", "openclaw.json");
const BACKUP_SUFFIX = ".bak";

export type OpenClawConfig = {
  channels?: {
    "zaloclaw"?: ZaloClawConfig;
    [key: string]: any;
  };
  [key: string]: any;
};

export function readOpenClawConfig(configPath = DEFAULT_CONFIG_PATH): OpenClawConfig {
  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read config: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function writeOpenClawConfig(config: OpenClawConfig, configPath = DEFAULT_CONFIG_PATH): void {
  const content = JSON.stringify(config, null, 2) + "\n";

  // Validate: re-parse to catch serialization issues before touching disk
  try {
    JSON.parse(content);
  } catch (err) {
    throw new Error(`Config serialization produced invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  const dir = dirname(configPath);
  const tmpPath = join(dir, `.zaloclaw-config-${process.pid}-${Date.now()}.tmp`);

  try {
    // Backup existing file before overwriting
    if (existsSync(configPath)) {
      const bakPath = configPath + BACKUP_SUFFIX;
      copyFileSync(configPath, bakPath);
      try { chmodSync(bakPath, 0o600); } catch {}
    }

    // Write to temp file, fsync, then atomic rename
    writeFileSync(tmpPath, content, { mode: 0o600 });
    const fd = openSync(tmpPath, "r");
    try { fsyncSync(fd); } finally { closeSync(fd); }

    // Validate the temp file is readable and valid JSON
    const verification = readFileSync(tmpPath, "utf-8");
    JSON.parse(verification);

    // Atomic rename (same filesystem)
    renameSync(tmpPath, configPath);
  } catch (err) {
    // Clean up temp file on failure; original config is untouched
    try { unlinkSync(tmpPath); } catch {}
    throw new Error(`Failed to write config atomically: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function rollbackConfig(configPath = DEFAULT_CONFIG_PATH): void {
  const bakPath = configPath + BACKUP_SUFFIX;
  if (!existsSync(bakPath)) {
    throw new Error(`No backup file found at ${bakPath}`);
  }
  // Validate backup is valid JSON before restoring
  const content = readFileSync(bakPath, "utf-8");
  try {
    JSON.parse(content);
  } catch {
    throw new Error("Backup file contains invalid JSON; refusing to restore");
  }
  // Atomic restore: write backup content to temp, rename over target
  const dir = dirname(configPath);
  const tmpPath = join(dir, `.zaloclaw-rollback-${process.pid}-${Date.now()}.tmp`);
  try {
    writeFileSync(tmpPath, content, { mode: 0o600 });
    const fd = openSync(tmpPath, "r");
    try { fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(tmpPath, configPath);
  } catch (err) {
    try { unlinkSync(tmpPath); } catch {}
    throw new Error(`Failed to rollback config: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function getZaloClawConfig(config: OpenClawConfig): ZaloClawConfig {
  return config.channels?.["zaloclaw"] ?? {};
}

export function updateZaloClawConfig(
  config: OpenClawConfig,
  updates: Partial<ZaloClawConfig>,
): OpenClawConfig {
  return {
    ...config,
    channels: {
      ...config.channels,
      "zaloclaw": {
        ...getZaloClawConfig(config),
        ...updates,
      },
    },
  };
}

function addToArray<T>(arr: T[] | undefined, entry: T): T[] {
  const existing = arr ?? [];
  if (existing.includes(entry)) return existing;
  return [...existing, entry];
}

function removeFromArray<T>(arr: T[] | undefined, entry: T): T[] {
  const existing = arr ?? [];
  return existing.filter((item) => item !== entry);
}

export function addToDenyFrom(config: OpenClawConfig, userId: string): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const denyFrom = addToArray(zpConfig.denyFrom, userId);
  return updateZaloClawConfig(config, { denyFrom });
}

export function removeFromDenyFrom(config: OpenClawConfig, userId: string): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const denyFrom = removeFromArray(zpConfig.denyFrom, userId);
  return updateZaloClawConfig(config, { denyFrom });
}

export function addToGroupDenyUsers(
  config: OpenClawConfig,
  groupId: string,
  userId: string,
): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const groupConfig = groups[groupId] ?? {};
  const denyUsers = addToArray(groupConfig.denyUsers, userId);
  return updateZaloClawConfig(config, {
    groups: { ...groups, [groupId]: { ...groupConfig, denyUsers } },
  });
}

export function removeFromGroupDenyUsers(
  config: OpenClawConfig,
  groupId: string,
  userId: string,
): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const groupConfig = groups[groupId];
  if (!groupConfig) return config;
  const denyUsers = removeFromArray(groupConfig.denyUsers, userId);
  return updateZaloClawConfig(config, {
    groups: { ...groups, [groupId]: { ...groupConfig, denyUsers } },
  });
}

export function listBlockedUsers(config: OpenClawConfig): Array<string | number> {
  return getZaloClawConfig(config).denyFrom ?? [];
}

export function listAllowedUsers(config: OpenClawConfig): Array<string | number> {
  return getZaloClawConfig(config).allowFrom ?? [];
}

export function addToGroupAllowUsers(
  config: OpenClawConfig,
  groupId: string,
  userId: string,
): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const groupConfig = groups[groupId] ?? {};
  const allowUsers = addToArray(groupConfig.allowUsers, userId);
  return updateZaloClawConfig(config, {
    groups: { ...groups, [groupId]: { ...groupConfig, allowUsers } },
  });
}

export function removeFromGroupAllowUsers(
  config: OpenClawConfig,
  groupId: string,
  userId: string,
): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const groupConfig = groups[groupId];
  if (!groupConfig) return config;
  const allowUsers = removeFromArray(groupConfig.allowUsers, userId);
  return updateZaloClawConfig(config, {
    groups: { ...groups, [groupId]: { ...groupConfig, allowUsers } },
  });
}

export function listAllowedUsersInGroup(config: OpenClawConfig, groupId: string): Array<string | number> {
  return getZaloClawConfig(config).groups?.[groupId]?.allowUsers ?? [];
}

export function listBlockedUsersInGroup(config: OpenClawConfig, groupId: string): Array<string | number> {
  return getZaloClawConfig(config).groups?.[groupId]?.denyUsers ?? [];
}

export function setGroupRequireMention(
  config: OpenClawConfig,
  groupId: string,
  requireMention: boolean,
): OpenClawConfig {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const groupConfig = groups[groupId] ?? {};
  return updateZaloClawConfig(config, {
    groups: { ...groups, [groupId]: { ...groupConfig, requireMention } },
  });
}

export function getGroupRequireMention(
  config: OpenClawConfig,
  groupId: string,
): boolean | undefined {
  const zpConfig = getZaloClawConfig(config);
  const groups = zpConfig.groups ?? {};
  const direct = groups[groupId];
  if (direct && typeof direct.requireMention === "boolean") return direct.requireMention;
  const wildcard = groups["*"];
  if (wildcard && typeof wildcard.requireMention === "boolean") return wildcard.requireMention;
  return undefined;
}
