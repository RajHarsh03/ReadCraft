import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../server/src/app.js";
import { loadConfig } from "../server/src/config.js";

/**
 * Vercel serverless entry for the ReadCraft API.
 *
 * Every `/api/*` request is routed here (see vercel.json) and dispatched into a
 * Fastify instance via `app.routing`, the pattern Fastify documents for
 * serverless. The app is built once per warm instance and reused across
 * invocations. In-memory cache / rate-limit state is per-instance and resets
 * on cold starts, which is acceptable for this read-only API.
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
