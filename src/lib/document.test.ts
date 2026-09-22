import { describe, it, expect } from "vitest";
import { buildReadmeDocument } from "./document";
import { emptyState, makeState } from "../test/factory";

describe("buildReadmeDocument", () => {
  it("produces no blocks when everything is disabled/empty", () => {
    const doc = buildReadmeDocument(emptyState());
    expect(doc.blocks).toHaveLength(0);
  });

  it("emits blocks in the configured order for a full profile", () => {
    const doc = buildReadmeDocument(makeState());
    expect(doc.blocks.map((b) => b.kind)).toEqual([
      "identity",
      "headline",
      "focus",
      "tech",
      "metrics",
      "projects",
    ]);
  });

  it("respects a custom section order", () => {
    const doc = buildReadmeDocument(
      makeState({
        order: ["tech", "profile", "focus", "headline", "metrics", "pinned"],
      })
    );
    expect(doc.blocks[0].kind).toBe("tech");
    expect(doc.blocks[1].kind).toBe("identity");
  });

  it("drops a disabled section", () => {
    const state = makeState();
    state.enabled.focus = false;
    const doc = buildReadmeDocument(state);
    expect(doc.blocks.map((b) => b.kind)).not.toContain("focus");
  });

  it("omits empty focus items but keeps populated ones", () => {
    const state = makeState({
      focus: { working: "Note G", learning: "", askMeAbout: "" },
    });
    const focus = buildReadmeDocument(state).blocks.find(
      (b) => b.kind === "focus"
    );
    expect(focus).toBeDefined();
    if (focus?.kind === "focus") {
      expect(focus.items).toHaveLength(1);
      expect(focus.items[0].value).toBe("Note G");
    }
  });

  it("orders metric cards deterministically and skips unselected", () => {
    const state = makeState({
      metrics: {
        showStatsCard: false,
        showStreak: true,
        showGraph: false,
        showSnake: true,
        showTopLanguages: false,
      },
    });
    const metrics = buildReadmeDocument(state).blocks.find(
      (b) => b.kind === "metrics"
    );
    expect(metrics?.kind === "metrics" && metrics.cards).toEqual([
      "streak",
      "snake",
    ]);
  });

  it("drops the metrics block entirely when no card is selected", () => {
    const state = makeState({
      metrics: {
        showStatsCard: false,
        showStreak: false,
        showGraph: false,
        showSnake: false,
        showTopLanguages: false,
      },
    });
    const doc = buildReadmeDocument(state);
    expect(doc.blocks.map((b) => b.kind)).not.toContain("metrics");
  });

  it("normalizes the username on the document", () => {
    const doc = buildReadmeDocument(
      makeState({
        basics: {
          fullName: "X",
          username: "  @Ada ",
          location: "",
          company: "",
        },
      })
    );
    expect(doc.username).toBe("Ada");
  });

  it("builds a graceful greeting when the name is empty", () => {
    const doc = buildReadmeDocument(
      makeState({
        basics: { fullName: "", username: "ada", location: "", company: "" },
      })
    );
    const identity = doc.blocks.find((b) => b.kind === "identity");
    expect(identity?.kind === "identity" && identity.greeting).toBe("Hi there");
  });
});
