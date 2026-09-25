import { z } from "zod";
import {
  GitHubError,
  type ContributionDay,
  type GitHubProfile,
  type GitHubRepo,
} from "./types.js";

const GITHUB_API = "https://api.github.com";
const DEFAULT_TIMEOUT_MS = 8000;

/** Injectable fetch, so tests can supply a stub. */
export type FetchLike = typeof fetch;

export interface ClientOptions {
  token?: string | undefined;
  timeoutMs?: number;
  fetchImpl?: FetchLike;
}

/* -------------------------------------------------------------------------- */
/*  Upstream schemas (validate what GitHub actually returns)                  */
/* -------------------------------------------------------------------------- */

const userSchema = z.object({
  login: z.string(),
  name: z.string().nullable().default(null),
  avatar_url: z.string(),
  bio: z.string().nullable().default(null),
  company: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  blog: z.string().nullable().default(null),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
  html_url: z.string(),
  created_at: z.string(),
});

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().default(null),
  html_url: z.string(),
  homepage: z.string().nullable().default(null),
  language: z.string().nullable().default(null),
  stargazers_count: z.number(),
  forks_count: z.number(),
  topics: z.array(z.string()).default([]),
  fork: z.boolean(),
  updated_at: z.string(),
});

const reposSchema = z.array(repoSchema);

/* -------------------------------------------------------------------------- */
/*  Request helper                                                            */
/* -------------------------------------------------------------------------- */

async function request(
  path: string,
  options: ClientOptions
): Promise<unknown> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ReadCraft",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetchImpl(`${GITHUB_API}${path}`, {
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new GitHubError("timeout", "GitHub did not respond in time.");
    }
    throw new GitHubError("unavailable", "Could not reach GitHub.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw classify(response);
  try {
    return await response.json();
  } catch {
    throw new GitHubError("unavailable", "GitHub returned an unreadable body.");
  }
}

function classify(response: Response): GitHubError {
  if (response.status === 404) {
    return new GitHubError(
      "not_found",
      "The username doesn't appear to exist or GitHub could not be reached."
    );
  }
  const remaining = response.headers.get("x-ratelimit-remaining");
  if (response.status === 429 || (response.status === 403 && remaining === "0")) {
    return new GitHubError("rate_limit", "GitHub API rate limit reached.");
  }
  if (response.status >= 500) {
    return new GitHubError("unavailable", `GitHub is unavailable (${response.status}).`);
  }
  return new GitHubError("unknown", `GitHub responded with ${response.status}.`);
}

function parse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new GitHubError("unavailable", `Unexpected GitHub ${label} response.`);
  }
  return result.data;
}

/* -------------------------------------------------------------------------- */
/*  Public fetchers (map upstream → narrowed domain types)                    */
/* -------------------------------------------------------------------------- */

export async function fetchProfile(
  username: string,
  options: ClientOptions
): Promise<GitHubProfile> {
  const raw = parse(userSchema, await request(`/users/${username}`, options), "profile");
  return {
    login: raw.login,
    name: raw.name ?? null,
    avatarUrl: raw.avatar_url,
    bio: raw.bio ?? null,
    company: raw.company ?? null,
    location: raw.location ?? null,
    blog: raw.blog ?? null,
    publicRepos: raw.public_repos,
    followers: raw.followers,
    following: raw.following,
    htmlUrl: raw.html_url,
    createdAt: raw.created_at,
  };
}

export async function fetchRepos(
  username: string,
  options: ClientOptions
): Promise<GitHubRepo[]> {
  const raw = parse(
    reposSchema,
    await request(`/users/${username}/repos?per_page=100&sort=updated`, options),
    "repositories"
  );
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    htmlUrl: r.html_url,
    homepage: r.homepage ?? null,
    language: r.language ?? null,
    stars: r.stargazers_count,
    forks: r.forks_count,
    topics: r.topics ?? [],
    isFork: r.fork,
    updatedAt: r.updated_at,
  }));
}

/* -------------------------------------------------------------------------- */
/*  Contributions calendar (GitHub GraphQL API)                               */
/* -------------------------------------------------------------------------- */

const contributionWeekSchema = z.object({
  contributionDays: z.array(
    z.object({
      date: z.string(),
      contributionCount: z.number(),
    })
  ),
});

const graphqlContributionsSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          weeks: z.array(contributionWeekSchema),
        }),
      }),
    }),
  }),
});

/**
 * Fetch the contributions calendar for the trailing year using GitHub's
 * official GraphQL API. This replaces the third-party jogruber API which was
 * unreliable and could return stale/incomplete data (causing current streak=0).
 * Requires a GITHUB_TOKEN; falls back to an empty list on auth failure.
 */
export async function fetchContributions(
  username: string,
  options: ClientOptions
): Promise<ContributionDay[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "ReadCraft",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetchImpl(`${GITHUB_API}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { login: username } }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new GitHubError("timeout", "GitHub did not respond in time.");
    }
    throw new GitHubError("unavailable", "Could not reach GitHub.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw classify(response);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new GitHubError("unavailable", "GitHub returned an unreadable body.");
  }

  const parsed = graphqlContributionsSchema.safeParse(body);
  if (!parsed.success) {
    throw new GitHubError("unavailable", "Unexpected GitHub contributions response.");
  }

  const weeks =
    parsed.data.data.user.contributionsCollection.contributionCalendar.weeks;

  return weeks.flatMap((week) =>
    week.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
    }))
  );
}
