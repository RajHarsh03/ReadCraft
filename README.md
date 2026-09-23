# ReadCraft - Client

The web client for ReadCraft: enter a GitHub username, edit a profile README
across structured sections, preview the exact generated GitHub-Flavored
Markdown (GFM), and copy or download a valid `README.md`.

Built with React 19, TypeScript, Vite, and Tailwind CSS. It talks to the
read-only [ReadCraft API](../server/README.md) for public GitHub data - no
GitHub token ever reaches the browser.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm 10+

## Local setup

```bash
cd server
npm ci                        # install API dependencies
cd ../client
npm ci                        # install client dependencies
cp .env.example .env.local    # optional; only needed for a non-default API origin
npm run dev                   # starts BOTH the UI (:5173) and the API (:8787)
```

`npm run dev` from `client/` runs the Vite client and the API together (via
`concurrently`). To run them separately: `npm run dev:client` here, and
`npm run dev` in `server/`.

By default the client calls the API at same-origin `/api`, which Vite proxies
to `:8787` in development. Set `VITE_API_BASE_URL` only when the API runs on a
different origin (see [Environment](#environment)).

## Commands

| Command                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Start client and API together (`:5173` + `:8787`).     |
| `npm run dev:client`   | Start only the Vite client (API must run separately).  |
| `npm run dev:api`      | Start only the API (`npm run dev` in `../server`).     |
| `npm run build`        | Type-check (`tsc -b`) and build for production.        |
| `npm run preview`      | Serve the production build locally.                    |
| `npm run typecheck`    | Type-check without emitting.                           |
| `npm run lint`         | Lint all TypeScript/TSX.                               |
| `npm run lint:fix`     | Lint and auto-fix.                                     |
| `npm run format`       | Format `src` with Prettier.                            |
| `npm run format:check` | Check formatting without writing.                      |
| `npm test`             | Run the unit/component test suite once (Vitest).       |
| `npm run test:watch`   | Run tests in watch mode.                               |
| `npm run coverage`     | Run tests with a coverage report.                      |

## Environment

Only variables prefixed with `VITE_` are exposed to the browser bundle. Copy
`.env.example` to `.env.local` and fill in as needed.

| Variable            | Default          | Notes                                                     |
| ------------------- | ---------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL` | _(empty)_        | Empty = same-origin `/api` (proxied in dev). Set to an absolute origin (e.g. `https://api.readcraft.example`) when the API is hosted separately. |

No secrets belong in the client. GitHub tokens live only in the server's
environment.

## Architecture

```text
src/
├── main.tsx                 App entry
├── App.tsx                  Error boundary + toast/router providers + route switch (lazy-loads secondary routes)
├── router.tsx               Hash-based router (landing, builder, templates, badges, docs, notfound)
├── types.ts                 ProfileState - the single document model
├── store.tsx                Profile state (React context + useReducer) + draft auto-save/restore
├── hooks/
│   └── useGitHub.ts         Fetches a user's public GitHub bundle
├── lib/
│   ├── cn.ts                className join helper
│   ├── username.ts          Normalize / validate / URL-encode usernames
│   ├── document.ts          buildReadmeDocument(state) → structured blocks (+ metric card URLs)
│   ├── markdown.ts          generateMarkdown(state): GFM export source
│   ├── github.ts            API client + mapping fetched data into the document
│   ├── persistence.ts       localStorage draft save/load with schema versioning
│   ├── draftFile.ts         Export/import a draft as a portable JSON file
│   ├── templates.ts         Layout presets (enabled sections + order)
│   ├── techCatalog.ts       Selectable technology groups
│   ├── badges.ts            Shields.io badge spec → image URL / Markdown
│   ├── sections.ts          Section id → label/icon metadata
│   └── export.ts            Clipboard copy + file-download helpers
├── components/
│   ├── ErrorBoundary.tsx    Recoverable fallback for render errors
│   ├── BadgeStudio.tsx      Interactive Shields.io badge builder
│   ├── ui/                  Icon, Logo, Button, Toggle, Field, SectionCard, Toast
│   └── shell/               AppShell (persistent frame), TopNav, LeftRail, PageShell
└── screens/
    ├── UsernameEntry.tsx    Landing / username entry
    ├── EditorWorkbench.tsx  Builder shell + sub-header (copy/download/reset)
    ├── TemplatesScreen.tsx  Template gallery
    ├── BadgesScreen.tsx     Badge Studio page
    ├── DocsScreen.tsx       Documentation page
    ├── NotFoundScreen.tsx   404 for unknown routes
    └── editor/
        ├── SectionsEditor.tsx      Left column: section accordion editor
        ├── GitHubConnectionCard.tsx  Auto-loads + imports public GitHub data
        ├── TemplatePicker.tsx      Apply a layout preset
        ├── TechSelector.tsx        Add/search/remove technologies
        ├── ProjectsEditor.tsx      Pinned-project CRUD + reorder
        ├── SectionOrderEditor.tsx  Keyboard-accessible section reordering
        ├── DraftFileEditor.tsx     JSON draft export/import
        └── PreviewPanel.tsx        Right column: preview + Markdown tabs
```

### Design principles

- **One document model.** `ProfileState` (via `buildReadmeDocument`) is the
  single source of truth for both the rendered preview and the exported
  Markdown, so the two can never disagree.
- **Honest data.** Fetched GitHub data is used as-is; values the public API
  can't provide (e.g. streaks) come from a dependable public source, never
  fabricated.
- **Graceful degradation.** If the API or a card provider is unavailable, every
  section stays manually editable and export still works.
- **No secrets in the client.** Only `VITE_`-prefixed variables reach the
  browser; GitHub tokens live only in the server layer.
- **Accessible by default.** Labels are associated with inputs, icon-only
  buttons have accessible names, and animations respect
  `prefers-reduced-motion`.

## Routing

A tiny hash-based router (`router.tsx`) is used deliberately: it survives a
full refresh on any static host without server rewrites. Routes: `/` (landing),
`/builder/:username?`, `/templates`, `/badges`, `/docs`, and a `/404` fallback
for anything unrecognized. Templates, Badge Studio, Docs, and the 404 screen are
code-split and loaded on demand.

## Persistence

Drafts auto-save to `localStorage` (debounced) and restore on reload; storage
errors never lose the in-memory draft. A draft can also be exported to and
re-imported from a versioned JSON file (`lib/draftFile.ts`).

## Testing

Unit and component tests run on Vitest with React Testing Library and jsdom.
Place tests next to the code they cover as `*.test.ts` / `*.test.tsx`. Shared
test helpers live in `src/test/`.

## Deployment

The client is a static build (`npm run build` → `dist/`) deployable to Vercel,
Netlify, or Cloudflare Pages. It needs the ReadCraft API reachable:

- Same-origin: serve the API under `/api` on the same host (leave
  `VITE_API_BASE_URL` empty).
- Separate origin: set `VITE_API_BASE_URL` to the API's URL and add the client
  origin to the API's `CORS_ORIGIN`.

See [`../server/README.md`](../server/README.md) for API deployment, rollback,
and operations.
