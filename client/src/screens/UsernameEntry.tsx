import { useState, type FormEvent } from "react";
import { Icon } from "../components/ui/Icon";
import { Logo } from "../components/ui/Logo";
import { useRouter } from "../router";

const SAMPLES = ["shadcn", "leerob", "antfu"];

/** Editorial feature index — rendered as a numbered list, not cards. */
const FEATURES = [
  {
    n: "01",
    title: "Visual section editor",
    body: "Edit profile, headline, focus, tech stack, and pinned projects with live-synced controls.",
  },
  {
    n: "02",
    title: "Real GitHub data",
    body: "Pull your public profile, top languages, and best repositories in one click — no token.",
  },
  {
    n: "03",
    title: "True GFM preview",
    body: "See rendered GitHub-Flavored Markdown as you type, then flip to the raw source anytime.",
  },
  {
    n: "04",
    title: "Self-hosted stat cards",
    body: "Stats, streak, languages, graph and snake rendered on our server — themed to match.",
  },
  {
    n: "05",
    title: "Copy or download",
    body: "Export a clean README.md, or copy the Markdown straight into your profile repository.",
  },
];

const STEPS = [
  { n: "01", title: "Enter a handle", body: "Any public GitHub username." },
  {
    n: "02",
    title: "Craft the sections",
    body: "Toggle, edit and reorder freely.",
  },
  {
    n: "03",
    title: "Export the Markdown",
    body: "Copy or download README.md.",
  },
];

interface UsernameEntryProps {
  onGenerate: (username: string) => void;
}

