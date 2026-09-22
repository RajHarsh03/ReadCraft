import { describe, it, expect } from "vitest";
import { generateMarkdown } from "./markdown";
import type { ProfileState } from "../types";

function baseState(overrides: Partial<ProfileState> = {}): ProfileState {
  return {
    basics: {
      fullName: "Ada Lovelace",
      username: "ada",
      location: "",
      company: "",
    },
    headline: { primary: "Engineer", bio: "" },
    focus: { working: "", learning: "", askMeAbout: "" },
    tech: [],
    metrics: {
      showStatsCard: false,
      showStreak: false,
      showGraph: false,
      showSnake: false,
      showTopLanguages: false,
    },
    pinned: [],
    enabled: {
      profile: true,
      headline: false,
      focus: false,
      tech: false,
      metrics: false,
      pinned: false,
    },
    ...overrides,
  };
}

describe("generateMarkdown (smoke)", () => {
  it("renders the profile greeting when profile is enabled", () => {
    const md = generateMarkdown(baseState());
    expect(md).toContain("# Hi there, I'm Ada Lovelace");
    expect(md).toContain("`@ada`");
  });

  it("omits sections that are disabled", () => {
    const md = generateMarkdown(baseState());
    expect(md).not.toContain("Tech Stack");
    expect(md).not.toContain("Pinned Repositories");
  });
});
