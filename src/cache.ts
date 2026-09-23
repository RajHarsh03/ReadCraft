/**
 * Minimal in-memory TTL cache.
 *
 * Sufficient for a single-instance read-only proxy: it smooths bursts and keeps
 * us under GitHub's rate limit. A distributed deployment would swap this for a
 * shared store, but the interface stays the same.
 */
export class TtlCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private ttlMs: number,
    private now: () => number = Date.now
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  /** Return the cached value or compute, store, and return it. */
  async getOrSet(key: string, compute: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await compute();
    this.set(key, value);
    return value;
  }

  clear(): void {
    this.store.clear();
  }
}
