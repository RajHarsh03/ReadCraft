/** Narrowed GitHub shapes returned to the client, plus the error taxonomy. */

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  isFork: boolean;
  updatedAt: string;
}

export interface LanguageStat {
  language: string;
  count: number;
  /** Share of non-fork repos, 0–100, one decimal. */
  percent: number;
}

/** A single day's contribution count from the contributions calendar. */
export interface ContributionDay {
  date: string;
  count: number;
}

/** Derived contribution-streak figures, mirroring the streak-stats card. */
export interface StreakStats {
  /** Total contributions across the available history. */
  total: number;
  /** Length (days) of the current, still-active streak. */
  currentStreak: number;
  /** Length (days) of the longest streak on record. */
  longestStreak: number;
  /** ISO date of the first contribution day (for "from" label). */
  firstDate: string | null;
  /** ISO date range of the current streak, e.g. "Sep 22 - Sep 24". */
  currentStreakRange: string | null;
  /** ISO date range of the longest streak. */
  longestStreakRange: string | null;
}

/** Per-day contribution calendar plus its derived streak figures. */
export interface ContributionCalendar {
  /** Day-by-day counts, ascending by date. */
  days: ContributionDay[];
  streak: StreakStats;
}

/** Distinguished failure modes so each layer can react appropriately. */
export type GitHubErrorKind =
  | "invalid_username"
  | "not_found"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "unknown";

export class GitHubError extends Error {
  constructor(
    readonly kind: GitHubErrorKind,
    message: string
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

/** Map an error kind to an HTTP status for the API response. */
export function statusForErrorKind(kind: GitHubErrorKind): number {
  switch (kind) {
    case "invalid_username":
      return 400;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "timeout":
      return 504;
    case "unavailable":
      return 502;
    case "unknown":
      return 500;
  }
}
