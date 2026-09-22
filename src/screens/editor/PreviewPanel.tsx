import { useState } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { cn } from "../../lib/cn";
import { generateMarkdown } from "../../lib/markdown";

type Tab = "preview" | "markdown";

/** The 60% right column: Preview / Markdown tabs over the rendered document. */
export function PreviewPanel() {
  const { state } = useProfile();
  const [tab, setTab] = useState<Tab>("preview");

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Tab switch bar */}
      <div className="z-10 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 py-1.5">
        <div className="flex items-center gap-1">
          <TabButton icon="visibility" label="Preview" active={tab === "preview"} onClick={() => setTab("preview")} />
          <TabButton icon="code" label="Markdown" active={tab === "markdown"} onClick={() => setTab("markdown")} />
        </div>
        <div className="flex items-center gap-1.5 text-code-sm text-on-surface-variant">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
          <span>README rendered in 14ms</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex flex-1 justify-center overflow-y-auto bg-surface-dim p-4 lg:p-8">
        {/* Markdown syntax watermarks */}
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          <span className="absolute left-8 top-8 text-code-lg font-bold text-surface-container-high/40">#</span>
          <span className="absolute right-10 top-36 text-code-lg text-surface-container-high/30">---</span>
          <span className="absolute bottom-24 left-14 text-code-lg text-surface-container-high/30">* [ ]</span>
          <span className="absolute bottom-8 right-12 text-code-lg text-surface-container-high/30">gfm</span>
        </div>

        {tab === "preview" ? (
          <RenderedDocument />
        ) : (
          <pre className="relative z-10 w-full max-w-3xl overflow-x-auto rounded-[12px] bg-surface-container-lowest p-6 text-code-sm text-on-surface shadow-2xl">
            {generateMarkdown(state)}
          </pre>
        )}
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 rounded px-4 py-1.5 text-label-md transition-colors",
        active
          ? "bg-surface-container text-on-surface"
          : "text-on-surface-variant hover:bg-surface-container/50"
      )}
    >
      <Icon name={icon} size={16} className={active ? "text-primary-container" : undefined} />
      <span>{label}</span>
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-container" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rendered GFM document                                                     */
/* -------------------------------------------------------------------------- */