/** Landing / username-entry screen — editorial, left-aligned, type-led. */
export function UsernameEntry({ onGenerate }: UsernameEntryProps) {
  const [value, setValue] = useState("");
  const { navigate } = useRouter();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const clean = (value || "torvalds").trim().replace(/^@/, "");
    onGenerate(clean || "torvalds");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Header — sticky rule-under bar, full width */}
      <header className="sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-1.5">
            <Logo size={24} />
            <span className="rc-brand text-[1.35rem] leading-none">
              ReadCraft
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate({ name: "templates" })}
              className="text-label-md font-semibold text-on-surface transition-colors hover:text-primary"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => navigate({ name: "docs" })}
              className="hidden text-label-md font-semibold text-on-surface transition-colors hover:text-primary sm:inline"
            >
              Docs
            </button>
            <button
              type="button"
              onClick={() => onGenerate("alexrivera")}
              className="inline-flex items-center gap-1.5 border border-on-surface/80 px-4 py-1.5 text-label-md font-semibold text-on-surface transition-colors hover:bg-on-surface hover:text-surface"
            >
              Launch Studio
            </button>
          </nav>
        </div>
      </header>

      {/* HERO — asymmetric 2-column, type-led */}
      <section className="border-b border-outline-variant/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-10 px-6 lg:grid-cols-12 lg:px-10">
          {/* Left: the statement */}
          <div className="col-span-1 flex flex-col justify-center py-12 lg:col-span-7 lg:border-r lg:border-outline-variant/60 lg:py-16 lg:pr-10">
            <span className="mb-6 flex items-center gap-3 text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
              <span className="text-primary">01</span>
              <span className="h-px w-4 bg-outline-variant" />
              GitHub profile README studio
            </span>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.02] tracking-tight text-on-surface">
              Craft a profile README worthy of your{" "}
              <span className="italic text-primary">code.</span>
            </h1>
            <p className="mt-5 max-w-md text-body-lg leading-relaxed text-on-surface-variant">
              A live editor with true GitHub-Flavored Markdown preview,
              self-hosted stat cards, and one-click export. No token, no
              boilerplate.
            </p>

            {/* Prompt — a single underlined input line, editorial */}
            <form onSubmit={submit} className="mt-8 max-w-md">
              <label className="mb-2 block text-label-sm uppercase tracking-widest text-on-surface-variant">
                Start with a username
              </label>
              <div className="flex items-end gap-3 border-b-2 border-border-strong pb-2 transition-colors focus-within:border-primary-container">
                <span className="select-none text-headline-md font-semibold text-on-surface-variant">
                  github.com/
                </span>
                <input
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="GitHub username"
                  className="min-w-0 flex-1 bg-transparent text-headline-md font-semibold tracking-tight text-on-surface placeholder:font-semibold placeholder:text-on-surface-variant/70 focus:outline-none"
                  placeholder="torvalds"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Generate profile"
                  className="mb-1 inline-flex shrink-0 items-center gap-1.5 bg-primary-container px-4 py-2 text-label-md font-bold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
                >
                  Generate
                  <Icon name="arrow_forward" size={16} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-label-sm">
                <span className="font-semibold uppercase tracking-widest text-on-surface-variant">
                  Try
                </span>
                {SAMPLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue(s)}
                    className="font-semibold text-on-surface underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary hover:decoration-primary-container"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right: a single, calm preview specimen */}
          <div className="col-span-1 hidden flex-col justify-center py-16 [perspective:1200px] lg:col-span-5 lg:flex lg:pl-10">
            <div className="-rotate-[1.5deg] border border-outline-variant/70 bg-surface-container-lowest shadow-[0_30px_70px_-40px_rgb(0_0_0_/_0.9)] transition-transform duration-500 ease-out hover:rotate-0">
              <div className="flex items-center justify-between border-b border-outline-variant/70 px-4 py-2.5">
                <span className="flex items-center gap-2 text-code-sm text-on-surface-variant">
                  <Icon name="description" size={13} className="text-primary" />
                  README.md
                </span>
                <span className="text-label-sm uppercase tracking-widest text-outline-variant">
                  preview
                </span>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-headline-sm font-bold text-primary">
                    AR
                  </div>
                  <div>
                    <div className="text-headline-sm font-bold text-on-surface">
                      Alex Rivera
                    </div>
                    <div className="text-body-sm text-on-surface-variant">
                      Systems &amp; UI engineer
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-outline-variant/50" />
                <div className="space-y-2 text-code-sm">
                  <Row k="commits (2025)" v="2,481" />
                  <Row k="pull requests" v="312" vClass="text-primary" />
                  <Row k="repositories" v="43" vClass="text-tertiary" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Rust", "TypeScript", "Go", "Postgres", "Docker"].map(
                    (t) => (
                      <span
                        key={t}
                        className="border border-outline-variant/70 px-2 py-0.5 text-code-sm text-on-surface-variant"
                      >
                        {t}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="h-0.5 w-full bg-primary-container" />
            </div>
            <p className="mt-3 text-right text-label-sm text-on-surface-variant">
              output: 100% standard markdown
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE INDEX — a numbered editorial list, ruled rows */}
      <section className="border-b border-outline-variant/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-headline-lg font-bold tracking-tight text-on-surface">
              What it does
            </h2>
            <span className="text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
              02 — Capabilities
            </span>
          </div>
          <div className="divide-y divide-outline-variant/50 border-y border-outline-variant/50">
            {FEATURES.map((f) => (
              <div
                key={f.n}
                className="group grid grid-cols-12 items-baseline gap-4 py-6 transition-colors hover:bg-surface-container-lowest/40"
              >
                <span className="col-span-2 font-display text-headline-md font-bold text-outline-variant transition-colors group-hover:text-primary md:col-span-1">
                  {f.n}
                </span>
                <h3 className="col-span-10 text-headline-sm font-semibold text-on-surface md:col-span-4">
                  {f.title}
                </h3>
                <p className="col-span-12 max-w-xl text-body-md text-on-surface-variant md:col-span-7">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — three ruled columns */}
      <section className="border-b border-outline-variant/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-headline-lg font-bold tracking-tight text-on-surface">
              How it works
            </h2>
            <span className="text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
              03 — Workflow
            </span>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-outline-variant/50 bg-outline-variant/50 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-surface p-8">
                <span className="font-display text-[2.5rem] font-bold leading-none text-primary/80">
                  {s.n}
                </span>
                <h3 className="mt-4 text-headline-sm font-semibold text-on-surface">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-body-md text-on-surface-variant">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — a bold full-width statement bar */}
      <section className="border-b border-outline-variant/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 lg:flex-row lg:items-center lg:px-10">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-on-surface">
            Ready to craft your README?
          </h2>
          <button
            type="button"
            onClick={() => onGenerate("alexrivera")}
            className="inline-flex shrink-0 items-center gap-2 bg-primary-container px-7 py-3.5 text-headline-sm font-bold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
          >
            Launch Studio
            <Icon name="arrow_forward" size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-4 text-body-sm text-on-surface-variant sm:flex-row sm:items-center lg:px-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2">
              <Logo size={20} />
              <span className="rc-brand text-on-surface">ReadCraft</span>
            </span>
            <span className="text-outline-variant">·</span>
            <span>
              Built by{" "}
              <a
                href="https://github.com/RajHarsh03"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:text-primary hover:decoration-primary-container"
              >
                Harsh
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href="https://github.com/RajHarsh03/ReadCraft"
              target="_blank"
              rel="noreferrer"
              aria-label="ReadCraft on GitHub"
              title="RajHarsh03/ReadCraft"
              className="inline-flex items-center gap-2 border border-outline-variant/70 px-3 py-1.5 text-code-sm text-on-surface transition-colors hover:border-primary-container/60 hover:text-primary"
            >
              <GitHubMark className="h-4 w-4" />
              ReadCraft
            </a>
            <span className="uppercase tracking-widest text-on-surface-variant">
              100% client-side · no data stored
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** GitHub mark (inline SVG — Material Symbols has no brand glyph). */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function Row({
  k,
  v,
  vClass = "text-on-surface",
}: {
  k: string;
  v: string;
  vClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface-variant">{k}</span>
      <span className={`font-semibold ${vClass}`}>{v}</span>
    </div>
  );
}
