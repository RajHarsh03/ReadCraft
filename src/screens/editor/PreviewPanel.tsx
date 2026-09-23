import { useState, type ReactNode } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { cn } from "../../lib/cn";
import { generateMarkdown } from "../../lib/markdown";
import {
  buildReadmeDocument,
  metricImageUrl,
  metricLabel,
  type MetricKind,
  type ReadmeBlock,
} from "../../lib/document";
import { encodeUsername } from "../../lib/username";

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
/*  Rendered document — one block renderer per document block kind            */
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

/** Order the metric cards render in — mirrors the exported Markdown. */
const METRIC_ORDER: MetricKind[] = [
  "stats",
  "streak",
  "topLanguages",
  "graph",
  "snake",
];

function MetricsView({
  cards,
  username,
}: {
  cards: MetricKind[];
  username: string;
}) {
  const active = METRIC_ORDER.filter((kind) => cards.includes(kind));

  return (
    <div className="flex flex-col gap-2 pt-1">
      <Heading>GitHub Activity &amp; Streak</Heading>

      {username ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {active.map((kind) => (
              <MetricCard key={kind} kind={kind} username={username} />
            ))}
          </div>
          <p className="pt-0.5 text-label-sm text-on-surface-variant">
            These are live cards rendered from @{username}&apos;s real GitHub
            data — the exact images embedded in your exported README.
          </p>
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-[8px] border border-dashed border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
          <Icon name="info" size={16} className="text-primary-container" />
          Add a GitHub username in Profile Basics to load your live metric
          cards.
        </div>
      )}
    </div>
  );
}

/**
 * A single live metric card. The image is the same card-service URL embedded
 * in the exported Markdown, so the preview is what a viewer of the README
 * actually sees. Cards can be wide (full-width) or paired two-up.
 */
function MetricCard({
  kind,
  username,
}: {
  kind: MetricKind;
  username: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = metricImageUrl(kind, encodeUsername(username));
  const label = metricLabel(kind);
  // Graph and snake are wide banners; stats/streak/top-langs pair two-up.
  const wide = kind === "graph" || kind === "snake";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[8px] border border-outline-variant/70 bg-surface-container-low p-2",
        wide && "md:col-span-2"
      )}
    >
      {failed ? (
        <div className="flex items-center gap-2 px-1 py-3 text-code-sm text-on-surface-variant">
          <Icon name="cloud_off" size={15} />
          {label} preview couldn&apos;t load. It still renders in the exported
          README.
        </div>
      ) : (
        <img
          src={src}
          alt={`${label} for ${username}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="mx-auto block h-auto w-full max-w-full"
        />
      )}
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


