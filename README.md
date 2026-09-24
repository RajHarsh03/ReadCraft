<div align="center">

# ReadCraft

**Craft a GitHub profile README worthy of your code.**

Enter a GitHub username, edit your profile across structured sections, preview
the exact GitHub-Flavored Markdown you'll ship, and copy or download a valid
`README.md` — with self-hosted, theme-aware stat cards baked in.

🌐 **Live:** [readcraft.harshx.in](https://readcraft.harshx.in)

</div>

---

ReadCraft is a full-stack monorepo — a **React 19 client** and a small
**read-only Fastify API** — deployed together to a single Vercel project so the
browser talks to a same-origin `/api` with zero CORS setup. No GitHub token ever
reaches the browser.

Every metric image (stats, streak, languages, contribution graph, snake, pinned
projects) is **rendered on our own server as an SVG** from real GitHub data, so
your README never depends on a third-party card service that can be paused, and
needs no GitHub Action to set up.

## Highlights

- **One document model, two views.** The live preview and the Markdown tab are
  both derived from a single `ProfileState`, so they can never disagree. The
  preview renders through `marked` + GitHub's own Markdown CSS, so what you see
  is what GitHub shows.
- **Self-hosted, theme-aware SVG cards.** Stats, streak, top languages,
  contribution graph, animated contribution snake, and pinned projects — all
  generated server-side and tinted with your template's accent via `?accent=`.
- **18 style templates.** Each template is a layout *and* a GitHub-safe style
  (heading style, alignment, tech display, accent color, dividers). GitHub
  strips CSS/fonts from README markdown, so templates change the things GitHub
  actually honors.
- **Rich editor.** Technology picker, social-badge section, pinned-project
  editing, keyboard-accessible section reordering, and a Shields.io Badge
  Studio.
- **Drafts that stick.** Auto-saved to the browser; exportable/importable as
  versioned JSON.
- **Resilient & accessible by default.** Manual editing and export keep working
  even if the API is unavailable.

## Repository layout

```text
ReadCraft/
├── client/            React 19 + TypeScript + Vite + Tailwind app
├── server/            Fastify read-only GitHub API + SVG renderers
├── api/
│   └── index.ts       Vercel serverless entry that runs the Fastify app
├── vercel.json        Build + routing for the single-project deploy
├── package.json       Deploy shell: builds the client, holds API runtime deps
├── tsconfig.json      Module resolution for the api/ function
└── .github/           CI workflow (typecheck, lint, test, build; Node 24)
```

## Prerequisites

- Node.js 20+ (developed and CI-tested on Node 24)
- npm 10+

## Local development

```bash
# API dependencies
cd server && npm ci

# client dependencies
cd ../client && npm ci

# optional: only when the API runs on a non-default origin
cp .env.example .env.local

# starts BOTH the UI (:5173) and the API (:8787) together
npm run dev
```

`npm run dev` from `client/` runs the Vite client and the API together (via
`concurrently`). To run them separately: `npm run dev:client` in `client/` and
`npm run dev` in `server/`.

By default the client calls the API at same-origin `/api`, which Vite proxies to
`:8787` in development. Set `VITE_API_BASE_URL` only when the API runs on a
different origin.

## Commands

### Client (run in `client/`)

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Start client and API together (`:5173` + `:8787`).    |
| `npm run dev:client` | Start only the Vite client (API must run separately). |
| `npm run dev:api`    | Start only the API (`npm run dev` in `../server`).    |
| `npm run build`      | Type-check (`tsc -b`) and build for production.       |
| `npm run preview`    | Serve the production build locally.                   |
| `npm run typecheck`  | Type-check without emitting.                          |
| `npm run lint`       | Lint all TypeScript/TSX.                              |
| `npm run format`     | Format sources with Prettier.                         |
| `npm run format:check` | Verify formatting (used in CI).                     |
| `npm test`           | Run the unit/component suite once (Vitest).           |
| `npm run coverage`   | Run tests with a coverage report.                     |

### API (run in `server/`)

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | tsx watch on `http://localhost:8787` |
| `npm run typecheck` | Type-check without emitting          |
| `npm run lint`      | Lint the server source               |
| `npm test`          | Run the API test suite (Vitest)      |
| `npm run build`     | Compile to `dist/`                   |
| `npm start`         | Run the compiled server              |

## API endpoints

### JSON data

Responses are wrapped as `{ "data": ... }` on success or
`{ "error": { "kind", "message" } }` on failure.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Liveness probe (rate-limit exempt) |
| GET | `/api/github/:username/profile` | Public profile fields |
| GET | `/api/github/:username/repositories?limit=` | Featured repos + total count |
| GET | `/api/github/:username/languages` | Language breakdown |
| GET | `/api/github/:username/streak` | Contribution streak (current/longest/total) |
| GET | `/api/github/:username/contributions` | Per-day contribution calendar |

Error `kind` values: `invalid_username` (400), `not_found` (404),
`rate_limit` (429), `timeout` (504), `unavailable` (502), `unknown` (500).

### SVG cards

Each returns an `image/svg+xml` you can embed directly with `<img>`. All accept
an optional `?accent=rrggbb` (validated to `#rrggbb`) to match your theme.

| Path | Card |
| ---- | ---- |
| `/api/github/:username/stats.svg` | GitHub stats summary |
| `/api/github/:username/streak.svg` | Current / longest / total streak |
| `/api/github/:username/languages.svg` | Top-language bar |
| `/api/github/:username/graph.svg` | Contribution calendar |
| `/api/github/:username/snake.svg` | Animated contribution snake |
| `/api/github/:username/projects.svg` | Pinned / featured repositories |

The `snake.svg` card also takes `?header=rrggbb`, so the contribution-count text
can use the template accent while the snake body keeps its own distinct color.

## Environment

Names live in the repo; real values live only on the hosting provider.

**Client** (`client/.env.example`) — only `VITE_`-prefixed vars reach the browser:

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `VITE_API_BASE_URL` | _(empty)_ | Empty = same-origin `/api`. Set to an absolute origin only when the API is hosted separately. |

**Server** (`server/.env.example`):

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

One document model drives everything. `ProfileState` (via `buildReadmeDocument`)
is the single source of truth for both the rendered preview and the exported
Markdown, so they can never drift apart.

```text
client/src/
├── main.tsx                 App entry
├── App.tsx                  Error boundary + toast/router providers + route switch
├── router.tsx               Hash router (landing, builder, templates, badges, docs, 404)
├── types.ts                 ProfileState — the document model
├── store.tsx                Profile state + draft auto-save/restore
├── hooks/useGitHub.ts       Fetches a user's public GitHub bundle
├── lib/                     document, markdown, github, persistence, draftFile,
│                            templates, techCatalog, badges, sections, username, export
├── components/              ErrorBoundary, BadgeStudio, MarkdownPreview,
│                            ContributionCalendar, ui/, shell/
└── screens/                 UsernameEntry, EditorWorkbench, TemplatesScreen,
                             BadgesScreen, DocsScreen, NotFound, editor/

server/src/
├── index.ts                 Standalone listen entry (local dev / non-Vercel hosts)
├── app.ts                   buildApp(): routes, hooks, security, rate limiting
├── config.ts                Environment configuration
├── rateLimit.ts             In-memory per-IP fixed-window limiter
├── security.ts              Security response headers
├── cache.ts                 TTL cache
├── username.ts              Normalize / validate usernames
└── github/
    ├── client.ts            Upstream GitHub fetch
    ├── service.ts           Derivations (profile, repos, languages, streak, contributions)
    ├── types.ts             Shared GitHub types
    ├── cardSvg.ts           Stats, streak, and languages cards
    ├── graphSvg.ts          Contribution-calendar card
    ├── snakeSvg.ts          Animated contribution-snake card
    └── projectsSvg.ts       Pinned-repositories card
```

### Design principles

- **One document model.** Preview and export are derived from the same blocks.
- **Self-hosted, honest data.** Metric cards are rendered on our server from
  real GitHub data — never fabricated, never dependent on a third-party card
  service or a GitHub Action.
- **GitHub-safe styling.** Templates only change what GitHub honors in README
  markdown (alignment, heading style, tech display, accent-on-SVG, dividers).
- **Graceful degradation.** An API outage never blocks manual editing or export.
- **No secrets in the client.** Only `VITE_`-prefixed variables reach the
  browser; the GitHub token stays server-side.
- **Accessible by default.** Labels tied to inputs, named icon-only buttons, and
  `prefers-reduced-motion` support.

## Security posture (API)

- Security headers on every response: strict `Content-Security-Policy`
  (`default-src 'none'`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`. SVG card responses
  add `Cross-Origin-Resource-Policy: cross-origin` so GitHub can embed them; all
  other responses stay `same-origin`. The framework banner is removed.
- CORS allows only `GET` from the configured origins.
- Per-IP, in-memory rate limiting (best-effort; enforce hard limits at the edge
  behind multiple instances).
- Payload and timeout limits reject oversized or hung requests.
- Privacy-conscious logging: only route pattern, method, error kind, and status
  are logged — never the concrete username, query, or body.

## Deployment

The client (static build) and the API (serverless function) deploy together as
one Vercel project on one domain, so the browser uses same-origin `/api` with no
CORS setup.

- `vercel.json` builds the client (`npm run vercel-build`), serves
  `client/dist`, and rewrites `/api/*` to the `api/index.ts` function while
  routing everything else to the SPA's `index.html`.
- Set `GITHUB_TOKEN` in the Vercel project to raise GitHub's rate limit
  (optional but recommended).

A note on runtime state: the API's cache and rate-limit counters are in-memory
and per-instance, resetting on cold starts. That's fine here — the cache is only
an optimization and rate limiting is best-effort. For hard global limits, enforce
them at the edge.

## Testing & CI

Unit, component, and API tests run on Vitest (the client also uses React Testing
Library and jsdom). Tests live next to the code they cover as `*.test.ts` /
`*.test.tsx`. CI (`.github/workflows/ci.yml`, Node 24) runs typecheck, lint,
format check, tests, and build for both `client/` and `server/` on every push.

## Dependency maintenance

Run `npm audit` and `npm outdated` on a regular, reviewed cadence in both
`client/` and `server/`. Apply security patches promptly; batch other upgrades
and re-run typecheck, tests, and build before releasing.
