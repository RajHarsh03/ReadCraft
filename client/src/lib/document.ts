import type {
  PinnedProject,
  ProfileState,
  SectionId,
  SocialLink,
  Tech,
  TemplateStyle,
} from "../types";
import { normalizeUsername } from "./username";

/**
 * Absolute origin of the ReadCraft API, used to build self-hosted image URLs
 * that must resolve from GitHub (where a relative "/api" path would not work).
 * Prefers VITE_API_BASE_URL; otherwise the current site origin (correct for a
 * same-origin deploy). Empty only during SSR/tests.
 */
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "")
).replace(/\/$/, "");

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
  | { kind: "social"; items: SocialLink[] }
  | { kind: "focus"; items: FocusItem[] }
  | { kind: "tech"; items: Tech[] }
  | { kind: "metrics"; cards: MetricKind[] }
  | { kind: "projects"; items: PinnedProject[] };

export interface ReadmeDocument {
  /** Ordered, non-empty blocks for every enabled section. */
  blocks: ReadmeBlock[];
  /** Normalized username, shared by renderers that build URLs. */
  username: string;
  /** Presentation style the renderer applies. */
  style: TemplateStyle;
}

/**
 * Live card-service image URL for a metric, built from an already-encoded
 * username. This is the single source of truth for these URLs: both the
 * Markdown exporter and the live preview call it, so what you see in the
 * preview is exactly what the exported README embeds. Each URL points at a
 * public card service that renders the viewer's real GitHub data.
 */
export function metricImageUrl(
  kind: MetricKind,
  encodedUsername: string,
  accent?: string
): string {
  // Every metric image is self-hosted: rendered by the ReadCraft API from real
  // data, so none depends on a third-party card service (which may be paused)
  // or a GitHub Action the user would have to set up.
  const q = accent ? `?accent=${encodeURIComponent(accent)}` : "";
  const file: Record<MetricKind, string> = {
    stats: "stats.svg",
    streak: "streak.svg",
    graph: "graph.svg",
    topLanguages: "languages.svg",
    snake: "snake.svg",
  };
  return `${API_ORIGIN}/api/github/${encodedUsername}/${file[kind]}${q}`;
}

/** Self-hosted pinned-repositories card image URL for a username. */
export function projectsImageUrl(
  encodedUsername: string,
  accent?: string
): string {
  const q = accent ? `?accent=${encodeURIComponent(accent)}` : "";
  return `${API_ORIGIN}/api/github/${encodedUsername}/projects.svg${q}`;
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

function buildSocial(state: ProfileState): ReadmeBlock | null {
  const items = state.social.filter((s) => s.badgeUrl.trim());
  return items.length ? { kind: "social", items } : null;
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
  // Order: cards first, then the wide calendar widgets (graph / snake) last,
  // so the contribution calendar always sits below Top Languages.
  const cards: MetricKind[] = [];
  if (metrics.showStatsCard) cards.push("stats");
  if (metrics.showStreak) cards.push("streak");
  if (metrics.showTopLanguages) cards.push("topLanguages");
  if (metrics.showGraph) cards.push("graph");
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
  social: (state) => buildSocial(state),
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

  return { blocks, username, style: state.templateStyle };
}
