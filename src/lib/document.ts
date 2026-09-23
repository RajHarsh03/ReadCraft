import type { PinnedProject, ProfileState, SectionId, Tech } from "../types";
import { normalizeUsername } from "./username";

/**
 * The README document model.
 *
 * `buildReadmeDocument` is the single source of truth for *which* sections
 * appear and *in what order*. Both the Markdown exporter and the live preview
 * derive from the blocks it returns, so the two can never disagree about
 * content or ordering. Each renderer is free to present a block differently
 * (Markdown emits image links; the preview shows representative cards), but the
 * set and sequence of blocks is decided here, once.
 */

export type MetricKind =
  "stats" | "streak" | "graph" | "topLanguages" | "snake";

export interface FocusItem {
  emoji: string;
  prefix: string;
  value: string;
  /** Whether the value renders in bold / strong emphasis. */
  strong: boolean;
}

export type ReadmeBlock =
  | { kind: "identity"; greeting: string; handle: string }
  | { kind: "headline"; title: string; bio: string }
  | { kind: "focus"; items: FocusItem[] }
  | { kind: "tech"; items: Tech[] }
  | { kind: "metrics"; cards: MetricKind[] }
  | { kind: "projects"; items: PinnedProject[] };

export interface ReadmeDocument {
  /** Ordered, non-empty blocks for every enabled section. */
  blocks: ReadmeBlock[];
  /** Normalized username, shared by renderers that build URLs. */
  username: string;
}

/**
 * Live card-service image URL for a metric, built from an already-encoded
 * username. This is the single source of truth for these URLs: both the
 * Markdown exporter and the live preview call it, so what you see in the
 * preview is exactly what the exported README embeds. Each URL points at a
 * public card service that renders the viewer's real GitHub data.
 */
export function metricImageUrl(kind: MetricKind, encodedUsername: string): string {
  switch (kind) {
    case "stats":
      return `https://github-readme-stats.vercel.app/api?username=${encodedUsername}`;
    case "streak":
      return `https://streak-stats.demolab.com?user=${encodedUsername}`;
    case "graph":
      return `https://github-readme-activity-graph.vercel.app/graph?username=${encodedUsername}`;
    case "topLanguages":
      return `https://github-readme-stats.vercel.app/api/top-langs/?username=${encodedUsername}`;
    case "snake":
      return `https://raw.githubusercontent.com/${encodedUsername}/${encodedUsername}/output/snake.svg`;
  }
}

/** Human-readable alt text / label for each metric card. */
export function metricLabel(kind: MetricKind): string {
  switch (kind) {
    case "stats":
      return "GitHub stats";
    case "streak":
      return "Contribution streak";
    case "graph":
      return "Contribution graph";
    case "topLanguages":
      return "Top languages";
    case "snake":
      return "Contribution snake";
  }
}

/* -------------------------------------------------------------------------- */
/*  Per-section builders                                                      */
/* -------------------------------------------------------------------------- */

function buildIdentity(
  state: ProfileState,
  username: string
): ReadmeBlock | null {
  const name = state.basics.fullName.trim();
  const greeting = name ? `Hi there, I'm ${name}` : "Hi there";
  const handle = username ? `@${username}` : "";
  // Always present when enabled: the greeting stands on its own.
  return { kind: "identity", greeting, handle };
}

function buildHeadline(state: ProfileState): ReadmeBlock | null {
  const headline = state.headline.primary.trim();
  const company = state.basics.company.trim();
  const bio = state.headline.bio.trim();
  const location = state.basics.location.trim();

  const title = headline
    ? company
      ? `${headline} at ${company}`
      : headline
    : "";
  const bioText = bio ? (location ? `${bio} Based in ${location}.` : bio) : "";

  if (!title && !bioText) return null;
  return { kind: "headline", title, bio: bioText };
}

function buildFocus(state: ProfileState): ReadmeBlock | null {
  const { working, learning, askMeAbout } = state.focus;
  const items: FocusItem[] = [];
  if (working.trim()) {
    items.push({
      emoji: "🔭",
      prefix: "I'm currently working on",
      value: working.trim(),
      strong: true,
    });
  }
  if (learning.trim()) {
    items.push({
      emoji: "🌱",
      prefix: "I'm currently learning",
      value: learning.trim(),
      strong: true,
    });
  }
  if (askMeAbout.trim()) {
    items.push({
      emoji: "💬",
      prefix: "Ask me about",
      value: askMeAbout.trim(),
      strong: false,
    });
  }
  return items.length ? { kind: "focus", items } : null;
}

function buildTech(state: ProfileState): ReadmeBlock | null {
  const items = state.tech.filter((t) => t.name.trim());
  return items.length ? { kind: "tech", items } : null;
}

function buildMetrics(state: ProfileState): ReadmeBlock | null {
  const { metrics } = state;
  const cards: MetricKind[] = [];
  if (metrics.showStatsCard) cards.push("stats");
  if (metrics.showStreak) cards.push("streak");
  if (metrics.showGraph) cards.push("graph");
  if (metrics.showTopLanguages) cards.push("topLanguages");
  if (metrics.showSnake) cards.push("snake");
  return cards.length ? { kind: "metrics", cards } : null;
}

function buildProjects(state: ProfileState): ReadmeBlock | null {
  const items = state.pinned.filter((p) => p.name.trim());
  return items.length ? { kind: "projects", items } : null;
}

const BUILDERS: Record<
  SectionId,
  (state: ProfileState, username: string) => ReadmeBlock | null
> = {
  profile: buildIdentity,
  headline: (state) => buildHeadline(state),
  focus: (state) => buildFocus(state),
  tech: (state) => buildTech(state),
  metrics: (state) => buildMetrics(state),
  pinned: (state) => buildProjects(state),
};

/* -------------------------------------------------------------------------- */
/*  Assembly                                                                  */
/* -------------------------------------------------------------------------- */

export function buildReadmeDocument(state: ProfileState): ReadmeDocument {
  const username = normalizeUsername(state.basics.username);
  const blocks: ReadmeBlock[] = [];

  for (const id of state.order) {
    if (!state.enabled[id]) continue;
    const block = BUILDERS[id]?.(state, username) ?? null;
    if (block) blocks.push(block);
  }

  return { blocks, username };
}
