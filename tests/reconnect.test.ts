import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReconnectBackoff, isAuthFailure } from "../src/compat/backoff.js";

describe("ReconnectBackoff — single owner guarantees", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("only one restart timer can exist at a time", () => {
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000 });
    const starts: number[] = [];

    const scheduleRestart = () => {
      if (restartTimer) return;
      if (!backoff.canRetry()) return;
      const delay = backoff.nextDelayMs();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        starts.push(Date.now());
      }, delay);
    };

    scheduleRestart();
    scheduleRestart();
    scheduleRestart();

    vi.advanceTimersByTime(2000);
    expect(starts).toHaveLength(1);
  });

  it("close during pending timer does not create second timer", () => {
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000 });
    let startCount = 0;

    const scheduleRestart = () => {
      if (restartTimer) return;
      if (!backoff.canRetry()) return;
      const delay = backoff.nextDelayMs();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        startCount++;
      }, delay);
    };

    scheduleRestart();
    // Simulate another close arriving while timer is pending
    scheduleRestart();

    vi.advanceTimersByTime(5000);
    expect(startCount).toBe(1);
  });

  it("abort cancels pending restart timer", () => {
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000 });
    let startCount = 0;

    const scheduleRestart = () => {
      if (stopped) return;
      if (restartTimer) return;
      if (!backoff.canRetry()) return;
      const delay = backoff.nextDelayMs();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        if (!stopped) startCount++;
      }, delay);
    };

    const stop = () => {
      stopped = true;
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
    };

    scheduleRestart();
    stop();
    vi.advanceTimersByTime(5000);
    expect(startCount).toBe(0);
    expect(restartTimer).toBeNull();
  });

  it("start after successful reconnect resets backoff", () => {
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000, maxAttempts: 3 });
    backoff.nextDelayMs();
    backoff.nextDelayMs();
    expect(backoff.attempt).toBe(2);

    backoff.reset();
    expect(backoff.attempt).toBe(0);
    expect(backoff.canRetry()).toBe(true);
  });

  it("no double listener after rapid close+restart", () => {
    let listenerCount = 0;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const backoff = new ReconnectBackoff({ baseMs: 50, maxMs: 200 });

    const stopListener = () => { if (listenerCount > 0) listenerCount--; };
    const startListener = () => {
      if (stopped) return;
      stopListener();
      listenerCount++;
    };

    const scheduleRestart = () => {
      if (stopped || restartTimer) return;
      if (!backoff.canRetry()) return;
      const delay = backoff.nextDelayMs();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        startListener();
      }, delay);
    };

    startListener();
    expect(listenerCount).toBe(1);

    // Simulate close
    listenerCount = 0;
    scheduleRestart();

    // Another close before timer fires
    scheduleRestart();

    vi.advanceTimersByTime(1000);
    expect(listenerCount).toBe(1);
  });

  it("auth failure stops retry loop", () => {
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000 });
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let startCount = 0;

    const handleError = (err: unknown) => {
      if (isAuthFailure(err)) {
        stopped = true;
        if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
        return;
      }
    };

    const scheduleRestart = () => {
      if (stopped || restartTimer) return;
      if (!backoff.canRetry()) return;
      const delay = backoff.nextDelayMs();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        startCount++;
      }, delay);
    };

    handleError(new Error("Not authenticated. Login with QR first."));
    scheduleRestart();

    vi.advanceTimersByTime(5000);
    expect(startCount).toBe(0);
    expect(stopped).toBe(true);
  });

  it("network failure retries with backoff", () => {
    const backoff = new ReconnectBackoff({ baseMs: 100, maxMs: 1000, maxAttempts: 5, random: () => 0.5 });

    expect(isAuthFailure(new Error("ECONNRESET"))).toBe(false);
    expect(isAuthFailure(new Error("getaddrinfo ENOTFOUND"))).toBe(false);

    expect(backoff.canRetry()).toBe(true);
    const d1 = backoff.nextDelayMs();
    expect(d1).toBeGreaterThan(0);
    expect(backoff.canRetry()).toBe(true);
  });
});
