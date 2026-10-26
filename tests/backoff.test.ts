import { describe, it, expect } from "vitest";
import { ReconnectBackoff, isAuthFailure, classifyError, isRetryable } from "../src/compat/backoff.js";

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

describe("classifyError", () => {
  it("classifies expired/invalid session as auth_expired", () => {
    expect(classifyError(new Error("Not authenticated. Login with QR first."))).toBe("auth_expired");
    expect(classifyError("session expired")).toBe("auth_expired");
    expect(classifyError(new Error("session invalid"))).toBe("auth_expired");
    expect(classifyError(new Error("invalid cookie header"))).toBe("auth_expired");
    expect(classifyError(new Error("checkpoint required"))).toBe("auth_expired");
    expect(classifyError(new Error("account locked"))).toBe("auth_expired");
    expect(classifyError(new Error("account banned"))).toBe("auth_expired");
    expect(classifyError(new Error("account blocked"))).toBe("auth_expired");
  });

  it("classifies 401 as unauthorized", () => {
    expect(classifyError(new Error("Request failed with status 401"))).toBe("unauthorized");
    expect(classifyError(new Error("Unauthorized access"))).toBe("unauthorized");
  });

  it("classifies 403 as forbidden (not auth_expired)", () => {
    expect(classifyError(new Error("Request failed with status 403"))).toBe("forbidden");
    expect(classifyError(new Error("Forbidden"))).toBe("forbidden");
  });

  it("classifies 429 and rate-limit messages", () => {
    expect(classifyError(new Error("Request failed with status 429"))).toBe("rate_limit");
    expect(classifyError(new Error("rate limit exceeded"))).toBe("rate_limit");
    expect(classifyError(new Error("Too many requests"))).toBe("rate_limit");
    expect(classifyError(new Error("request throttled"))).toBe("rate_limit");
  });

  it("classifies WAF/temporary blocks", () => {
    expect(classifyError(new Error("WAF blocked request"))).toBe("waf_block");
    expect(classifyError(new Error("captcha required"))).toBe("waf_block");
    expect(classifyError(new Error("challenge page returned"))).toBe("waf_block");
    expect(classifyError(new Error("access denied temporarily"))).toBe("waf_block");
  });

  it("classifies server errors (5xx)", () => {
    expect(classifyError(new Error("Request failed with status 500"))).toBe("server");
    expect(classifyError(new Error("502 Bad Gateway"))).toBe("server");
    expect(classifyError(new Error("503 Service Unavailable"))).toBe("server");
    expect(classifyError(new Error("504 Gateway Timeout"))).toBe("server");
    expect(classifyError(new Error("Internal Server Error"))).toBe("server");
  });

  it("classifies network errors", () => {
    expect(classifyError(new Error("ECONNRESET"))).toBe("network");
    expect(classifyError(new Error("ECONNREFUSED"))).toBe("network");
    expect(classifyError(new Error("ETIMEDOUT"))).toBe("network");
    expect(classifyError(new Error("getaddrinfo ENOTFOUND wss.zalo.me"))).toBe("network");
    expect(classifyError(new Error("socket hang up"))).toBe("network");
  });

  it("classifies unknown errors", () => {
    expect(classifyError(new Error("WebSocket closed: code=1006"))).toBe("unknown");
    expect(classifyError(new Error("something unexpected happened"))).toBe("unknown");
  });
});

describe("isAuthFailure", () => {
  it("returns true for dead-session errors", () => {
    expect(isAuthFailure(new Error("Not authenticated. Login with QR first."))).toBe(true);
    expect(isAuthFailure(new Error("Request failed with status 401"))).toBe(true);
    expect(isAuthFailure("session expired")).toBe(true);
  });

  it("returns false for 403 (not a dead session)", () => {
    expect(isAuthFailure(new Error("Request failed with status 403"))).toBe(false);
  });

  it("returns false for network errors", () => {
    expect(isAuthFailure(new Error("ECONNRESET"))).toBe(false);
    expect(isAuthFailure(new Error("getaddrinfo ENOTFOUND wss.zalo.me"))).toBe(false);
    expect(isAuthFailure(new Error("WebSocket closed: code=1006"))).toBe(false);
  });

  it("returns false for rate limits and server errors", () => {
    expect(isAuthFailure(new Error("429 Too Many Requests"))).toBe(false);
    expect(isAuthFailure(new Error("500 Internal Server Error"))).toBe(false);
  });
});

describe("isRetryable", () => {
  it("retries network, server, rate_limit, waf, forbidden, unknown", () => {
    expect(isRetryable(new Error("ECONNRESET"))).toBe(true);
    expect(isRetryable(new Error("500 Internal Server Error"))).toBe(true);
    expect(isRetryable(new Error("429 Too Many Requests"))).toBe(true);
    expect(isRetryable(new Error("WAF blocked"))).toBe(true);
    expect(isRetryable(new Error("Request failed with status 403"))).toBe(true);
    expect(isRetryable(new Error("WebSocket closed: code=1006"))).toBe(true);
  });

  it("does not retry auth failures", () => {
    expect(isRetryable(new Error("Not authenticated. Login with QR first."))).toBe(false);
    expect(isRetryable(new Error("Request failed with status 401"))).toBe(false);
    expect(isRetryable(new Error("session expired"))).toBe(false);
  });
});
