/** Runtime configuration, read once from the environment. */
export interface Config {
  port: number;
  corsOrigins: string[];
  githubToken: string | undefined;
  cacheTtlMs: number;
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
  };
}
