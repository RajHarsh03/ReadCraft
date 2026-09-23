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
import { RateLimiter } from "./rateLimit.js";
import { SECURITY_HEADERS } from "./security.js";

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
  const app = Fastify({
    logger: false,
    // Reject oversized payloads and hung requests before they reach a handler.
    bodyLimit: config.bodyLimitBytes,
    requestTimeout: config.requestTimeoutMs,
    connectionTimeout: config.requestTimeoutMs,
    // Don't advertise the framework.
    disableRequestLogging: true,
  });
  app.removeAllContentTypeParsers();
  app.addContentTypeParser("*", (_req, _payload, done) => done(null, undefined));

  const service =
    options.service ??
    createGitHubService({
      token: config.githubToken,
      cacheTtlMs: config.cacheTtlMs,
      fetchImpl: options.fetchImpl,
    });

  // Read-only API: only GET is ever needed. Restrict CORS accordingly and cache
  // the preflight so browsers don't re-ask on every call.
  app.register(cors, {
    origin: config.corsOrigins,
    methods: ["GET"],
    maxAge: 86_400,
  });

  // Per-IP rate limiting. In-memory and single-instance; behind multiple
  // instances, enforce at the gateway too (see the ops runbook).
  const limiter = new RateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  });
  const sweepTimer = setInterval(
    () => limiter.sweep(),
    config.rateLimitWindowMs
  );
  // Don't keep the process alive just for the sweep, and clean up on close.
  sweepTimer.unref?.();
  app.addHook("onClose", (_instance, done) => {
    clearInterval(sweepTimer);
    done();
  });

  // Strip the framework banner and stamp security headers on every response.
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.removeHeader("x-powered-by");
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      reply.header(name, value);
    }
    return payload;
  });

  // Rate-limit gate. Health is exempt so uptime probes are never throttled.
  app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health") return;
    const ip = request.ip || "unknown";
    const result = limiter.check(ip);
    reply.header("RateLimit-Limit", String(result.limit));
    reply.header("RateLimit-Remaining", String(result.remaining));
    reply.header("RateLimit-Reset", String(result.resetSeconds));
    if (!result.allowed) {
      reply.header("Retry-After", String(result.resetSeconds));
      reply
        .status(statusForErrorKind("rate_limit"))
        .send({
          error: {
            kind: "rate_limit",
            message: "Too many requests. Please slow down and try again shortly.",
          },
        });
    }
  });

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

  app.get("/api/github/:username/streak", async (request, reply) => {
    const username = requireUsername(request.params);
    return sendData(reply, await service.getStreak(username));
  });

  app.get("/api/github/:username/contributions", async (request, reply) => {
    const username = requireUsername(request.params);
    return sendData(reply, await service.getContributions(username));
  });

  // Central error handler: map GitHubError → HTTP; everything else → 500.
  // Logging is privacy-conscious: we record the route *pattern*, method, and
  // error kind/status only — never the raw :username param, query, or body.
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof GitHubError) {
      const status = statusForErrorKind(error.kind);
      // Client-caused (4xx) errors are normal; only log server-side faults.
      if (status >= 500) {
        logFailure(request.method, request.routeOptions?.url, error.kind, status);
      }
      reply
        .status(status)
        .send({ error: { kind: error.kind, message: error.message } });
      return;
    }

    // Payload too large (Fastify FST_ERR_CTP_BODY_TOO_LARGE) → 413.
    if ((error as { statusCode?: number }).statusCode === 413) {
      reply
        .status(413)
        .send({ error: { kind: "unknown", message: "Request body too large." } });
      return;
    }

    logFailure(request.method, request.routeOptions?.url, "unknown", 500);
    reply
      .status(500)
      .send({ error: { kind: "unknown", message: "Unexpected server error." } });
  });

  return app;
}

/** Log an operational failure without any user-identifying data. */
function logFailure(
  method: string,
  routePattern: string | undefined,
  kind: string,
  status: number
): void {
  // Route pattern is the template (e.g. "/api/github/:username/profile"),
  // so the concrete username is never written to logs/telemetry.
  console.error(
    JSON.stringify({
      level: "error",
      event: "api_failure",
      method,
      route: routePattern ?? "unknown",
      kind,
      status,
      at: new Date().toISOString(),
    })
  );
}

function sendData<T>(
  reply: import("fastify").FastifyReply,
  data: T
): { data: T } {
  reply.header("Cache-Control", "public, max-age=60");
  return { data };
}
