import { describe, it, expect } from "vitest";
import {
  colorForLanguage,
  formatStars,
  mapBundleToImport,
  type GitHubBundle,
} from "./github";

const bundle: GitHubBundle = {
  profile: {
    login: "octocat",
    name: "The Octocat",
    avatarUrl: "https://avatars/1",
    bio: "Builds things.",
    company: "GitHub",
    location: "Internet",
    blog: null,
    publicRepos: 3,
    followers: 100,
    following: 5,
    htmlUrl: "https://github.com/octocat",
    createdAt: "2011-01-25T18:44:36Z",
  },
  repositories: [
    {
      id: 1,
      name: "hello",
      description: "hi",
      htmlUrl: "https://github.com/octocat/hello",
      homepage: null,
      language: "TypeScript",
      stars: 1420,
      forks: 2,
      topics: [],
      isFork: false,
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ],
  totalPublic: 3,
  languages: [
    { language: "TypeScript", count: 5, percent: 62.5 },
    { language: "Go", count: 3, percent: 37.5 },
  ],
  streak: { total: 1892, currentStreak: 42, longestStreak: 178 },
};

describe("formatStars", () => {
  it("keeps small counts and abbreviates thousands", () => {
    expect(formatStars(0)).toBe("0");
    expect(formatStars(999)).toBe("999");
    expect(formatStars(1420)).toBe("1.4k");
    expect(formatStars(2000)).toBe("2k");
  });
});

describe("colorForLanguage", () => {
  it("returns a known color or a neutral fallback", () => {
    expect(colorForLanguage("TypeScript")).toBe("#3178c6");
    expect(colorForLanguage("Unknownlang")).toBe("#8b949e");
  });
});

describe("mapBundleToImport", () => {
  it("maps profile identity fields", () => {
    const imp = mapBundleToImport(bundle);
    expect(imp.basics).toEqual({
      fullName: "The Octocat",
      username: "octocat",
      company: "GitHub",
      location: "Internet",
    });
    expect(imp.bioIfEmpty).toBe("Builds things.");
  });

  it("maps top languages to tech with colors", () => {
    const imp = mapBundleToImport(bundle);
    expect(imp.techToMerge).toEqual([
      { name: "TypeScript", color: "#3178c6" },
      { name: "Go", color: "#00add8" },
    ]);
  });

  it("maps repositories to pinned projects with formatted stars", () => {
    const imp = mapBundleToImport(bundle);
    expect(imp.projects).toEqual([
      {
        id: "gh-1",
        name: "hello",
        stars: "1.4k",
        description: "hi",
      },
    ]);
  });

  it("falls back to empty strings for missing profile fields", () => {
    const imp = mapBundleToImport({
      ...bundle,
      profile: {
        ...bundle.profile,
        name: null,
        company: null,
        location: null,
        bio: null,
      },
    });
    expect(imp.basics.fullName).toBe("");
    expect(imp.bioIfEmpty).toBe("");
  });
});
