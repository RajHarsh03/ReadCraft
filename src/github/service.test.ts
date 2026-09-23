import { describe, it, expect } from "vitest";
import { computeLanguageStats, selectFeaturedRepos } from "./service.js";
import type { GitHubRepo } from "./types.js";

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
