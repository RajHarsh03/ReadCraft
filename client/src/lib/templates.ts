import type { SectionId, TemplateStyle } from "../types";
import { SECTION_IDS } from "../types";

/**
 * A template is a preset for both *layout* (which sections show and their
 * order) and *style* (how the README renders: heading format, alignment, tech
 * display, accent colour, dividers). Templates never touch the user's content
 * (name, bio, tech, projects) - applying one only rearranges sections and
 * changes presentation, so it is safe to switch templates at any time.
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  /** Sections shown, in order. Any omitted section is disabled. */
  layout: SectionId[];
  /** Presentation style applied to the whole document. */
  style: TemplateStyle;
}

/** The default style used before any template is applied. */
export const DEFAULT_TEMPLATE_STYLE: TemplateStyle = {
  headingStyle: "plain",
  align: "left",
  techStyle: "code",
  accent: "f7a718",
  divider: "line",
};

const ALL: SectionId[] = [
  "profile",
  "social",
  "headline",
  "focus",
  "tech",
  "metrics",
  "pinned",
];

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description:
      "Left-aligned, plain headings, code-chip tech. Clean and neutral.",
    layout: ALL,
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "code",
      accent: "f7a718",
      divider: "line",
    },
  },
  {
    id: "elegant",
    name: "Elegant (centered)",
    description:
      "Everything centered with underlined headings and shield badges. Purple accent.",
    layout: ALL,
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "a970ff",
      divider: "line",
    },
  },
  {
    id: "bold",
    name: "Bold Banner",
    description:
      "Centered banner-style headings and shield badges. Blue accent, airy spacing.",
    layout: ALL,
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "3178c6",
      divider: "blank",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Just the essentials, left-aligned and quiet. Green accent.",
    layout: ["profile", "social", "headline", "tech"],
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "code",
      accent: "2ea043",
      divider: "blank",
    },
  },
  {
    id: "showcase",
    name: "Project Showcase",
    description:
      "Lead with projects and stack, centered with badges. Orange accent.",
    layout: ["profile", "social", "pinned", "tech", "metrics"],
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "f97316",
      divider: "line",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description:
      "Bold centered banners with electric-pink badges. High energy.",
    layout: ALL,
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "ec4899",
      divider: "blank",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description:
      "Left-aligned, code-chip tech, green accent. A developer console vibe.",
    layout: ["profile", "social", "headline", "focus", "tech", "metrics"],
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "code",
      accent: "39d353",
      divider: "line",
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    description:
      "Centered, understated blue with shield badges. Clean and professional.",
    layout: ["profile", "headline", "social", "tech", "pinned", "metrics"],
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "2563eb",
      divider: "line",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description:
      "Warm banner headings with amber badges and airy spacing. Friendly.",
    layout: ALL,
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "fb923c",
      divider: "blank",
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description:
      "Quiet, left-aligned, code chips in slate grey. Maximum focus on content.",
    layout: ["profile", "social", "headline", "focus", "tech", "pinned"],
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "code",
      accent: "8b949e",
      divider: "line",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description:
      "Centered banners, teal badges, no rules. Futuristic and clean.",
    layout: ALL,
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "22d3ee",
      divider: "blank",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description:
      "Centered, underlined headings with indigo shield badges. Calm and modern.",
    layout: ALL,
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "6366f1",
      divider: "line",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Bold red banners with shield badges. Striking and confident.",
    layout: ALL,
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "ef4444",
      divider: "blank",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description:
      "Left-aligned with green shield badges and ruled sections. Grounded.",
    layout: [
      "profile",
      "social",
      "headline",
      "focus",
      "tech",
      "pinned",
      "metrics",
    ],
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "badges",
      accent: "16a34a",
      divider: "line",
    },
  },
  {
    id: "royal",
    name: "Royal",
    description:
      "Centered underlined headings, violet badges. Elegant and refined.",
    layout: ALL,
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "7c3aed",
      divider: "line",
    },
  },
  {
    id: "focus-first",
    name: "Focus First",
    description:
      "Lead with what you're working on. Left-aligned, teal code chips.",
    layout: ["profile", "focus", "headline", "tech", "metrics", "pinned"],
    style: {
      headingStyle: "plain",
      align: "left",
      techStyle: "code",
      accent: "14b8a6",
      divider: "line",
    },
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description:
      "Metrics and projects up top, centered banners, rose badges. Impact-first.",
    layout: ["profile", "social", "metrics", "pinned", "tech", "headline"],
    style: {
      headingStyle: "banner",
      align: "center",
      techStyle: "badges",
      accent: "f43f5e",
      divider: "blank",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description:
      "Centered underlined headings with cyan-teal badges. Cool and airy.",
    layout: ALL,
    style: {
      headingStyle: "centered",
      align: "center",
      techStyle: "badges",
      accent: "06b6d4",
      divider: "blank",
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** sessionStorage key used to hand a chosen template to the builder. */
export const PENDING_TEMPLATE_KEY = "readcraft:pending-template";

/**
 * Derive the `enabled` map, `order` array, and `style` a template produces.
 * Sections in the layout are enabled and ordered first; any remaining known
 * sections are appended in canonical order but left disabled, so `order` stays
 * complete.
 */
export function templateLayout(template: Template): {
  enabled: Record<SectionId, boolean>;
  order: SectionId[];
  style: TemplateStyle;
} {
  const inLayout = new Set(template.layout);
  const enabled = SECTION_IDS.reduce(
    (acc, id) => {
      acc[id] = inLayout.has(id);
      return acc;
    },
    {} as Record<SectionId, boolean>
  );
  const rest = SECTION_IDS.filter((id) => !inLayout.has(id));
  return {
    enabled,
    order: [...template.layout, ...rest],
    style: { ...template.style },
  };
}
