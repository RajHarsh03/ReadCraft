import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../server/src/app.js";
import { loadConfig } from "../server/src/config.js";

/**
 * Vercel serverless entry for the ReadCraft API.
 *
 * Every `/api/*` request is routed here (see vercel.json) and handed to a
 * Fastify instance. The app is built once per warm instance and reused across
 * invocations. In-memory cache / rate-limit state is per-instance and resets
 * on cold starts — acceptable for this read-only API (see server/README.md).
 */

let readyApp: Awaited<ReturnType<typeof createReadyApp>> | null = null;
let building: Promise<void> | null = null;

async function createReadyApp() {
  const app = buildApp({ config: loadConfig() });
  await app.ready();
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (!readyApp) {
    building ??= createReadyApp().then((app) => {
      readyApp = app;
    });
    await building;
  }
  readyApp!.server.emit("request", req, res);
}
