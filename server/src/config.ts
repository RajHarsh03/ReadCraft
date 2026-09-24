/** Runtime configuration, read once from the environment. */
export interface Config {
  port: number;
  corsOrigins: string[];
  githubToken: string | undefined;
  cacheTtlMs: number;
  /** Rate-limit window length in milliseconds. */
  rateLimitWindowMs: number;
  /** Max requests allowed per IP within the window. */
  rateLimitMax: number;
  /** Maximum accepted request body size, in bytes. */
  bodyLimitBytes: number;
  /** Per-request timeout in milliseconds (Fastify requestTimeout). */
  requestTimeoutMs: number;
}

function toInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: toInt(env.PORT, 8787),
    corsOrigins: (env.CORS_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    githubToken: env.GITHUB_TOKEN?.trim() || undefined,
    cacheTtlMs: toInt(env.CACHE_TTL_SECONDS, 300) * 1000,
    rateLimitWindowMs: toInt(env.RATE_LIMIT_WINDOW_SECONDS, 60) * 1000,
    rateLimitMax: toInt(env.RATE_LIMIT_MAX, 60),
    bodyLimitBytes: toInt(env.BODY_LIMIT_BYTES, 16 * 1024),
    requestTimeoutMs: toInt(env.REQUEST_TIMEOUT_SECONDS, 25) * 1000,
  };
}
