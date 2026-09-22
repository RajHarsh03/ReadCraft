import { useState, type FormEvent } from "react";
import { Icon } from "../components/ui/Icon";
import { Logo } from "../components/ui/Logo";

const FEATURES = [
  { icon: "verified_user", tint: "text-primary", label: "No GitHub token required" },
  { icon: "bolt", tint: "text-tertiary", label: "100% Client-side Markdown" },
  { icon: "terminal", tint: "text-secondary", label: "Exports raw .md or SVG" },
];

const SAMPLES = ["shadcn", "leerob", "antfu"];

const NAV_ITEMS = ["Showcase", "Templates", "Documentation", "Open App"];

interface UsernameEntryProps {
  onGenerate: (username: string) => void;
}

/** Landing / username-entry screen. */
export function UsernameEntry({ onGenerate }: UsernameEntryProps) {
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const clean = (value || "torvalds").trim().replace(/^@/, "");
    onGenerate(clean || "torvalds");
  };

  return (
    <div className="rc-app-shell min-h-screen text-on-surface">
      {/* Header */}
      <header className="rc-nav-surface fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <span className="text-headline-sm font-semibold tracking-tight">
              ReadCraft
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item}
                href="#"
                className={
                  i === 0
                    ? "rounded-lg bg-primary-container px-3 py-1 text-label-md font-semibold text-on-primary-container shadow-[0_6px_18px_-8px_rgb(247_167_24_/_0.9)]"
                    : "rounded px-3 py-1 text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                }
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onGenerate("alexrivera")}
              className="rc-amber-glow hidden items-center gap-1.5 rounded bg-primary-container px-3 py-1.5 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim sm:inline-flex"
            >
              <Icon name="terminal" size={16} />
              <span>Launch Studio</span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Icon name="person" size={18} className="text-on-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden pt-14">
        {/* Ambient dev grid + markdown watermarks */}
        <div aria-hidden className="rc-landing-grid pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-tertiary/10 blur-[140px]" />
          <span className="absolute left-8 top-16 text-label-md text-outline-variant/40">### profile_init.md</span>
          <span className="absolute right-12 top-28 text-label-md text-outline-variant/40">&gt; stream: ready</span>
          <span className="absolute left-16 top-64 text-label-md text-outline-variant/30">- - -</span>
          <span className="absolute bottom-40 right-24 text-label-md text-outline-variant/30">bash</span>
          <span className="absolute bottom-16 left-28 text-label-md text-outline-variant/40"># dev_identity.json</span>
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-12">
          {/* Brand cluster */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high/90 px-4 py-1 shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-label-sm uppercase tracking-widest text-secondary">
                README Compiler
              </span>
              <span className="text-label-sm text-outline-variant">/</span>
              <span className="text-label-sm font-semibold text-primary">v1.4</span>
            </div>
            <div className="mb-3 flex items-center justify-center gap-3">
              <Logo size={36} />
              <h1 className="bg-gradient-to-r from-on-surface via-on-surface to-secondary bg-clip-text text-headline-xl font-bold tracking-tight text-transparent">ReadCraft</h1>
            </div>
            <p className="max-w-xl text-headline-md text-secondary drop-shadow-sm">
              Craft a GitHub profile README worthy of your code.
            </p>
          </div>

          {/* Username entry bar */}
          <div className="mt-10 w-full max-w-2xl">
            <form
              onSubmit={submit}
              className="rc-elevated rounded-[12px] border border-outline-variant/80 bg-surface-container-low/95 p-2 backdrop-blur-sm"
            >
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center rounded-[8px] border border-transparent bg-surface-container px-4 py-2.5 transition-colors focus-within:border-border-strong focus-within:bg-surface-container-high">
                  <span className="mr-1 select-none text-code-lg text-secondary-container">
                    github.com/
                  </span>
                  <input
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-transparent text-code-lg tracking-tight text-on-surface placeholder:text-outline-variant/60 focus:outline-none"
                    placeholder="torvalds"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <div className="hidden items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-outline-variant sm:inline-flex">
                    <span className="text-label-sm">Enter</span>
                    <span className="text-label-sm">↵</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="rc-amber-glow inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-primary-container px-8 py-3 text-headline-sm font-bold text-on-primary-container transition-all duration-150 hover:-translate-y-px hover:bg-primary-fixed-dim active:scale-[0.98]"
                >
                  <span>Generate Profile</span>
                  <Icon name="arrow_forward" size={18} />
                </button>
              </div>
            </form>

            {/* Feature guarantees */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-label-sm text-on-surface-variant/80">
              {FEATURES.map((f, i) => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Icon name={f.icon} size={14} className={f.tint} />
                    {f.label}
                  </span>
                  {i < FEATURES.length - 1 && (
                    <span className="text-outline-variant">•</span>
                  )}
                </div>
              ))}
            </div>

            {/* Quick presets */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-label-sm text-outline-variant">Quick sample:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="rounded bg-surface-container px-2 py-0.5 text-label-sm text-secondary transition-colors hover:text-primary"
                >
                  @{s}
                </button>
              ))}
            </div>
          </div>

          {/* Tilted preview mockup */}
          <div className="relative mt-14 w-full max-w-4xl [perspective:1200px]">
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-70 blur-xl" />
            <div className="rc-elevated relative -rotate-[1.5deg] overflow-hidden rounded-[12px] border border-outline-variant/80 bg-surface-container-low transition-transform duration-500 ease-out hover:rotate-0">
              {/* Window toolbar */}
              <div className="flex items-center justify-between bg-surface-container-high px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-error-container" />
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-bright" />
                  <span className="ml-2 flex items-center gap-1.5 text-code-sm text-on-surface-variant">
                    <Icon name="markdown" size={14} />
                    README.md — Live Preview
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm text-primary">
                    Standard Spec
                  </span>
                  <span className="flex items-center gap-1 text-label-sm text-secondary">
                    <Icon name="visibility" size={14} />
                    Rich View
                  </span>
                </div>
              </div>

              {/* Mock rendered README */}
              <div className="space-y-6 bg-surface-container-lowest/80 p-8">
                <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-6">
                  <span className="absolute right-3 top-2 text-code-sm text-outline-variant/30"># profile</span>
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/20 text-headline-lg font-bold text-primary">
                      RC
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-headline-lg font-bold text-on-surface">
                          Alex Rivera
                        </h3>
                        <span className="rounded bg-surface-variant px-1.5 py-0.5 text-label-sm text-on-surface-variant">
                          he/him
                        </span>
                      </div>
                      <p className="mt-0.5 text-body-md text-secondary">
                        Building distributed databases, high-throughput pipelines & modern developer tools.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-code-sm text-on-surface-variant sm:flex-col">
                      <span className="flex items-center gap-1 rounded bg-surface-container-high px-2 py-1">
                        <Icon name="star" size={13} className="text-primary" /> 14.8k stars
                      </span>
                      <span className="flex items-center gap-1 rounded bg-surface-container-high px-2 py-1">
                        <Icon name="fork_right" size={13} className="text-tertiary" /> 2.1k forks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="relative rounded-[8px] bg-surface-container p-4">
                    <span className="absolute right-2 top-2 text-code-sm text-outline-variant/30">&gt;</span>
                    <div className="mb-2 text-label-sm uppercase tracking-wider text-secondary">
                      Metrics Snapshot
                    </div>
                    <div className="space-y-2 text-code-sm">
                      <Row k="Commits (2025)" v="2,481" />
                      <Row k="Pull Requests" v="312 merged" vClass="text-primary" />
                      <Row k="Contributed Repos" v="43" vClass="text-tertiary" />
                    </div>
                    <svg className="mt-3 h-7 w-full text-primary/80" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                      <path d="M0,25 Q20,10 40,22 T80,14 T120,6 T160,18 T200,8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                      <path d="M0,25 Q20,10 40,22 T80,14 T120,6 T160,18 T200,8 L200,30 L0,30 Z" fill="currentColor" fillOpacity="0.12" />
                    </svg>
                  </div>

                  <div className="relative rounded-[8px] bg-surface-container p-4 md:col-span-2">
                    <span className="absolute right-2 top-2 text-code-sm text-outline-variant/30"># stack</span>
                    <div className="mb-2 text-label-sm uppercase tracking-wider text-secondary">
                      Primary Arsenal
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ["Rust", "text-primary"],
                        ["TypeScript", "text-primary"],
                        ["Go", "text-primary"],
                        ["PostgreSQL", "text-on-surface"],
                        ["GraphQL", "text-on-surface"],
                        ["Tailwind CSS", "text-tertiary"],
                        ["Next.js", "text-tertiary"],
                        ["Docker", "text-on-surface-variant"],
                        ["Kubernetes", "text-on-surface-variant"],
                      ].map(([name, tint]) => (
                        <span
                          key={name}
                          className={`rounded bg-surface-container-high px-2.5 py-1 text-code-sm ${tint}`}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 text-code-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon name="bookmark" size={15} className="text-primary" />
                        <span className="font-semibold text-on-surface">hyper-kv</span>
                        <span className="text-body-sm text-secondary">— Fast in-memory key-value engine</span>
                      </div>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-label-sm text-primary">v0.9.4</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-1 w-full bg-gradient-to-r from-primary-container via-tertiary to-secondary-container" />
            </div>

            <div className="mt-4 flex items-center justify-between px-2 text-code-sm text-outline-variant/60">
              <span className="flex items-center gap-1">
                <Icon name="auto_awesome" size={14} />
                Auto-synced via public GitHub Events API
              </span>
              <span>output: 100% standard markdown</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ k, v, vClass = "text-on-surface" }: { k: string; v: string; vClass?: string }) {
  return (
    <div className="flex items-center justify-between text-code-sm">
      <span className="text-on-surface-variant">{k}</span>
      <span className={`font-semibold ${vClass}`}>{v}</span>
    </div>
  );
}
