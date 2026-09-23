# ReadCraft API

A small, read-only Fastify service that fetches public GitHub data for the
ReadCraft client. It never receives or stores user drafts, and no GitHub token
is ever exposed to the browser.

## Endpoints

All responses are JSON and wrapped as `{ "data": ... }` on success or
`{ "error": { "kind", "message" } }` on failure.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Liveness probe (rate-limit exempt) |
| GET | `/api/github/:username/profile` | Public profile fields |
| GET | `/api/github/:username/repositories?limit=` | Featured repos + total count |
| GET | `/api/github/:username/languages` | Language breakdown |
| GET | `/api/github/:username/streak` | Contribution streak (current/longest/total) |

Error `kind` values: `invalid_username` (400), `not_found` (404),
`rate_limit` (429), `timeout` (504), `unavailable` (502), `unknown` (500).

## Local setup

```bash
cd server
npm ci
cp .env.example .env   # optional; sane defaults apply when unset
npm run dev            # tsx watch on http://localhost:8787
```

Verify:

```bash
npm run typecheck
npm run lint
npm test
npm run build          # emits dist/
npm start              # runs dist/index.js
```

## Configuration

All configuration is read from the environment (see `.env.example`). Names only
live in the repo — real values live only on the hosting provider.

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `PORT` | `8787` | Listen port |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `GITHUB_TOKEN` | _(unset)_ | Server-only; raises GitHub rate limit. Never bundled client-side |
| `CACHE_TTL_SECONDS` | `300` | Upstream response cache TTL |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Rate-limit window length |
| `RATE_LIMIT_MAX` | `60` | Max requests per IP per window |
| `BODY_LIMIT_BYTES` | `16384` | Max request body size |
| `REQUEST_TIMEOUT_SECONDS` | `15` | Per-request timeout |

## Security posture

- **No secrets in the client.** `GITHUB_TOKEN` is used only server-side.
- **Security headers** on every response: strict `Content-Security-Policy`
  (`default-src 'none'`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Cross-Origin-Resource-Policy: same-origin`. The framework banner header is
  removed.
- **CORS** allows only `GET` from the configured origins.
- **Rate limiting** is per-IP and in-memory. It is adequate for a single
  instance; behind multiple instances or a CDN, also enforce limits at the
  gateway/load balancer, since each process keeps its own counters.
- **Payload/timeout limits** reject oversized or hung requests before handlers.
- **Privacy-conscious logging**: only the route *pattern*, method, error kind,
  and status are logged. The concrete `:username`, query, and body are never
  written to logs or telemetry.

## Caching and invalidation

- Successful upstream fetches are cached in-memory per username for
  `CACHE_TTL_SECONDS`. Responses also send `Cache-Control: public, max-age=60`.
- The cache is process-local. To force fresh data, **restart the instance**
  (or wait out the TTL). There is no persistent cache to purge.
- If a downstream CDN caches responses, purge its cache for the affected paths
  after a deploy that changes response shape.

## Deployment

Target: any Node 18+ host (small VM, container, or a platform that runs a
long-lived Node process). This service keeps in-memory state (cache +
rate-limit counters), so serverless-per-request runtimes are a poorer fit
unless you externalize both.

1. Set environment variables on the hosting provider (never commit `.env`).
2. Build and run:
   ```bash
   npm ci
   npm run build
   npm start
   ```
3. Point the client's `VITE_API_BASE_URL` at the deployed origin, and add that
   client origin to `CORS_ORIGIN`.
4. Confirm health: `curl https://<host>/health` → `{"status":"ok"}`.

### Rollback

Deploy the previous released build/image and restart. Because state is
in-memory and non-durable, rollback needs no data migration — the cache simply
re-warms and rate-limit windows reset. Keep the prior artifact available until
the new one is confirmed healthy.

## Monitoring

- Poll `/health` for liveness.
- Watch for `event: api_failure` log lines (5xx). A spike in `kind: unavailable`
  or `kind: timeout` usually means GitHub (or the contributions source) is
  degraded rather than a ReadCraft fault.
- Track `429` rates; sustained throttling may mean the limits are too low or an
  abusive client needs blocking at the edge.

## Dependency maintenance

Run on a regular, reviewed cadence:

```bash
cd server
npm audit
npm audit fix           # review the diff before committing
npm outdated            # plan intentional upgrades
```

Apply security patches promptly; batch non-security upgrades and re-run
`npm run typecheck`, `npm test`, and `npm run build` before releasing.
