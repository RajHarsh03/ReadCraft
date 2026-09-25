/**
 * Shields.io badge generation.
 *
 * Produces a badge image URL and the Markdown snippet to embed it. All user
 * text is URL-encoded with Shields.io's escaping rules (`-` -> `--`,
 * `_` -> `__`, space -> `_`) so labels/messages render correctly.
 */

export type BadgeStyle =
  "flat" | "flat-square" | "plastic" | "for-the-badge" | "social";

export const BADGE_STYLES: BadgeStyle[] = [
  "flat",
  "flat-square",
  "plastic",
  "for-the-badge",
  "social",
];

export interface BadgeSpec {
  label: string;
  message: string;
  /** Hex without '#', or a named color (e.g. "blue"). */
  color: string;
  /** Optional label-side (left) color. */
  labelColor?: string;
  style: BadgeStyle;
  /** Optional simple-icons logo slug, e.g. "github". */
  logo?: string;
  /** Optional logo color (hex without '#', or named color). */
  logoColor?: string;
  /** Optional link the badge points to. */
  link?: string;
}

/** Escape a segment per Shields.io static-badge rules. */
function escapeSegment(value: string): string {
  return value.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_");
}

function stripHash(color: string): string {
  return color.replace(/^#/, "");
}

/** Build the Shields.io image URL for a badge spec. */
export function badgeImageUrl(spec: BadgeSpec): string {
  const label = escapeSegment(spec.label.trim());
  const message = escapeSegment(spec.message.trim() || "");
  const hasMessage = Boolean(message);

  // Single-segment (no message) uses consistent neutral grey matching theme
  const color = encodeURIComponent(
    stripHash(hasMessage ? spec.color.trim() || "blue" : "3d4453").trim()
  );

  // If no message, build a single-segment badge (label only, neutral color)
  const path = !hasMessage
    ? `${label}-${color}`
    : `${label ? `${label}-` : ""}${message}-${color}`;

  const params = new URLSearchParams();
  params.set("style", spec.style);
  if (spec.logo?.trim()) params.set("logo", spec.logo.trim());

  // Two-segment: only set labelColor if explicitly provided, otherwise let both sides be same
  if (hasMessage && spec.labelColor?.trim()) {
    params.set("labelColor", stripHash(spec.labelColor).trim());
  } else if (hasMessage) {
    // No labelColor = both label and message use the same color (solid color badge)
    // Remove any default contrast
  }

  if (spec.logoColor?.trim()) {
    params.set("logoColor", stripHash(spec.logoColor).trim());
  }
  return `https://img.shields.io/badge/${path}?${params.toString()}`;
}

/** Build the Markdown snippet for a badge (optionally wrapped in a link). */
export function badgeMarkdown(spec: BadgeSpec): string {
  const alt =
    [spec.label, spec.message].filter(Boolean).join(" ").trim() || "badge";
  const img = `![${alt}](${badgeImageUrl(spec)})`;
  const link = spec.link?.trim();
  return link ? `[${img}](${encodeURI(link)})` : img;
}

/** A few useful starting points shown in the studio. */
export const BADGE_PRESETS: { name: string; spec: BadgeSpec }[] = [
  {
    name: "GitHub",
    spec: {
      label: "GitHub",
      message: "follow",
      color: "181717",
      style: "for-the-badge",
      logo: "github",
    },
  },
  {
    name: "LinkedIn",
    spec: {
      label: "LinkedIn",
      message: "connect",
      color: "0A66C2",
      style: "for-the-badge",
      logo: "linkedin",
    },
  },
  {
    name: "Twitter",
    spec: {
      label: "Twitter",
      message: "follow",
      color: "1DA1F2",
      style: "for-the-badge",
      logo: "twitter",
    },
  },
  {
    name: "Hashnode",
    spec: {
      label: "Hashnode",
      message: "blog",
      color: "2962FF",
      style: "for-the-badge",
      logo: "hashnode",
    },
  },
  {
    name: "CodePen",
    spec: {
      label: "CodePen",
      message: "profile",
      color: "000000",
      style: "for-the-badge",
      logo: "codepen",
    },
  },
  {
    name: "Instagram",
    spec: {
      label: "Instagram",
      message: "follow",
      color: "E4405F",
      style: "for-the-badge",
      logo: "instagram",
    },
  },
  {
    name: "Email",
    spec: {
      label: "Email",
      message: "contact",
      color: "EA4335",
      style: "for-the-badge",
      logo: "gmail",
    },
  },
  {
    name: "LeetCode",
    spec: {
      label: "LeetCode",
      message: "profile",
      color: "FFA116",
      style: "for-the-badge",
      logo: "leetcode",
    },
  },
  {
    name: "Medium",
    spec: {
      label: "Medium",
      message: "blog",
      color: "000000",
      style: "for-the-badge",
    },
  },
  {
    name: "License MIT",
    spec: { label: "license", message: "MIT", color: "green", style: "flat" },
  },
  {
    name: "Build passing",
    spec: {
      label: "build",
      message: "passing",
      color: "brightgreen",
      style: "flat-square",
    },
  },
  {
    name: "Made with TypeScript",
    spec: {
      label: "Made with",
      message: "TypeScript",
      color: "3178C6",
      style: "flat",
      logo: "typescript",
    },
  },
];

/** sessionStorage key used to hand a badge from the standalone studio to the builder. */
export const PENDING_BADGE_KEY = "readcraft:pending-badge";