function RenderedDocument() {
  const { state } = useProfile();
  const { basics, headline, focus, tech, metrics, pinned, enabled } = state;

  return (
    <div className="relative z-10 flex w-full max-w-3xl flex-col gap-6 rounded-[12px] bg-surface-container-lowest p-4 shadow-2xl sm:p-8">
      {/* Profile header */}
      {enabled.profile && (
        <div className="flex flex-col gap-1 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <h1 className="text-headline-xl font-bold tracking-tight text-on-surface">
              Hi there, I'm {basics.fullName} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <span className="rounded bg-surface-container px-2 py-0.5 text-code-sm text-on-surface-variant">
              @{basics.username}
            </span>
          </div>
          {enabled.headline && (
            <>
              <p className="text-code-lg font-medium text-primary-container">
                {headline.primary}{" "}
                <span className="font-normal text-on-surface-variant">at</span> {basics.company}
              </p>
              <p className="max-w-2xl pt-1 text-body-md leading-relaxed text-on-surface-variant">
                {headline.bio} Based in {basics.location}.
              </p>
            </>
          )}
        </div>
      )}

      {/* Status bullets */}
      {enabled.focus && (
        <div className="flex flex-col gap-1 rounded-[8px] bg-surface-container-low p-4">
          <Bullet emoji="🔭">
            I'm currently working on <strong className="font-semibold text-on-surface">{focus.working}</strong>
          </Bullet>
          <Bullet emoji="🌱">
            I'm currently learning <strong className="font-semibold text-on-surface">{focus.learning}</strong>
          </Bullet>
          <Bullet emoji="💬">
            Ask me about <span className="text-on-surface-variant">{focus.askMeAbout}</span>
          </Bullet>
        </div>
      )}

      {/* Tech stack */}
      {enabled.tech && tech.length > 0 && (
        <div className="flex flex-col gap-1">
          <Heading>Tech Stack & Tooling</Heading>
          <div className="flex flex-wrap gap-2 pt-1">
            {tech.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-code-sm font-medium text-on-surface">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GitHub metrics */}
      {enabled.metrics && (metrics.showStatsCard || metrics.showStreak) && (
        <div className="flex flex-col gap-2 pt-1">
          <Heading>GitHub Activity & Streak</Heading>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {metrics.showStatsCard && (
              <div className="flex flex-col justify-between rounded-[8px] bg-surface-container-low p-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-code-sm font-semibold text-on-surface">
                    {basics.fullName.split(" ")[0]}'s GitHub Stats
                  </span>
                  <Icon name="star" size={16} className="text-primary-container" />
                </div>
                <div className="flex flex-col gap-1.5 pt-1 text-code-sm">
                  <StatRow k="Total Stars Earned:" v="2,284" />
                  <StatRow k="Total Commits (2025):" v="1,892" />
                  <StatRow k="Total PRs Merged:" v="347" />
                  <StatRow k="Contributed to:" v="48 Repos" />
                </div>
              </div>
            )}
            {metrics.showStreak && (
              <div className="flex flex-col justify-between rounded-[8px] bg-surface-container-low p-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-code-sm font-semibold text-on-surface">Contribution Streak</span>
                  <Icon name="local_fire_department" size={16} className="text-[#f97316]" />
                </div>
                <div className="grid grid-cols-3 pt-2 text-center">
                  <Streak value="42" label="Current" />
                  <Streak value="178" label="Longest" accent />
                  <Streak value="1,892" label="Total" />
                </div>
              </div>
            )}
          </div>

          {metrics.showTopLanguages && (
            <div className="flex flex-col gap-2 rounded-[8px] bg-surface-container-low p-2">
              <div className="flex items-center justify-between text-code-sm">
                <span className="text-on-surface-variant">Top Languages Breakdown</span>
                <span className="font-medium text-primary-container">Rust 48.2% · TS 34.6% · Go 17.2%</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div className="h-full bg-[#f97316]" style={{ width: "48.2%" }} />
                <div className="h-full bg-primary-container" style={{ width: "34.6%" }} />
                <div className="h-full bg-[#00add8]" style={{ width: "17.2%" }} />
              </div>
            </div>
          )}

          {metrics.showSnake && (
            <div className="flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-outline-variant bg-surface-container-low p-4 text-code-sm text-on-surface-variant">
              <Icon name="animation" size={16} className="text-primary-container" />
              Contribution snake animation
            </div>
          )}
        </div>
      )}

      {/* Pinned repos */}
      {enabled.pinned && pinned.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <Heading>Pinned Repositories</Heading>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {pinned.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 rounded-[8px] bg-surface-container-low p-3">
                <div className="flex items-center gap-1.5">
                  <Icon name="book_2" size={15} className="text-primary-container" />
                  <span className="text-code-sm font-bold text-primary-container">{p.name}</span>
                  <span className="ml-auto text-code-sm text-on-surface-variant">★ {p.stars}</span>
                </div>
                <span className="text-body-sm text-on-surface-variant">{p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-code-sm font-bold text-primary-container">###</span>
      <h3 className="text-headline-sm font-semibold text-on-surface">{children}</h3>
    </div>
  );
}

function Bullet({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-body-md">
      <span className="select-none">{emoji}</span>
      <span className="text-on-surface">{children}</span>
    </div>
  );
}

function StatRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-on-surface-variant">{k}</span>
      <span className="font-bold text-on-surface">{v}</span>
    </div>
  );
}

function Streak({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={cn("text-headline-md font-bold", accent ? "text-primary-container" : "text-on-surface")}>
        {value}
      </span>
      <span className="text-label-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
