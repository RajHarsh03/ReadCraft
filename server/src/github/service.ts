import { TtlCache } from "../cache.js";
import {
  fetchContributions,
  fetchProfile,
  fetchRepos,
  type FetchLike,
} from "./client.js";
import type {
  ContributionCalendar,
  ContributionDay,
  GitHubProfile,
  GitHubRepo,
  LanguageStat,
  StreakStats,
} from "./types.js";

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
 * Derive streak figures from a day-by-day contributions calendar.
 *
 * - total: sum of all contributions.
 * - longestStreak: the longest run of consecutive days with count > 0.
 * - currentStreak: the run ending at the most recent day. A zero on the very
 *   last day (today, which may have no activity yet) does not break it — the
 *   count resumes from the previous day, matching the streak-stats convention.
 *
 * Input need not be pre-sorted; it is sorted by date ascending here.
 */
/** Format a date string "YYYY-MM-DD" to "Mon DD" e.g. "Sep 22". */
function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Format a range as "Mon DD - Mon DD" or just "Mon DD" if both same. */
function fmtRange(from: string, to: string): string {
  return from === to ? fmtDate(from) : `${fmtDate(from)} - ${fmtDate(to)}`;
}

export function computeStreak(days: ContributionDay[]): StreakStats {
  if (days.length === 0) {
    return { total: 0, currentStreak: 0, longestStreak: 0, firstDate: null, currentStreakRange: null, longestStreakRange: null };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const total = sorted.reduce((sum, d) => sum + d.count, 0);

  // First contribution date
  const firstActive = sorted.find((d) => d.count > 0);
  const firstDate = firstActive?.date ?? null;

  // Longest streak with date range
  let longest = 0;
  let longestStart = "";
  let longestEnd = "";
  let run = 0;
  let runStart = "";
  for (const day of sorted) {
    if (day.count > 0) {
      if (run === 0) runStart = day.date;
      run += 1;
      if (run > longest) {
        longest = run;
        longestStart = runStart;
        longestEnd = day.date;
      }
    } else {
      run = 0;
    }
  }

  // Current streak: walk backwards. Skip a trailing zero on the last day only.
  let current = 0;
  let currentStart = "";
  let currentEnd = "";
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const count = sorted[i]!.count;
    if (count > 0) {
      currentEnd = currentEnd || sorted[i]!.date;
      currentStart = sorted[i]!.date;
      current += 1;
    } else if (i === sorted.length - 1) {
      continue; // today with no activity yet
    } else {
      break;
    }
  }

  return {
    total,
    currentStreak: current,
    longestStreak: longest,
    firstDate,
    currentStreakRange: current > 0 ? fmtRange(currentStart, currentEnd) : null,
    longestStreakRange: longest > 0 ? fmtRange(longestStart, longestEnd) : null,
  };
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
  // One cache for the raw day-by-day calendar; streak is derived from it, so a
  // single upstream fetch serves both the streak card and the calendar grid.
  const contributionsCache = new TtlCache<ContributionDay[]>(
    options.cacheTtlMs
  );

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

  async function getContributionDays(
    username: string
  ): Promise<ContributionDay[]> {
    return contributionsCache.getOrSet(username.toLowerCase(), () =>
      fetchContributions(username, clientOptions)
    );
  }

  async function getStreak(username: string): Promise<StreakStats> {
    return computeStreak(await getContributionDays(username));
  }

  async function getContributions(
    username: string
  ): Promise<ContributionCalendar> {
    const days = await getContributionDays(username);
    return { days, streak: computeStreak(days) };
  }

  return {
    getProfile,
    getRepositories,
    getLanguages,
    getStreak,
    getContributions,
  };
}

export type GitHubService = ReturnType<typeof createGitHubService>;
