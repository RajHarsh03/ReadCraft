import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "./persistence";
import { exportDraftJson, parseImportedDraft } from "./draftFile";
import { makeState } from "../test/factory";

describe("exportDraftJson", () => {
  it("writes a self-describing, versioned draft file", () => {
    const state = makeState();
    const parsed = JSON.parse(exportDraftJson(state));
    expect(parsed.kind).toBe("readcraft-draft");
    expect(parsed.version).toBe(SCHEMA_VERSION);
    expect(typeof parsed.exportedAt).toBe("string");
    expect(parsed.state).toEqual(state);
  });
});

describe("export / import round-trip", () => {
  it("restores an exported document exactly", () => {
    const state = makeState();
    const { state: imported, migrated } = parseImportedDraft(
      exportDraftJson(state),
      makeState()
    );
    expect(imported).toEqual(state);
    expect(migrated).toBe(false);
  });
});

describe("parseImportedDraft resilience", () => {
  it("rejects invalid JSON", () => {
    expect(() => parseImportedDraft("{not json", makeState())).toThrow(
      /valid JSON/i
    );
  });

  it("rejects JSON that isn't a ReadCraft draft", () => {
    expect(() =>
      parseImportedDraft(JSON.stringify({ hello: "world" }), makeState())
    ).toThrow(/ReadCraft draft/i);
  });

  it("coerces a partial state over the provided defaults", () => {
    const defaults = makeState();
    const text = JSON.stringify({
      kind: "readcraft-draft",
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      state: { basics: { fullName: "Grace Hopper" } },
    });
    const { state } = parseImportedDraft(text, defaults);
    expect(state.basics.fullName).toBe("Grace Hopper");
    // Missing fields fall back to the provided defaults.
    expect(state.headline).toEqual(defaults.headline);
    expect(state.order).toEqual(defaults.order);
  });

  it("flags a version mismatch as migrated", () => {
    const text = JSON.stringify({
      kind: "readcraft-draft",
      version: SCHEMA_VERSION + 1,
      exportedAt: new Date().toISOString(),
      state: makeState(),
    });
    const { migrated } = parseImportedDraft(text, makeState());
    expect(migrated).toBe(true);
  });

  it("accepts a bare state object (no wrapper) for resilience", () => {
    const state = makeState();
    const { state: imported } = parseImportedDraft(
      JSON.stringify(state),
      makeState()
    );
    expect(imported).toEqual(state);
  });
});
