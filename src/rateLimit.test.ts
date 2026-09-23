import { describe, it, expect } from "vitest";
import { RateLimiter } from "./rateLimit.js";

describe("RateLimiter", () => {
  it("allows requests up to the max, then blocks", () => {
    const limiter = new RateLimiter({ windowMs: 1000, max: 3, now: () => 0 });
    expect(limiter.check("ip").allowed).toBe(true); // 1
    expect(limiter.check("ip").allowed).toBe(true); // 2
    expect(limiter.check("ip").allowed).toBe(true); // 3
    expect(limiter.check("ip").allowed).toBe(false); // 4 → blocked
  });

  it("reports remaining and never goes negative", () => {
    const limiter = new RateLimiter({ windowMs: 1000, max: 2, now: () => 0 });
    expect(limiter.check("ip").remaining).toBe(1);
    expect(limiter.check("ip").remaining).toBe(0);
    expect(limiter.check("ip").remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    const limiter = new RateLimiter({ windowMs: 1000, max: 1, now: () => 0 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    let t = 0;
    const limiter = new RateLimiter({ windowMs: 1000, max: 1, now: () => t });
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);
    t = 1000; // window boundary reached
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("computes reset seconds from the window", () => {
    const limiter = new RateLimiter({ windowMs: 5000, max: 10, now: () => 0 });
    expect(limiter.check("ip").resetSeconds).toBe(5);
  });

  it("sweeps expired buckets", () => {
    let t = 0;
    const limiter = new RateLimiter({ windowMs: 1000, max: 5, now: () => t });
    limiter.check("ip");
    expect(limiter.size).toBe(1);
    t = 2000;
    limiter.sweep();
    expect(limiter.size).toBe(0);
  });
});
