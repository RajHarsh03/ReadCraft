/**
 * Client-side GitHub API layer.
 *
 * Talks to the ReadCraft server (never GitHub directly, so no token ever
 * reaches the browser). Requests use a same-origin "/api" path by default,
 * proxied to the server in dev and served by the deployment in production; set
 * VITE_API_BASE_URL to point at a different origin.
 */
import { normalizeUsername } from "./username";
import type { GitHubImport } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

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
  percent: number;
}

export type GitHubErrorKind =
  | "invalid_username"
  | "not_found"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "offline"
  | "unknown";

export class GitHubApiError extends Error {
  constructor(
    readonly kind: GitHubErrorKind,
    message: string
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

interface ApiEnvelope<T> {
  data?: T;
  error?: { kind: GitHubErrorKind; message: string };
}

async function get<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new GitHubApiError(
      "offline",
      "Can't reach the ReadCraft server. Check your connection and try again."
    );
  }

  let body: ApiEnvelope<T> | null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.error) {
    const kind = body?.error?.kind ?? "unknown";
    const message =
      body?.error?.message ?? `Request failed (${response.status}).`;
    throw new GitHubApiError(kind, message);
  }
  if (body.data === undefined) {
    throw new GitHubApiError("unknown", "Malformed server response.");
  }
  return body.data;
}

export function fetchProfile(username: string): Promise<GitHubProfile> {
  const u = encodeURIComponent(normalizeUsername(username));
  return get<GitHubProfile>(`/api/github/${u}/profile`);
}

export function fetchRepositories(
  username: string,
  limit = 6
): Promise<{ repositories: GitHubRepo[]; totalPublic: number }> {
  const u = encodeURIComponent(normalizeUsername(username));
  return get(`/api/github/${u}/repositories?limit=${limit}`);
}

export function fetchLanguages(username: string): Promise<LanguageStat[]> {
  const u = encodeURIComponent(normalizeUsername(username));
  return get<{ languages: LanguageStat[] }>(`/api/github/${u}/languages`).then(
    (r) => r.languages
  );
}

export interface GitHubBundle {
  profile: GitHubProfile;
  repositories: GitHubRepo[];
  totalPublic: number;
  languages: LanguageStat[];
}

/** Fetch everything the connection panel needs in parallel. */
export async function fetchGitHubBundle(
  username: string,
  repoLimit = 6
): Promise<GitHubBundle> {
  const [profile, repos, languages] = await Promise.all([
    fetchProfile(username),
    fetchRepositories(username, repoLimit),
    fetchLanguages(username),
  ]);
  return {
    profile,
    repositories: repos.repositories,
    totalPublic: repos.totalPublic,
    languages,
  };
}

/* -------------------------------------------------------------------------- */
/*  Mapping fetched data into a document import                               */
/* -------------------------------------------------------------------------- */

/** GitHub language → brand-ish dot color, with a neutral fallback. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#f97316",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

export function colorForLanguage(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8b949e";
}

/** Compact star count, e.g. 1420 → "1.4k". */
export function formatStars(count: number): string {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/**
 * Map a fetched bundle into the document import payload. Pure and tested:
 * identity fields come from the profile, tech from the top languages, and
 * featured repositories become pinned projects.
 */
export function mapBundleToImport(
  bundle: GitHubBundle,
  techLimit = 8
): GitHubImport {
  const { profile, repositories, languages } = bundle;
  return {
    basics: {
      fullName: profile.name ?? "",
      username: profile.login,
      company: profile.company ?? "",
      location: profile.location ?? "",
    },
    bioIfEmpty: profile.bio ?? "",
    techToMerge: languages.slice(0, techLimit).map((l) => ({
      name: l.language,
      color: colorForLanguage(l.language),
    })),
    projects: repositories.map((r) => ({
      id: `gh-${r.id}`,
      name: r.name,
      stars: formatStars(r.stars),
      description: r.description ?? "",
    })),
  };
}
