import { describe, it, expect } from "vitest";
import {
  computeLanguageStats,
  computeStreak,
  selectFeaturedRepos,
} from "./service.js";
import type { ContributionDay, GitHubRepo } from "./types.js";

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "repo",
    description: null,
    htmlUrl: "https://github.com/x/repo",
    homepage: null,
    language: "TypeScript",
    stars: 0,
    forks: 0,
    topics: [],
    isFork: false,
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeLanguageStats", () => {
  it("counts non-fork repos by language and computes percentages", () => {
    const stats = computeLanguageStats([
      repo({ language: "TypeScript" }),
      repo({ language: "TypeScript" }),
      repo({ language: "Go" }),
      repo({ language: "Rust", isFork: true }), // forks excluded
      repo({ language: null }), // no language excluded
    ]);
    expect(stats).toEqual([
      { language: "TypeScript", count: 2, percent: 66.7 },
      { language: "Go", count: 1, percent: 33.3 },
    ]);
  });

  it("returns an empty list when there is nothing to count", () => {
    expect(computeLanguageStats([repo({ isFork: true })])).toEqual([]);
  });
});

describe("selectFeaturedRepos", () => {
  it("excludes forks and orders by stars then recency", () => {
    const featured = selectFeaturedRepos([
      repo({ name: "a", stars: 10, updatedAt: "2025-01-01T00:00:00Z" }),
      repo({ name: "b", stars: 50 }),
      repo({ name: "fork", stars: 999, isFork: true }),
      repo({ name: "c", stars: 10, updatedAt: "2025-06-01T00:00:00Z" }),
    ]);
    expect(featured.map((r) => r.name)).toEqual(["b", "c", "a"]);
  });

  it("respects the limit", () => {
    const repos = Array.from({ length: 10 }, (_, i) =>
      repo({ name: `r${i}`, stars: i })
    );
    expect(selectFeaturedRepos(repos, 3)).toHaveLength(3);
  });
});

function days(counts: number[], start = "2025-01-01"): ContributionDay[] {
  const base = new Date(`${start}T00:00:00Z`).getTime();
  return counts.map((count, i) => ({
    date: new Date(base + i * 86_400_000).toISOString().slice(0, 10),
    count,
  }));
}

describe("computeStreak", () => {
  it("returns zeros for no data", () => {
    expect(computeStreak([])).toEqual({
      total: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("sums total contributions", () => {
    expect(computeStreak(days([1, 2, 3])).total).toBe(6);
  });

  it("finds the longest run of consecutive active days", () => {
    // runs: 3, then 2 → longest 3
    expect(computeStreak(days([1, 1, 1, 0, 1, 1])).longestStreak).toBe(3);
  });

  it("counts the current streak ending on the last day", () => {
    expect(computeStreak(days([0, 1, 1, 1])).currentStreak).toBe(3);
  });

  it("does not break the current streak on a trailing zero (today)", () => {
    // last day is 0 (today, no activity yet) → streak resumes from prior days
    expect(computeStreak(days([1, 1, 1, 0])).currentStreak).toBe(3);
  });

  it("breaks the current streak on an earlier zero", () => {
    expect(computeStreak(days([1, 1, 0, 1])).currentStreak).toBe(1);
  });

  it("sorts unordered input by date before computing", () => {
    const unordered = [...days([1, 1, 1])].reverse();
    expect(computeStreak(unordered).longestStreak).toBe(3);
  });
});
