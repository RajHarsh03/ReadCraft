/** ReadCraft profile model — shared by the editor and the live preview. */

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

/** Section identifiers, in their default render order. */
export type SectionId =
  "profile" | "headline" | "focus" | "tech" | "metrics" | "pinned";

export const SECTION_IDS: SectionId[] = [
  "profile",
  "headline",
  "focus",
  "tech",
  "metrics",
  "pinned",
];

export interface ProfileState {
  basics: ProfileBasics;
  headline: Headline;
  focus: Focus;
  tech: Tech[];
  metrics: Metrics;
  pinned: PinnedProject[];
  /** Enabled state per section id, drives both editor toggles and preview. */
  enabled: Record<SectionId, boolean>;
  /** Top-to-bottom order sections render in. Drives preview and export. */
  order: SectionId[];
}
