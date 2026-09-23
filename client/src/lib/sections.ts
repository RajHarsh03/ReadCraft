import type { SectionId } from "../types";

/** Human-friendly labels + icons for each section, used across the builder. */
export const SECTION_META: Record<SectionId, { label: string; icon: string }> =
  {
    profile: { label: "Profile", icon: "badge" },
    headline: { label: "Headline", icon: "title" },
    focus: { label: "Focus", icon: "track_changes" },
    tech: { label: "Tech Stack", icon: "code" },
    metrics: { label: "GitHub Metrics", icon: "query_stats" },
    pinned: { label: "Projects", icon: "folder_special" },
  };
