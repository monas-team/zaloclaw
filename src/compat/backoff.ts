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

/** Errors that mean "credentials are dead" — retrying will not help. */
export function isAuthFailure(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /not authenticated|login with qr|session.*(expired|invalid)|unauthori[sz]ed|\b401\b|\b403\b|invalid.*cookie|checkpoint|account.*(locked|banned|blocked)/i.test(
    msg,
  );
}
