import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import type { Config } from "./config.js";
import {
  createGitHubService,
  selectFeaturedRepos,
  type GitHubService,
} from "./github/service.js";
import type { FetchLike } from "./github/client.js";
import { GitHubError, statusForErrorKind } from "./github/types.js";
import { isValidUsername, normalizeUsername } from "./username.js";

export interface BuildAppOptions {
  config: Config;
  /** Inject a prebuilt service (tests); otherwise one is created from config. */
  service?: GitHubService;
  fetchImpl?: FetchLike;
}

const paramsSchema = z.object({ username: z.string() });
const reposQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const { config } = options;
  const app = Fastify({ logger: false });

  const service =
    options.service ??
    createGitHubService({
      token: config.githubToken,
      cacheTtlMs: config.cacheTtlMs,
      fetchImpl: options.fetchImpl,
    });

  app.register(cors, { origin: config.corsOrigins });

  app.get("/health", async () => ({ status: "ok" }));

  /** Resolve + validate the :username param, or throw invalid_username. */
  function requireUsername(raw: unknown): string {
    const parsed = paramsSchema.safeParse(raw);
    const value = parsed.success ? normalizeUsername(parsed.data.username) : "";
    if (!value || !isValidUsername(value)) {
      throw new GitHubError("invalid_username", "That is not a valid GitHub username.");
    }
    return value;
  }

  app.get("/api/github/:username/profile", async (request, reply) => {
    const username = requireUsername(request.params);
    return sendData(reply, await service.getProfile(username));
  });

  app.get("/api/github/:username/repositories", async (request, reply) => {
    const username = requireUsername(request.params);
    const { limit } = reposQuerySchema.parse(request.query);
    const all = await service.getRepositories(username);
    return sendData(reply, {
      repositories: selectFeaturedRepos(all, limit),
      totalPublic: all.length,
    });
  });

  app.get("/api/github/:username/languages", async (request, reply) => {
    const username = requireUsername(request.params);
    return sendData(reply, { languages: await service.getLanguages(username) });
  });

  // Central error handler: map GitHubError → HTTP; everything else → 500.
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof GitHubError) {
      reply
        .status(statusForErrorKind(error.kind))
        .send({ error: { kind: error.kind, message: error.message } });
      return;
    }
    reply
      .status(500)
      .send({ error: { kind: "unknown", message: "Unexpected server error." } });
  });

  return app;
}

function sendData<T>(
  reply: import("fastify").FastifyReply,
  data: T
): { data: T } {
  reply.header("Cache-Control", "public, max-age=60");
  return { data };
}
