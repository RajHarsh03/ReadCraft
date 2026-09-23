import { beforeEach, describe, expect, it } from "vitest";
import {
  PERSISTENCE_INTERNALS,
  clearDraft,
  loadDraft,
  saveDraft,
} from "./persistence";
import { makeState } from "../test/factory";

const { STORAGE_KEY, SCHEMA_VERSION, coerceState } = PERSISTENCE_INTERNALS;

beforeEach(() => {
  localStorage.clear();
});

describe("saveDraft / loadDraft round-trip", () => {
  it("persists and restores a complete state", () => {
    const state = makeState();
    expect(saveDraft(state)).toBe("saved");
    const loaded = loadDraft(makeState());
    expect(loaded).not.toBeNull();
    expect(loaded?.state).toEqual(state);
    expect(typeof loaded?.savedAt).toBe("number");
  });

  it("returns null when nothing is stored", () => {
    expect(loadDraft(makeState())).toBeNull();
  });

  it("clears a stored draft", () => {
    saveDraft(makeState());
    clearDraft();
    expect(loadDraft(makeState())).toBeNull();
  });
});

describe("loadDraft resilience", () => {
  it("returns null on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadDraft(makeState())).toBeNull();
  });

  it("returns null on a mismatched schema version", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 999, savedAt: 1, state: makeState() })
    );
    expect(loadDraft(makeState())).toBeNull();
  });

  it("merges a partial state over defaults", () => {
    const defaults = makeState();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        savedAt: 1,
        state: { basics: { fullName: "Grace Hopper" } },
      })
    );
    const loaded = loadDraft(defaults);
    expect(loaded?.state.basics.fullName).toBe("Grace Hopper");
    // Untouched fields fall back to defaults.
    expect(loaded?.state.headline).toEqual(defaults.headline);
    expect(loaded?.state.order).toEqual(defaults.order);
  });
});

describe("coerceState", () => {
  it("repairs a truncated section order by appending missing ids", () => {
    const defaults = makeState();
    const result = coerceState({ order: ["tech", "profile"] }, defaults);
    expect(result.order).toHaveLength(defaults.order.length);
    expect(result.order.slice(0, 2)).toEqual(["tech", "profile"]);
    // Every default id is present exactly once.
    expect(new Set(result.order)).toEqual(new Set(defaults.order));
  });

  it("drops unknown section ids and de-duplicates", () => {
    const defaults = makeState();
    const result = coerceState(
      { order: ["tech", "tech", "bogus", "profile"] },
      defaults
    );
    expect(new Set(result.order)).toEqual(new Set(defaults.order));
    expect(result.order.length).toBe(defaults.order.length);
  });

  it("keeps only boolean enabled flags", () => {
    const defaults = makeState();
    const result = coerceState(
      { enabled: { profile: false, tech: "yes" } },
      defaults
    );
    expect(result.enabled.profile).toBe(false);
    expect(result.enabled.tech).toBe(defaults.enabled.tech);
  });

  it("falls back to defaults for non-object input", () => {
    const defaults = makeState();
    expect(coerceState(null, defaults)).toEqual(defaults);
    expect(coerceState("nope", defaults)).toEqual(defaults);
  });
});
