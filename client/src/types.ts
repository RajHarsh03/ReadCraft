/** ReadCraft profile model - shared by the editor and the live preview. */

export interface ProfileBasics {
  fullName: string;
  username: string;
  location: string;
  company: string;
}

export interface Headline {
  primary: string;
  bio: string;
}

export interface Focus {
  working: string;
  learning: string;
  askMeAbout: string;
}

export interface Metrics {
  showStatsCard: boolean;
  showStreak: boolean;
  showGraph: boolean;
  showSnake: boolean;
  showTopLanguages: boolean;
}

export interface PinnedProject {
  id: string;
  name: string;
  stars: string;
  description: string;
}

/** A tech badge with an associated colour dot and optional badge image. */
export interface Tech {
  name: string;
  color: string;
  /** Optional badge/logo image URL rendered instead of the colour dot. */
  badgeUrl?: string;
}

/** A social link shown as a clickable badge (e.g. LinkedIn, X, Email). */
export interface SocialLink {
  id: string;
  /** Human label, e.g. "LinkedIn". */
  label: string;
  /** Destination URL the badge links to. */
  url: string;
  /** Shields.io (or other) badge image URL. */
  badgeUrl: string;
}

/** Payload applied when importing fetched GitHub data into the document. */
export interface GitHubImport {
  basics: Partial<ProfileBasics>;
  /** Bio to use only if the current bio is empty (never overwrites edits). */
  bioIfEmpty: string;
  /** Technologies to merge in (deduped by name). */
  techToMerge: Tech[];
  /** Featured projects; replaces the current list when non-empty. */
  projects: PinnedProject[];
}

/**
 * Visual style a template applies to the whole README. Only choices that
 * actually render on GitHub are expressed here (GitHub ignores CSS/fonts on
 * plain text, so styling is done via alignment, heading format, image badges,
 * dividers, and the accent colour of our self-hosted SVG cards).
 */
export interface TemplateStyle {
  /** How section headings are formatted. */
  headingStyle: "plain" | "centered" | "banner";
  /** Overall content alignment. */
  align: "left" | "center";
  /** How the tech stack renders: inline code chips or shield badges. */
  techStyle: "code" | "badges";
  /** Accent colour (hex, no leading #) applied to the SVG metric cards. */
  accent: string;
  /** Separator drawn between sections. */
  divider: "line" | "blank";
}

/** Section identifiers, in their default render order. */
export type SectionId =
  "profile" | "social" | "headline" | "focus" | "tech" | "metrics" | "pinned";

export const SECTION_IDS: SectionId[] = [
  "profile",
  "social",
  "headline",
  "focus",
  "tech",
  "metrics",
  "pinned",
];

export interface ProfileState {
  basics: ProfileBasics;
  headline: Headline;
  social: SocialLink[];
  focus: Focus;
  tech: Tech[];
  metrics: Metrics;
  pinned: PinnedProject[];
  /** Enabled state per section id, drives both editor toggles and preview. */
  enabled: Record<SectionId, boolean>;
  /** Top-to-bottom order sections render in. Drives preview and export. */
  order: SectionId[];
  /** Visual style applied by the active template. */
  templateStyle: TemplateStyle;
}
