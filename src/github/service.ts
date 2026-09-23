import { TtlCache } from "../cache.js";
import { fetchProfile, fetchRepos, type FetchLike } from "./client.js";
import type { GitHubProfile, GitHubRepo, LanguageStat } from "./types.js";

export interface ServiceOptions {
  token?: string | undefined;
  cacheTtlMs: number;
  fetchImpl?: FetchLike;
}

/**
 * Language breakdown by repository count, excluding forks and repos with no
 * detected language. Percentages are shares of the counted repos.
 */
export function computeLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.isFork || !repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .map(([language, count]) => ({
      language,
      count,
      percent: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
}

/**
 * Featured repositories. Rule: public non-forks, ordered by stars (desc) then
 * most recently updated. This is deterministic and easy to explain to a user.
 */
export function selectFeaturedRepos(
  repos: GitHubRepo[],
  limit = 6
): GitHubRepo[] {
  return repos
    .filter((r) => !r.isFork)
    .sort(
      (a, b) =>
        b.stars - a.stars ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit);
}

/** Builds the GitHub service with its own caches for profiles and repos. */
export function createGitHubService(options: ServiceOptions) {
  const clientOptions = {
    token: options.token,
    fetchImpl: options.fetchImpl,
  };
  const profileCache = new TtlCache<GitHubProfile>(options.cacheTtlMs);
  const reposCache = new TtlCache<GitHubRepo[]>(options.cacheTtlMs);

  async function getProfile(username: string): Promise<GitHubProfile> {
    return profileCache.getOrSet(username.toLowerCase(), () =>
      fetchProfile(username, clientOptions)
    );
  }

  async function getRepositories(username: string): Promise<GitHubRepo[]> {
    return reposCache.getOrSet(username.toLowerCase(), () =>
      fetchRepos(username, clientOptions)
    );
  }

  async function getLanguages(username: string): Promise<LanguageStat[]> {
    return computeLanguageStats(await getRepositories(username));
  }

  return { getProfile, getRepositories, getLanguages };
}

export type GitHubService = ReturnType<typeof createGitHubService>;
