/**
 * Error-path tests added with the OpenClaw 2026.10.7 upgrade.
 *
 * Covers failure modes that previously had no test coverage:
 * missing credentials / not logged in, send early-return failures,
 * media and file download failures (CDN 404/403, invalid URL),
 * invalid config files, and the dedup / quote-media regressions
 * fixed across v2.5.x.
 *
 * No network is used: CDN responses are stubbed via global fetch,
 * and config tests use temp files only. No new dependencies.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { ThreadType } from "zca-js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { getApi } from "../src/client/zalo-client.js";
import { hasCredentials } from "../src/client/credentials.js";
import { sendMessageZaloClaw, sendLinkZaloClaw } from "../src/channel/send.js";
import { downloadImageFromUrl } from "../src/channel/image-downloader.js";
import { downloadFileFromUrl } from "../src/channel/file-downloader.js";
import {
  readOpenClawConfig,
  getZaloClawConfig,
} from "../src/config/config-manager.js";
import {
  _convertToZaloClawMessage as convertToZaloClawMessage,
  _isDuplicateMsg as isDuplicateMsg,
} from "../src/channel/monitor.js";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zaloclaw-error-paths-"));
  tempDirs.push(dir);
  return dir;
}

function fakeUserMessage(content: unknown, extra: Record<string, unknown> = {}) {
  return {
    type: ThreadType.User,
    threadId: "8034963954397433363",
    isSelf: false,
    data: {
      content,
      uidFrom: "8034963954397433363",
      dName: "Test User",
      ts: "1714555818",
      msgId: `msg-${Math.random()}`,
      cliMsgId: `cli-${Math.random()}`,
      ...extra,
    },
  } as any;
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("not logged in / missing credentials", () => {
  it("getApi rejects with a login hint when no credentials are stored", async () => {
    // Guarded like the existing credentials tests: if this machine
    // happens to hold real credentials, there is nothing to reject.
    if (hasCredentials()) return;
    await expect(getApi()).rejects.toThrow("Not authenticated");
  });
});

describe("send early-return failures (no API call)", () => {
  it("sendMessage rejects an empty threadId without touching the API", async () => {
    await expect(sendMessageZaloClaw("", "hello")).resolves.toEqual({
      ok: false,
      error: "No threadId provided",
    });
    await expect(sendMessageZaloClaw("   ", "hello")).resolves.toEqual({
      ok: false,
      error: "No threadId provided",
    });
  });

  it("sendMessage reports a missing local file instead of uploading", async () => {
    const result = await sendMessageZaloClaw("12345", "hi", {
      localPath: "/tmp/zaloclaw-definitely-missing-2026107.png",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/File not found/);
  });

  it("sendLink rejects an empty URL without touching the API", async () => {
    await expect(sendLinkZaloClaw("12345", "")).resolves.toEqual({
      ok: false,
      error: "No URL provided",
    });
  });
});

describe("media and file download failures", () => {
  function stubFetch(status: number) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status,
        headers: { get: () => null },
        arrayBuffer: async () => new ArrayBuffer(0),
      })),
    );
  }

  it("image download returns undefined on CDN 404 and writes no file", async () => {
    stubFetch(404);
    const dir = makeTempDir();
    const result = await downloadImageFromUrl(
      "https://photo-stal.zdn.vn/fullsize/missing-2026107.jpg",
      dir,
    );
    expect(result).toBeUndefined();
    expect(fs.readdirSync(dir)).toEqual([]);
  });

  it("file download returns undefined on CDN 403 and writes no file", async () => {
    stubFetch(403);
    const dir = makeTempDir();
    const result = await downloadFileFromUrl(
      "https://photo-stal.zdn.vn/files/forbidden-2026107.pdf",
      dir,
    );
    expect(result).toBeUndefined();
    expect(fs.readdirSync(dir)).toEqual([]);
  });

  it("file download returns undefined for an invalid URL instead of throwing", async () => {
    const dir = makeTempDir();
    const result = await downloadFileFromUrl("not-a-url", dir);
    expect(result).toBeUndefined();
  });
});

describe("invalid config files", () => {
  it("readOpenClawConfig throws a wrapped error for a missing file", () => {
    expect(() =>
      readOpenClawConfig("/tmp/zaloclaw-definitely-missing-2026107.json"),
    ).toThrow(/Failed to read config/);
  });

  it("readOpenClawConfig throws a wrapped error for malformed JSON", () => {
    const dir = makeTempDir();
    const badPath = path.join(dir, "openclaw.json");
    fs.writeFileSync(badPath, "{ this is not json");
    expect(() => readOpenClawConfig(badPath)).toThrow(/Failed to read config/);
  });

  it("getZaloClawConfig returns an empty object when no zaloclaw section exists", () => {
    expect(getZaloClawConfig({})).toEqual({});
    expect(getZaloClawConfig({ channels: {} })).toEqual({});
  });
});

describe("dedup and quote-media regressions (v2.5.x)", () => {
  it("dedup flags a repeated msgId but not a new one", () => {
    const id = "error-paths-dedup-2026107";
    expect(isDuplicateMsg(id)).toBe(false);
    expect(isDuplicateMsg(id)).toBe(true);
    expect(isDuplicateMsg(`${id}-other`)).toBe(false);
  });

  it("quote file in params+title format (v2.5.11) is recognised as media", () => {
    const converted = convertToZaloClawMessage(
      fakeUserMessage({
        title: "hello.md",
        href: "https://cdn.example.com/hello.md",
        params: JSON.stringify({
          fileExt: "md",
          fileSize: 123,
          checksum: "abc",
        }),
      }),
    );
    expect(converted?.mediaUrls).toEqual(["https://cdn.example.com/hello.md"]);
    expect(converted?.mediaTypes).toEqual(["application/octet-stream"]);
  });

  it("malformed quote.attach does not crash conversion", () => {
    const msg = fakeUserMessage("hello", {
      quote: { attach: "not-json{{{", msg: "old" },
    });
    let converted;
    expect(() => {
      converted = convertToZaloClawMessage(msg);
    }).not.toThrow();
    expect(converted?.content).toBe("hello");
    expect(converted?.quote?.attach).toBe("not-json{{{");
  });
});
