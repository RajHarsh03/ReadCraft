import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../server/src/app.js";
import { loadConfig } from "../server/src/config.js";

/**
 * Vercel serverless entry for the ReadCraft API.
 *
 * A single function handles every `/api/*` path: vercel.json rewrites all such
 * requests to `/api`, and Fastify (which owns the full `/api/...` route table)
 * dispatches them via `app.routing`. The app is built once per warm instance
 * and reused; in-memory cache / rate-limit state resets on cold starts, which
 * is acceptable for this read-only API.
 */

let appPromise: ReturnType<typeof createReadyApp> | null = null;

async function createReadyApp() {
  const app = buildApp({ config: loadConfig() });
  await app.ready();
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (!appPromise) appPromise = createReadyApp();
  const app = await appPromise;
  app.routing(req, res);
}
