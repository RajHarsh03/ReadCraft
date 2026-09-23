import { describe, it, expect } from "vitest";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import type { FetchLike } from "./github/client.js";

const USER_FIXTURE = {
  login: "octocat",
  name: "The Octocat",
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  bio: "Builds things.",
  company: "GitHub",
  location: "Internet",
  blog: "https://example.com",
  public_repos: 3,
  followers: 100,
  following: 5,
  html_url: "https://github.com/octocat",
  created_at: "2011-01-25T18:44:36Z",
};

const REPOS_FIXTURE = [
  {
    id: 1,
    name: "hello",
    description: "hi",
    html_url: "https://github.com/octocat/hello",
    homepage: null,
    language: "TypeScript",
    stargazers_count: 50,
    forks_count: 2,
    topics: ["cli"],
    fork: false,
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "forked",
    description: null,
    html_url: "https://github.com/octocat/forked",
    homepage: null,
    language: "Go",
    stargazers_count: 999,
    forks_count: 0,
    topics: [],
    fork: true,
    updated_at: "2025-01-01T00:00:00Z",
  },
];

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function makeApp(fetchImpl: FetchLike) {
  return buildApp({ config: loadConfig({}), fetchImpl });
}

describe("GitHub routes", () => {
  it("returns a normalized profile", async () => {
    const app = makeApp(async () => json(USER_FIXTURE));
    const res = await app.inject({ url: "/api/github/octocat/profile" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      data: { login: "octocat", avatarUrl: USER_FIXTURE.avatar_url },
    });
  });

  it("returns featured repositories excluding forks", async () => {
    const app = makeApp(async (url) =>
      String(url).includes("/repos") ? json(REPOS_FIXTURE) : json(USER_FIXTURE)
    );
    const res = await app.inject({ url: "/api/github/octocat/repositories" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.totalPublic).toBe(2);
    expect(body.data.repositories.map((r: { name: string }) => r.name)).toEqual([
      "hello",
    ]);
  });

  it("computes language stats", async () => {
    const app = makeApp(async (url) =>
      String(url).includes("/repos") ? json(REPOS_FIXTURE) : json(USER_FIXTURE)
    );
    const res = await app.inject({ url: "/api/github/octocat/languages" });
    expect(res.json().data.languages).toEqual([
      { language: "TypeScript", count: 1, percent: 100 },
    ]);
  });

  it("rejects an invalid username with 400", async () => {
    const app = makeApp(async () => json(USER_FIXTURE));
    const res = await app.inject({ url: "/api/github/bad--name/profile" });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.kind).toBe("invalid_username");
  });

  it("maps a 404 to not_found", async () => {
    const app = makeApp(async () => new Response("", { status: 404 }));
    const res = await app.inject({ url: "/api/github/ghost/profile" });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.kind).toBe("not_found");
  });

  it("maps an exhausted rate limit to 429", async () => {
    const app = makeApp(
      async () =>
        new Response("", {
          status: 403,
          headers: { "x-ratelimit-remaining": "0" },
        })
    );
    const res = await app.inject({ url: "/api/github/octocat/profile" });
    expect(res.statusCode).toBe(429);
    expect(res.json().error.kind).toBe("rate_limit");
  });

  it("serves health", async () => {
    const app = makeApp(async () => json(USER_FIXTURE));
    const res = await app.inject({ url: "/health" });
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("stamps security headers on responses", async () => {
    const app = makeApp(async () => json(USER_FIXTURE));
    const res = await app.inject({ url: "/health" });
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
    expect(res.headers["content-security-policy"]).toContain("default-src 'none'");
  });

  it("rate-limits after the configured maximum", async () => {
    const config = { ...loadConfig({}), rateLimitMax: 2 };
    const app = buildApp({ config, fetchImpl: async () => json(USER_FIXTURE) });
    const url = "/api/github/octocat/profile";
    expect((await app.inject({ url })).statusCode).toBe(200);
    expect((await app.inject({ url })).statusCode).toBe(200);
    const limited = await app.inject({ url });
    expect(limited.statusCode).toBe(429);
    expect(limited.json().error.kind).toBe("rate_limit");
    expect(limited.headers["retry-after"]).toBeDefined();
  });

  it("does not rate-limit the health probe", async () => {
    const config = { ...loadConfig({}), rateLimitMax: 1 };
    const app = buildApp({ config, fetchImpl: async () => json(USER_FIXTURE) });
    await app.inject({ url: "/health" });
    await app.inject({ url: "/health" });
    expect((await app.inject({ url: "/health" })).statusCode).toBe(200);
  });
});
