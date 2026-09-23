/**
 * Minimal in-memory fixed-window rate limiter, keyed by client IP.
 *
 * Dependency-free and adequate for a single small instance. Each key gets a
 * counter that resets when its window elapses. `check` reports whether the
 * request is allowed plus the metadata needed for standard rate-limit headers.
 *
 * Note: state is per-process. Behind multiple instances, enforce limits at the
 * load balancer / gateway instead (documented in the ops runbook).
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Max requests permitted per window. */
  limit: number;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Seconds until the current window resets. */
  resetSeconds: number;
}

interface Bucket {
  count: number;
  /** Epoch ms when this window ends. */
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly max: number;
  private readonly now: () => number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.now = options.now ?? Date.now;
  }

  /** Record a hit for `key` and report whether it is within the limit. */
  check(key: string): RateLimitResult {
    const now = this.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, this.max - bucket.count);
    const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));

    return {
      allowed: bucket.count <= this.max,
      limit: this.max,
      remaining,
      resetSeconds,
    };
  }

  /** Drop expired buckets to bound memory. Safe to call periodically. */
  sweep(): void {
    const now = this.now();
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) this.buckets.delete(key);
    }
  }

  /** Current number of tracked keys (for tests/diagnostics). */
  get size(): number {
    return this.buckets.size;
  }
}
