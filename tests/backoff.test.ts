import { describe, it, expect } from "vitest";
import { ReconnectBackoff, isAuthFailure } from "../src/compat/backoff.js";

describe("ReconnectBackoff", () => {
  it("grows exponentially with jitter inside [half, full]", () => {
    const b = new ReconnectBackoff({ baseMs: 1000, maxMs: 60_000, random: () => 0 });
    expect(b.nextDelayMs()).toBe(500); // 1000 * 0.5
    expect(b.nextDelayMs()).toBe(1000); // 2000 * 0.5
    expect(b.nextDelayMs()).toBe(2000); // 4000 * 0.5
    const hi = new ReconnectBackoff({ baseMs: 1000, maxMs: 60_000, random: () => 1 });
    expect(hi.nextDelayMs()).toBe(1000);
    expect(hi.nextDelayMs()).toBe(2000);
  });

  it("caps at maxMs", () => {
    const b = new ReconnectBackoff({ baseMs: 1000, maxMs: 5000, random: () => 1 });
    for (let i = 0; i < 10; i++) b.nextDelayMs();
    expect(b.nextDelayMs()).toBe(5000);
  });

  it("stops after maxAttempts and resets on success", () => {
    const b = new ReconnectBackoff({ maxAttempts: 3 });
    expect(b.canRetry()).toBe(true);
    b.nextDelayMs(); b.nextDelayMs(); b.nextDelayMs();
    expect(b.canRetry()).toBe(false);
    b.reset();
    expect(b.canRetry()).toBe(true);
    expect(b.attempt).toBe(0);
  });
});

describe("isAuthFailure", () => {
  it("detects dead-session errors", () => {
    expect(isAuthFailure(new Error("Not authenticated. Login with QR first."))).toBe(true);
    expect(isAuthFailure(new Error("Request failed with status 401"))).toBe(true);
    expect(isAuthFailure("session expired")).toBe(true);
  });
  it("treats network blips as retryable", () => {
    expect(isAuthFailure(new Error("ECONNRESET"))).toBe(false);
    expect(isAuthFailure(new Error("getaddrinfo ENOTFOUND wss.zalo.me"))).toBe(false);
    expect(isAuthFailure(new Error("WebSocket closed: code=1006"))).toBe(false);
  });
});
