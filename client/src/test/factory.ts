import type { ProfileState } from "../types";
import { SECTION_IDS } from "../types";

/**
 * Build a fully-populated ProfileState for tests, with everything enabled.
 * Pass overrides to focus a test on one concern.
 */
export function makeState(overrides: Partial<ProfileState> = {}): ProfileState {
  return {
    basics: {
      fullName: "Ada Lovelace",
      username: "ada",
      location: "London, UK",
      company: "Analytical Engines",
    },
    headline: {
      primary: "Mathematician & First Programmer",
      bio: "Writing the first algorithm intended for a machine.",
    },
    focus: {
      working: "Note G",
      learning: "Bernoulli numbers",
      askMeAbout: "analytical engines",
    },
    tech: [
      { name: "Assembly", color: "#111111" },
      { name: "Mathematics", color: "#222222" },
    ],
    metrics: {
      showStatsCard: true,
      showStreak: true,
      showGraph: true,
      showSnake: true,
      showTopLanguages: true,
    },
    pinned: [
      {
        id: "p1",
        name: "analytical-engine",
        stars: "1.8k",
        description: "Notes on the analytical engine.",
      },
    ],
    enabled: {
      profile: true,
      headline: true,
      focus: true,
      tech: true,
      metrics: true,
      pinned: true,
    },
    order: [...SECTION_IDS],
    ...overrides,
  };
}

/** A state with every section disabled and fields blank. */
export function emptyState(): ProfileState {
  return makeState({
    basics: { fullName: "", username: "", location: "", company: "" },
    headline: { primary: "", bio: "" },
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
      profile: false,
      headline: false,
      focus: false,
      tech: false,
      metrics: false,
      pinned: false,
    },
  });
}
