/**
 * Exponential backoff with full jitter for listener restarts.
 *
 * Previous behaviour: fixed 10s retry forever. If Zalo rejected the session
 * (expired cookie, account checkpoint) this hammered the login endpoint every
 * 10 seconds indefinitely, which is both noisy and a plausible trigger for
 * account restrictions. Now: 5s, 10s, 20s, ... capped at 5 min, with jitter,
 * and a hard cap on consecutive failures after which we stop and surface a
 * status issue instead of looping.
 */

export type BackoffOptions = {
  baseMs?: number;
  maxMs?: number;
  maxAttempts?: number;
  random?: () => number;
};

export class ReconnectBackoff {
  readonly #baseMs: number;
  readonly #maxMs: number;
  readonly #maxAttempts: number;
  readonly #random: () => number;
  #attempt = 0;

  constructor(opts: BackoffOptions = {}) {
    this.#baseMs = opts.baseMs ?? 5_000;
    this.#maxMs = opts.maxMs ?? 5 * 60_000;
    this.#maxAttempts = opts.maxAttempts ?? 12;
    this.#random = opts.random ?? Math.random;
  }

  get attempt(): number {
    return this.#attempt;
  }

  /** True when another retry is allowed. */
  canRetry(): boolean {
    return this.#attempt < this.#maxAttempts;
  }

  /** Register a failure and return the delay before the next attempt (ms). */
  nextDelayMs(): number {
    this.#attempt += 1;
    const exp = Math.min(this.#maxMs, this.#baseMs * 2 ** (this.#attempt - 1));
    // full jitter: uniform in [exp/2, exp]
    const half = exp / 2;
    return Math.round(half + this.#random() * half);
  }

  /** Call after a successful connection so the next failure starts small again. */
  reset(): void {
    this.#attempt = 0;
  }
}

export type ErrorCategory =
  | "auth_expired"
  | "unauthorized"
  | "forbidden"
  | "rate_limit"
  | "waf_block"
  | "network"
  | "server"
  | "unknown";

export function classifyError(err: unknown): ErrorCategory {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  // Definite auth/session death
  if (/not authenticated|login with qr|session.*(expired|invalid)|invalid.*cookie|checkpoint|account.*(locked|banned|blocked)/i.test(msg)) {
    return "auth_expired";
  }

  // HTTP 401 — credentials rejected
  if (/\b401\b/.test(msg) || /unauthori[sz]ed/i.test(msg)) {
    return "unauthorized";
  }

  // Rate limit (429 or explicit rate-limit language)
  if (/\b429\b|rate.?limit|too many requests|throttl/i.test(msg)) {
    return "rate_limit";
  }

  // WAF / temporary block (Zalo anti-abuse, Cloudflare, etc.)
  if (/waf|captcha|challenge|temporary.*block|access.*denied.*temporarily/i.test(msg)) {
    return "waf_block";
  }

  // HTTP 403 — could be endpoint-level permission, not necessarily dead session
  if (/\b403\b|forbidden/i.test(msg)) {
    return "forbidden";
  }

  // Server errors (5xx)
  if (/\b5\d{2}\b|internal server|bad gateway|service unavailable|gateway timeout/i.test(msg)) {
    return "server";
  }

  // Network errors
  if (/ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ENETUNREACH|EPIPE|socket hang up|network|dns/i.test(msg)) {
    return "network";
  }

  return "unknown";
}

/** True only for errors where credentials are definitively dead — retrying will not help. */
export function isAuthFailure(err: unknown): boolean {
  const cat = classifyError(err);
  return cat === "auth_expired" || cat === "unauthorized";
}

/** True for transient errors where retry with backoff is appropriate. */
export function isRetryable(err: unknown): boolean {
  const cat = classifyError(err);
  return cat === "network" || cat === "server" || cat === "rate_limit" || cat === "waf_block" || cat === "forbidden" || cat === "unknown";
}
