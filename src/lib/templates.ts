import type { SectionId } from "../types";
import { SECTION_IDS } from "../types";

/**
 * A template is a *layout* preset: which sections are enabled and the order
 * they appear in. Templates never touch the user's content (name, bio, tech,
 * projects) - applying one only rearranges/toggles sections, so it is safe to
 * switch templates at any time.
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  /** Sections shown, in order. Any omitted section is disabled. */
  layout: SectionId[];
}

export const TEMPLATES: Template[] = [
  {
    id: "complete",
    name: "Complete",
    description: "Every section, in the classic order. A great starting point.",
    layout: ["profile", "headline", "focus", "tech", "metrics", "pinned"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Just the essentials - who you are and what you build.",
    layout: ["profile", "headline", "tech"],
  },
  {
    id: "showcase",
    name: "Project Showcase",
    description: "Lead with pinned projects and your stack.",
    layout: ["profile", "pinned", "tech", "metrics"],
  },
  {
    id: "stats-first",
    name: "Stats First",
    description: "Put GitHub activity and metrics front and centre.",
    layout: ["profile", "metrics", "tech", "pinned", "headline"],
  },
  {
    id: "narrative",
    name: "Narrative",
    description: "A story-led profile: intro, focus, then supporting detail.",
    layout: ["profile", "headline", "focus", "pinned", "tech", "metrics"],
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** sessionStorage key used to hand a chosen template to the builder. */
export const PENDING_TEMPLATE_KEY = "readcraft:pending-template";

/**
 * Derive the `enabled` map and `order` array a template produces. Sections in
 * the layout are enabled and ordered first; any remaining known sections are
 * appended in canonical order but left disabled, so `order` stays complete.
 */
export function templateLayout(template: Template): {
  enabled: Record<SectionId, boolean>;
  order: SectionId[];
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
  return { enabled, order: [...template.layout, ...rest] };
}
