# ReadCraft — Client

The web client for ReadCraft: enter a GitHub username, edit a profile README
across structured sections, preview the exact generated GitHub-Flavored
Markdown (GFM), and copy or download a valid `README.md`.

Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm 10+

## Local setup

```bash
cd server
npm ci            # install API dependencies
cd ../client
npm ci            # install client dependencies
cp .env.example .env.local   # then fill in values as needed
npm run dev       # start both UI (:5173) and API (:8787)
```

`npm run dev` from `client/` starts both processes. To run them separately,
use `npm run dev:client` in `client/` and `npm run dev` in `server/`.

## Commands

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start client and API together (`:5173` + `:8787`). |
| `npm run dev:client`   | Start only the Vite client (API must run separately). |
| `npm run dev:api`      | Start only the API from `../server`.                 |
| `npm run build`        | Type-check (`tsc -b`) and build for production.   |
| `npm run preview`      | Serve the production build locally.               |
| `npm run typecheck`    | Type-check without emitting.                      |
| `npm run lint`         | Lint all TypeScript/TSX.                          |
| `npm run lint:fix`     | Lint and auto-fix.                                |
| `npm run format`       | Format `src` with Prettier.                       |
| `npm run format:check` | Check formatting without writing.                 |
| `npm test`             | Run the unit/component test suite once (Vitest).  |
| `npm run test:watch`   | Run tests in watch mode.                          |
| `npm run coverage`     | Run tests with a coverage report.                 |

## Architecture

```text
src/
├── main.tsx                 App entry
├── App.tsx                  Top-level view routing (landing ↔ builder)
├── types.ts                 ProfileState — the single document model
├── store.tsx                Profile state (React context + useReducer)
├── lib/
│   ├── cn.ts                className join helper
│   └── markdown.ts          generateMarkdown(state): GFM export source
├── components/
│   ├── ui/                  Icon, Logo, Button, Toggle, Field, SectionCard
│   └── shell/               TopNav, LeftRail
└── screens/
    ├── UsernameEntry.tsx    Landing / username entry
    ├── EditorWorkbench.tsx  Builder shell + sub-header (copy/download)
    └── editor/
        ├── SectionsEditor.tsx   Left column: section accordion editor
        └── PreviewPanel.tsx     Right column: preview + markdown tabs
```

### Design principles

- **One document model.** `ProfileState` is the source of truth for both the
  rendered preview and the exported Markdown.
- **Honest data.** Fetched data is used as-is or clearly labeled as demo.
- **No secrets in the client.** GitHub tokens live only in the server layer
  (added in a later phase); only `VITE_`-prefixed variables reach the browser.

## Testing

Unit and component tests run on Vitest with React Testing Library and jsdom.
Place tests next to the code they cover as `*.test.ts` / `*.test.tsx`.

## Deployment

The client is a static build (`npm run build` → `dist/`) deployable to Vercel,
Netlify, or Cloudflare Pages. The read-only GitHub API proxy is added as
serverless functions in a later phase; its secrets are configured only through
the hosting provider's environment variables.
