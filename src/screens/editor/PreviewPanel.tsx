import { useState, type ReactNode } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { cn } from "../../lib/cn";
import {
  generateMarkdown,
  READCRAFT_BRAND,
  READCRAFT_CREDIT_PREFIX,
  READCRAFT_URL,
} from "../../lib/markdown";
import {
  buildReadmeDocument,
  type MetricKind,
  type ReadmeBlock,
} from "../../lib/document";
import { useGitHub } from "../../hooks/useGitHub";
import {
  deriveGitHubStats,
  formatCount,
  type LanguageStat,
} from "../../lib/github";

type Tab = "preview" | "markdown";

/** The 60% right column: Preview / Markdown tabs over the rendered document. */
export function PreviewPanel() {
  const { state } = useProfile();
  const [tab, setTab] = useState<Tab>("preview");

  return (
    <div className="flex h-full flex-col bg-surface/80">
      {/* Tab switch bar */}
      <div className="z-10 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 py-1.5 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <TabButton
            icon="visibility"
            label="Preview"
            active={tab === "preview"}
            onClick={() => setTab("preview")}
          />
          <TabButton
            icon="code"
            label="Markdown"
            active={tab === "markdown"}
            onClick={() => setTab("markdown")}
          />
        </div>
        <div className="flex items-center gap-1.5 text-code-sm text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary-container" />
          <span>Live preview</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-y-auto bg-surface-dim p-4 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(42_78_119_/_0.16),_transparent_48%)]"
        />
        {/* Markdown syntax watermarks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
        >
          <span className="absolute left-8 top-8 text-code-lg font-bold text-surface-container-high/40">
            #
          </span>
          <span className="absolute right-10 top-36 text-code-lg text-surface-container-high/30">
            ---
          </span>
          <span className="absolute bottom-24 left-14 text-code-lg text-surface-container-high/30">
            * [ ]
          </span>
          <span className="absolute bottom-8 right-12 text-code-lg text-surface-container-high/30">
            gfm
          </span>
        </div>

        {tab === "preview" ? (
          <RenderedDocument />
        ) : (
          <pre className="relative z-10 mx-auto w-full max-w-3xl overflow-x-auto rounded-[12px] bg-surface-container-lowest p-6 text-code-sm text-on-surface shadow-2xl">
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
      <Icon
        name={icon}
        size={16}
        className={active ? "text-primary-container" : undefined}
      />
      <span>{label}</span>
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-container" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rendered document - one block renderer per document block kind            */
/* -------------------------------------------------------------------------- */

function RenderedDocument() {
  const { state } = useProfile();
  const { blocks, username } = buildReadmeDocument(state);

  return (
    <div className="rc-elevated relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6 overflow-hidden rounded-[12px] border border-outline-variant/80 bg-surface-container-lowest p-4 sm:p-8">
      {blocks.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          Enable a section to start building your README.
        </p>
      ) : (
        blocks.map((block, i) => (
          <BlockView
            key={`${block.kind}-${i}`}
            block={block}
            username={username}
          />
        ))
      )}

      {/* ReadCraft attribution - always present, mirrors the exported footer. */}
      <div className="flex flex-col gap-3 pt-1">
        <hr className="border-outline-variant/70" />
        <p className="text-center text-body-sm text-on-surface-variant">
          {READCRAFT_CREDIT_PREFIX}{" "}
          <a
            href={READCRAFT_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary-container hover:underline"
          >
            {READCRAFT_BRAND}
          </a>
        </p>
      </div>
    </div>
  );
}

function BlockView({
  block,
  username,
}: {
  block: ReadmeBlock;
  username: string;
}) {
  switch (block.kind) {
    case "identity":
      return (
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h1 className="text-headline-xl font-bold tracking-tight text-on-surface">
            {block.greeting}{" "}
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          {block.handle && (
            <span className="rounded bg-surface-container px-2 py-0.5 text-code-sm text-on-surface-variant">
              {block.handle}
            </span>
          )}
        </div>
      );
    case "headline":
      return (
        <div className="flex flex-col gap-1">
          {block.title && (
            <p className="text-code-lg font-medium text-primary-container">
              {block.title}
            </p>
          )}
          {block.bio && (
            <p className="max-w-2xl text-body-md leading-relaxed text-on-surface-variant">
              {block.bio}
            </p>
          )}
        </div>
      );
    case "focus":
      return (
        <div className="flex flex-col gap-1 rounded-[8px] bg-surface-container-low p-4">
          {block.items.map((item) => (
            <div
              key={item.emoji}
              className="flex items-start gap-1.5 text-body-md"
            >
              <span className="select-none">{item.emoji}</span>
              <span className="min-w-0 break-words text-on-surface">
                {item.prefix}{" "}
                {item.strong ? (
                  <strong className="font-semibold text-on-surface">
                    {item.value}
                  </strong>
                ) : (
                  <span className="text-on-surface-variant">{item.value}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      );
    case "tech":
      return (
        <div className="flex flex-col gap-1">
          <Heading>Tech Stack &amp; Tooling</Heading>
          <div className="flex flex-wrap gap-2 pt-1">
            {block.items.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 shadow-sm"
              >
                {t.badgeUrl ? (
                  <img src={t.badgeUrl} alt="" className="h-3.5 w-3.5 rounded-sm" />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                )}
                <span className="text-code-sm font-medium text-on-surface">
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "metrics":
      return <MetricsView cards={block.cards} username={username} />;
    case "projects":
      return (
        <div className="flex flex-col gap-2 pt-1">
          <Heading>Pinned Repositories</Heading>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {block.items.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-1 rounded-[8px] bg-surface-container-low p-3"
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="book_2"
                    size={15}
                    className="text-primary-container"
                  />
                  <span className="text-code-sm font-bold text-primary-container">
                    {p.name}
                  </span>
                  <span className="ml-auto text-code-sm text-on-surface-variant">
                    ★ {p.stars}
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant">
                  {p.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

/** Palette for the top-languages bar segments (cycles for extra langs). */
const LANG_BAR_COLORS = [
  "#f97316",
  "var(--rc-primary-container, #f7a718)",
  "#00add8",
  "#3178c6",
  "#a97bff",
];

interface LangSegment {
  width: number;
  color: string;
}

/**
 * Segments for the top-languages bar: the top three languages, with their
 * shares normalized so the three add up to 100% (the bar always fills). Falls
 * back to a representative set before real data has loaded.
 */
function topLanguageBar(languages: LanguageStat[]): LangSegment[] {
  const top = languages.slice(0, 3);
  if (top.length === 0) {
    return [
      { width: 48.2, color: "#f97316" },
      { width: 34.6, color: "var(--rc-primary-container, #f7a718)" },
      { width: 17.2, color: "#00add8" },
    ];
  }
  const total = top.reduce((sum, l) => sum + l.percent, 0) || 1;
  return top.map((l, i) => ({
    width: (l.percent / total) * 100,
    color: LANG_BAR_COLORS[i % LANG_BAR_COLORS.length],
  }));
}

function MetricsView({
  cards,
  username,
}: {
  cards: MetricKind[];
  username: string;
}) {
  const has = (kind: MetricKind) => cards.includes(kind);
  // Pull the user's real public data. When unavailable (no username, loading,
  // or an error) cards fall back to placeholder numbers so the layout and
  // design never change - only the values do.
  const { state } = useGitHub(username);
  const bundle = state.status === "success" ? state.bundle : null;
  const stats = bundle ? deriveGitHubStats(bundle) : null;
  const languages = bundle?.languages ?? [];
  const streak = bundle?.streak ?? null;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <Heading>GitHub Activity &amp; Streak</Heading>

      {(has("stats") || has("streak")) && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {has("stats") && (
            <div className="flex flex-col justify-between rounded-[8px] bg-surface-container-low p-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-code-sm font-semibold text-on-surface">
                  GitHub Stats
                </span>
                <Icon
                  name="star"
                  size={16}
                  className="text-primary-container"
                />
              </div>
              <div className="flex flex-col gap-1.5 pt-1 text-code-sm">
                <StatRow
                  k="Total Stars (top repos):"
                  v={stats ? formatCount(stats.starsFromTopRepos) : "2,284"}
                />
                <StatRow
                  k="Public Repositories:"
                  v={stats ? formatCount(stats.publicRepos) : "48"}
                />
                <StatRow
                  k="Followers:"
                  v={stats ? formatCount(stats.followers) : "1,203"}
                />
                <StatRow
                  k="Following:"
                  v={stats ? formatCount(stats.following) : "215"}
                />
              </div>
            </div>
          )}
          {has("streak") && (
            <div className="flex flex-col justify-between rounded-[8px] bg-surface-container-low p-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-code-sm font-semibold text-on-surface">
                  Contribution Streak
                </span>
                <Icon
                  name="local_fire_department"
                  size={16}
                  className="text-[#f97316]"
                />
              </div>
              <div className="grid grid-cols-3 pt-2 text-center">
                <Streak
                  value={streak ? formatCount(streak.currentStreak) : "42"}
                  label="Current"
                />
                <Streak
                  value={streak ? formatCount(streak.longestStreak) : "178"}
                  label="Longest"
                  accent
                />
                <Streak
                  value={streak ? formatCount(streak.total) : "1,892"}
                  label="Total"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {has("graph") && (
        <div className="flex flex-col gap-2 rounded-[8px] bg-surface-container-low p-4">
          <div className="flex items-center justify-between">
            <span className="text-code-sm font-semibold text-on-surface">
              Contribution Graph
            </span>
            <Icon
              name="show_chart"
              size={16}
              className="text-primary-container"
            />
          </div>
          <svg
            className="h-16 w-full text-primary-container/70"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 300 60"
            aria-hidden
          >
            <path
              d="M0,45 Q30,20 60,34 T120,22 T180,40 T240,14 T300,26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0,45 Q30,20 60,34 T120,22 T180,40 T240,14 T300,26 L300,60 L0,60 Z"
              fill="currentColor"
              fillOpacity="0.1"
            />
          </svg>
          <span className="text-label-sm text-on-surface-variant">
            Rendered from a contribution-graph card service in the exported
            Markdown.
          </span>
        </div>
      )}

      {has("topLanguages") && (
        <div className="flex flex-col gap-2 rounded-[8px] bg-surface-container-low p-2">
          <div className="flex items-center justify-between text-code-sm">
            <span className="text-on-surface-variant">
              Top Languages Breakdown
            </span>
            <span className="font-medium text-primary-container">
              {languages.length > 0
                ? languages
                    .slice(0, 3)
                    .map((l) => `${l.language} ${l.percent}%`)
                    .join(" · ")
                : "Rust 48.2% · TS 34.6% · Go 17.2%"}
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
            {topLanguageBar(languages).map((seg, i) => (
              <div
                key={i}
                className="h-full"
                style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
              />
            ))}
          </div>
        </div>
      )}

      {has("snake") && (
        <div className="flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-outline-variant bg-surface-container-low p-4 text-code-sm text-on-surface-variant">
          <Icon name="animation" size={16} className="text-primary-container" />
          Contribution snake animation
        </div>
      )}

      <p className="pt-0.5 text-label-sm text-on-surface-variant">
        Stats, repositories, and languages reflect @
        {username || "your-username"}&apos;s real public data. The exported
        README embeds live cards that render every metric for each viewer.
      </p>
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

function Streak({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "text-headline-md font-bold",
          accent ? "text-primary-container" : "text-on-surface"
        )}
      >
        {value}
      </span>
      <span className="text-label-sm text-on-surface-variant">{label}</span>
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-code-sm font-bold text-primary-container">###</span>
      <h3 className="text-headline-sm font-semibold text-on-surface">
        {children}
      </h3>
    </div>
  );
}


