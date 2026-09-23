# ReadCraft

Craft a GitHub profile README worthy of your code. Enter a GitHub username,
edit a profile README across structured sections, preview the exact generated
GitHub-Flavored Markdown (GFM), and copy or download a valid `README.md`.

ReadCraft is a full-stack monorepo: a React client and a small read-only
Fastify API, deployed together to a single Vercel project (same-origin `/api`).
No GitHub token ever reaches the browser.

## Highlights

- Live editor with a preview and a Markdown tab, both derived from one document
  model, so they can never disagree.
- Real public GitHub data: profile, top languages, featured repositories, and
  contribution streak. Values GitHub's REST API cannot supply come from a
  dependable public source, never fabricated.
- Layout templates, a technology picker, pinned-project editing, keyboard
  accessible section reordering, and a Shields.io Badge Studio.
- Drafts auto-save to the browser and can be exported/imported as versioned
  JSON.
- Accessible by default and resilient: manual editing and export keep working
  even if the API or a card provider is unavailable.

## Repository layout

```text
ReadCraft/
├── client/          React 19 + TypeScript + Vite + Tailwind app
├── server/          Fastify read-only GitHub API (source imported by api/)
├── api/
│   └── [...path].ts Vercel serverless entry that runs the Fastify app
├── vercel.json      Build + routing for the single-project deploy
├── package.json     Deploy shell: builds the client, holds API runtime deps
├── tsconfig.json    Module resolution for the api/ function
└── DEPLOY.md        Step-by-step Vercel deployment guide
```

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm 10+

## Local development

```bash
cd server
npm ci                        # install API dependencies
cd ../client
npm ci                        # install client dependencies
cp .env.example .env.local    # optional; only for a non-default API origin
npm run dev                   # starts BOTH the UI (:5173) and the API (:8787)
```

`npm run dev` from `client/` runs the Vite client and the API together (via
`concurrently`). Run them separately with `npm run dev:client` in `client/` and
`npm run dev` in `server/`.

By default the client calls the API at same-origin `/api`, which Vite proxies
to `:8787` in development. Set `VITE_API_BASE_URL` only when the API runs on a
different origin.

## Client commands (run in `client/`)

| Command                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Start client and API together (`:5173` + `:8787`).     |
| `npm run dev:client`   | Start only the Vite client (API must run separately).  |
| `npm run dev:api`      | Start only the API (`npm run dev` in `../server`).     |
| `npm run build`        | Type-check (`tsc -b`) and build for production.        |
| `npm run preview`      | Serve the production build locally.                    |
| `npm run typecheck`    | Type-check without emitting.                           |
| `npm run lint`         | Lint all TypeScript/TSX.                               |
| `npm test`             | Run the unit/component test suite once (Vitest).       |
| `npm run coverage`     | Run tests with a coverage report.                      |

## API commands (run in `server/`)

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | tsx watch on `http://localhost:8787` |
| `npm run typecheck` | Type-check without emitting          |
| `npm run lint`      | Lint the server source               |
| `npm test`          | Run the API test suite (Vitest)      |
| `npm run build`     | Compile to `dist/`                   |
| `npm start`         | Run the compiled server              |

## API endpoints

All responses are JSON, wrapped as `{ "data": ... }` on success or
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

## Environment

Names only live in the repo; real values live only on the hosting provider.

Client (`client/.env.example`) - only `VITE_`-prefixed vars reach the browser:

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `VITE_API_BASE_URL` | _(empty)_ | Empty = same-origin `/api`. Set to an absolute origin only when the API is hosted separately. |

Server (`server/.env.example`):

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `PORT` | `8787` | Listen port |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `GITHUB_TOKEN` | _(unset)_ | Server-only; raises GitHub's rate limit. Never bundled client-side |
| `CACHE_TTL_SECONDS` | `300` | Upstream response cache TTL |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Rate-limit window length |
| `RATE_LIMIT_MAX` | `60` | Max requests per IP per window |
| `BODY_LIMIT_BYTES` | `16384` | Max request body size |
| `REQUEST_TIMEOUT_SECONDS` | `15` | Per-request timeout |

## Architecture

One document model drives everything. `ProfileState` (via
`buildReadmeDocument`) is the single source of truth for both the rendered
preview and the exported Markdown.

```text
client/src/
├── main.tsx                 App entry
├── App.tsx                  Error boundary + toast/router providers + route switch
├── router.tsx               Hash-based router (landing, builder, templates, badges, docs, 404)
├── types.ts                 ProfileState - the document model
├── store.tsx                Profile state + draft auto-save/restore
├── hooks/useGitHub.ts       Fetches a user's public GitHub bundle
├── lib/                     document, markdown, github, persistence, draftFile,
│                            templates, techCatalog, badges, sections, username, export
├── components/              ErrorBoundary, BadgeStudio, ui/, shell/
└── screens/                 landing, builder, templates, badges, docs, 404, editor/

server/src/
├── index.ts                 Standalone listen entry (local dev / non-Vercel hosts)
├── app.ts                   buildApp(): routes, hooks, security, rate limiting
├── config.ts                Environment configuration
├── rateLimit.ts             In-memory per-IP fixed-window limiter
├── security.ts              Security response headers
├── cache.ts                 TTL cache
├── username.ts              Normalize / validate usernames
└── github/                  client (upstream fetch), service (derivations), types
```

### Design principles

- **One document model.** Preview and export are derived from the same blocks.
- **Honest data.** Fetched data is used as-is; unavailable metrics come from a
  dependable public source, never invented.
- **Graceful degradation.** An API or provider outage never blocks manual
  editing or export.
- **No secrets in the client.** Only `VITE_`-prefixed variables reach the
  browser; the GitHub token stays server-side.
- **Accessible by default.** Labels tied to inputs, named icon-only buttons,
  and `prefers-reduced-motion` support.

## Security posture (API)

- Security headers on every response: strict `Content-Security-Policy`
  (`default-src 'none'`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Cross-Origin-Resource-Policy: same-origin`. The framework banner is removed.
- CORS allows only `GET` from the configured origins.
- Per-IP, in-memory rate limiting (best-effort; enforce hard limits at the edge
  behind multiple instances).
- Payload and timeout limits reject oversized or hung requests.
- Privacy-conscious logging: only route pattern, method, error kind, and status
  are logged; the concrete username, query, and body never are.

## Deployment

The client (static build) and the API (serverless function) deploy together as
one Vercel project on one domain, so the browser uses same-origin `/api` with no
CORS setup. See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions and
environment-variable setup.

A note on runtime state: the API's cache and rate-limit counters are in-memory
and per-instance, resetting on cold starts. That is fine here - the cache is
only an optimization and rate limiting is best-effort. For hard global limits,
enforce them at the edge.

## Testing

Unit, component, and API tests run on Vitest (client also uses React Testing
Library and jsdom). Tests live next to the code they cover as `*.test.ts` /
`*.test.tsx`.

## Dependency maintenance

Run `npm audit` and `npm outdated` on a regular, reviewed cadence in both
`client/` and `server/`. Apply security patches promptly; batch other upgrades
and re-run typecheck, tests, and build before releasing.
