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
