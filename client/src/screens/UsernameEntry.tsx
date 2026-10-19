import { useState, type FormEvent } from "react";
import { Icon } from "../components/ui/Icon";
import { Logo } from "../components/ui/Logo";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useRouter } from "../router";

const SAMPLES = ["shadcn", "leerob", "antfu"];

/** Editorial feature index — rendered as a numbered, ruled list. */
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

/** Landing / username-entry screen — neo-brutalist editorial, full-bleed. */
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
      {/* Header — paper band with a hard ink rule, full width */}
      <header className="rc-nav-surface sticky top-0 z-50 border-b-2 border-ink">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="rc-brand text-[1.35rem] leading-none">
              ReadCraft
            </span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate({ name: "templates" })}
              className="hidden font-mono text-label-md font-bold uppercase tracking-wide text-on-surface transition-colors hover:text-primary sm:inline"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => navigate({ name: "docs" })}
              className="hidden font-mono text-label-md font-bold uppercase tracking-wide text-on-surface transition-colors hover:text-primary sm:inline"
            >
              Docs
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => onGenerate("alexrivera")}
              className="nb-press inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-primary-container px-4 py-2 font-mono text-label-sm font-bold uppercase tracking-wider text-on-primary-container shadow-[4px_4px_0_0_var(--color-ink)] hover:bg-primary-fixed-dim"
            >
              Launch Studio
            </button>
          </nav>
        </div>
      </header>

      {/* HERO — asymmetric split, serif display heading + marker highlight */}
      <section className="rc-landing-grid border-b-2 border-ink">
        <div className="grid grid-cols-1 gap-x-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
          {/* Left: the statement */}
          <div className="flex flex-col justify-center lg:col-span-7 lg:border-r-2 lg:border-ink lg:pr-10">
            <span className="nb-shadow-sm mb-6 inline-flex w-fit items-center gap-2 rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-primary-container" />
              <span className="font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                GitHub profile README studio
              </span>
            </span>
            <h1 className="relative font-display text-[clamp(2.4rem,5vw,3.5rem)] font-[650] leading-[1.04] tracking-tight text-on-surface">
              Craft a profile README worthy of your{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-2px] bottom-1 z-0 h-4 -rotate-1 rounded-[2px] bg-secondary-fixed opacity-80"
                />
                <span className="relative z-10 text-primary">code.</span>
              </span>
            </h1>
            <p className="mt-5 max-w-md text-body-lg leading-relaxed text-on-surface-variant">
              A live editor with true GitHub-Flavored Markdown preview,
              self-hosted stat cards, and one-click export. No token, no
              boilerplate.
            </p>

            {/* Prompt — a bordered card with the username line + Generate */}
            <form onSubmit={submit} className="mt-8 max-w-md">
              <label className="mb-2 block font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                Start with a username
              </label>
              <div className="nb-shadow flex items-center gap-2 rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-2 focus-within:shadow-[3px_3px_0_0_var(--color-ink)]">
                <span className="select-none whitespace-nowrap font-mono text-code-sm font-semibold text-on-surface-variant">
                  github.com/
                </span>
                <input
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="GitHub username"
                  className="min-w-0 flex-1 bg-transparent font-mono text-body-md font-semibold text-on-surface placeholder:text-outline focus:outline-none"
                  placeholder="torvalds"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  type="submit"
                  aria-label="Generate profile"
                  className="nb-press inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border-2 border-ink bg-primary-container px-4 py-2 font-mono text-label-sm font-bold uppercase tracking-wider text-on-primary-container shadow-[2px_2px_0_0_var(--color-ink)] hover:bg-primary-fixed-dim"
                >
                  Generate
                  <Icon name="arrow_forward" size={16} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Try
                </span>
                {SAMPLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue(s)}
                    className="nb-press-sm rounded-[4px] border-2 border-ink bg-surface-container-lowest px-2.5 py-1 font-mono text-label-sm font-semibold text-on-surface hover:bg-surface-container"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right: a single preview specimen card */}
          <div className="hidden flex-col justify-center lg:col-span-5 lg:flex lg:pl-10">
            <div className="nb-shadow-lg -rotate-[1.5deg] overflow-hidden rounded-[4px] border-2 border-ink bg-surface-container-lowest transition-transform duration-500 ease-out hover:rotate-0">
              <div className="flex items-center justify-between border-b-2 border-ink bg-paper px-4 py-2.5">
                <span className="flex items-center gap-2 font-mono text-code-sm text-on-surface">
                  <Icon
                    name="description"
                    size={14}
                    className="text-primary-container"
                  />
                  README.md
                </span>
                <span className="font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  preview
                </span>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-primary-fixed text-headline-sm font-bold text-on-primary-fixed">
                    AR
                  </div>
                  <div>
                    <div className="font-display text-headline-sm font-bold text-on-surface">
                      Alex Rivera
                    </div>
                    <div className="text-body-sm text-on-surface-variant">
                      Systems &amp; UI engineer
                    </div>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-ink" />
                <div className="space-y-2 font-mono text-code-sm">
                  <Row k="commits (2025)" v="2,481" />
                  <Row k="pull requests" v="312" vClass="text-primary" />
                  <Row k="repositories" v="43" vClass="text-tertiary" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Rust", "TypeScript", "Go", "Postgres", "Docker"].map(
                    (t) => (
                      <span
                        key={t}
                        className="rounded-[4px] border-2 border-ink bg-surface-container-low px-2 py-0.5 font-mono text-label-sm font-semibold text-on-surface-variant"
                      >
                        {t}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="h-1 w-full bg-primary-container" />
            </div>
            <p className="mt-3 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
              output: 100% standard markdown
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE INDEX — numbered editorial list, ruled rows */}
      <section className="border-b-2 border-ink">
        <div className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="font-display text-headline-lg font-bold tracking-tight text-on-surface">
              What it does
            </h2>
            <span className="font-mono text-label-sm font-bold uppercase tracking-[0.25em] text-on-surface-variant">
              02 — Capabilities
            </span>
          </div>
          <div className="border-y-2 border-ink">
            {FEATURES.map((f) => (
              <div
                key={f.n}
                className="group grid grid-cols-12 items-baseline gap-4 border-b border-ink/20 py-6 transition-colors last:border-b-0 hover:bg-surface-container-low"
              >
                <span className="col-span-2 font-mono text-headline-md font-bold text-outline transition-colors group-hover:text-primary md:col-span-1">
                  {f.n}
                </span>
                <h3 className="col-span-10 font-display text-headline-sm font-semibold text-on-surface md:col-span-4">
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

      {/* HOW IT WORKS — three offset-shadow cards */}
      <section className="border-b-2 border-ink">
        <div className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="font-display text-headline-lg font-bold tracking-tight text-on-surface">
              How it works
            </h2>
            <span className="font-mono text-label-sm font-bold uppercase tracking-[0.25em] text-on-surface-variant">
              03 — Workflow
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="nb-press rounded-[4px] border-2 border-ink bg-surface-container-lowest p-6 shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <span className="font-display text-[2.5rem] font-bold leading-none text-primary">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-headline-sm font-semibold text-on-surface">
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

      {/* CTA — a bold, boxed statement bar */}
      <section className="border-b-2 border-ink">
        <div className="flex flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-[650] leading-tight tracking-tight text-on-surface">
            Ready to craft your README?
          </h2>
          <button
            type="button"
            onClick={() => onGenerate("alexrivera")}
            className="nb-press inline-flex shrink-0 items-center gap-2 rounded-[4px] border-2 border-ink bg-primary-container px-6 py-3 font-mono text-label-md font-bold uppercase tracking-wider text-on-primary-container shadow-[4px_4px_0_0_var(--color-ink)] hover:bg-primary-fixed-dim"
          >
            Launch Studio
            <Icon name="arrow_forward" size={18} />
          </button>
        </div>
      </section>

      {/* Footer — paper band */}
      <footer className="rc-nav-surface border-t-2 border-ink">
        <div className="flex flex-col items-start justify-between gap-4 px-5 py-6 text-body-sm text-on-surface-variant sm:flex-row sm:items-center sm:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2">
              <Logo size={22} />
              <span className="rc-brand text-on-surface">ReadCraft</span>
            </span>
            <span className="text-outline">·</span>
            <span>
              Built by{" "}
              <a
                href="https://github.com/RajHarsh03"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline decoration-primary underline-offset-4 hover:text-primary-container"
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
              className="nb-press-sm inline-flex items-center gap-2 rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-1.5 font-mono text-code-sm text-on-surface hover:bg-surface-container"
            >
              <GitHubMark className="h-4 w-4" />
              ReadCraft
            </a>
            <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
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
