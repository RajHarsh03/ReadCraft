import { describe, it, expect } from "vitest";
import { TtlCache } from "./cache.js";

describe("TtlCache", () => {
  it("returns cached values within the TTL", async () => {
    let calls = 0;
    const cache = new TtlCache<number>(1000);
    const compute = async () => {
      calls += 1;
      return 42;
    };
    expect(await cache.getOrSet("k", compute)).toBe(42);
    expect(await cache.getOrSet("k", compute)).toBe(42);
    expect(calls).toBe(1);
  });

  it("recomputes after the TTL expires", async () => {
    let clock = 0;
    let calls = 0;
    const cache = new TtlCache<number>(1000, () => clock);
    const compute = async () => {
      calls += 1;
      return calls;
    };
    expect(await cache.getOrSet("k", compute)).toBe(1);
    clock = 1001;
    expect(await cache.getOrSet("k", compute)).toBe(2);
    expect(calls).toBe(2);
  });
});
