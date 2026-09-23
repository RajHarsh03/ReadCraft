import type { Tech } from "../types";

/**
 * A curated catalog of common technologies grouped by category, with
 * brand-ish colours for the badge dot. Powers the searchable tech selector.
 * Users can also add anything not listed via the custom form.
 */
export interface CatalogEntry extends Tech {
  group: string;
}

export const TECH_GROUPS = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "DevOps & Cloud",
  "Tools",
] as const;

export type TechGroup = (typeof TECH_GROUPS)[number];

export const TECH_CATALOG: CatalogEntry[] = [
  // Languages
  { group: "Languages", name: "TypeScript", color: "#3178c6" },
  { group: "Languages", name: "JavaScript", color: "#f7df1e" },
  { group: "Languages", name: "Python", color: "#3776ab" },
  { group: "Languages", name: "Rust", color: "#dea584" },
  { group: "Languages", name: "Go", color: "#00add8" },
  { group: "Languages", name: "Java", color: "#ea2d2e" },
  { group: "Languages", name: "C++", color: "#00599c" },
  { group: "Languages", name: "C#", color: "#178600" },
  { group: "Languages", name: "Ruby", color: "#cc342d" },
  { group: "Languages", name: "PHP", color: "#777bb4" },
  { group: "Languages", name: "Swift", color: "#f05138" },
  { group: "Languages", name: "Kotlin", color: "#a97bff" },
  { group: "Languages", name: "Dart", color: "#00b4ab" },

  // Frontend
  { group: "Frontend", name: "React", color: "#61dafb" },
  { group: "Frontend", name: "Next.js", color: "#ffffff" },
  { group: "Frontend", name: "Vue", color: "#42b883" },
  { group: "Frontend", name: "Svelte", color: "#ff3e00" },
  { group: "Frontend", name: "Angular", color: "#dd0031" },
  { group: "Frontend", name: "Tailwind CSS", color: "#38bdf8" },
  { group: "Frontend", name: "Sass", color: "#cc6699" },
  { group: "Frontend", name: "Vite", color: "#646cff" },
  { group: "Frontend", name: "Redux", color: "#764abc" },

  // Backend
  { group: "Backend", name: "Node.js", color: "#5fa04e" },
  { group: "Backend", name: "Express", color: "#ffffff" },
  { group: "Backend", name: "NestJS", color: "#e0234e" },
  { group: "Backend", name: "Django", color: "#092e20" },
  { group: "Backend", name: "Flask", color: "#ffffff" },
  { group: "Backend", name: "FastAPI", color: "#009688" },
  { group: "Backend", name: "Spring", color: "#6db33f" },
  { group: "Backend", name: "GraphQL", color: "#e10098" },
  { group: "Backend", name: "Rails", color: "#cc0000" },

  // Databases
  { group: "Databases", name: "PostgreSQL", color: "#336791" },
  { group: "Databases", name: "MySQL", color: "#4479a1" },
  { group: "Databases", name: "MongoDB", color: "#47a248" },
  { group: "Databases", name: "Redis", color: "#ff4438" },
  { group: "Databases", name: "SQLite", color: "#003b57" },
  { group: "Databases", name: "Prisma", color: "#2d3748" },
  { group: "Databases", name: "Supabase", color: "#3ecf8e" },

  // DevOps & Cloud
  { group: "DevOps & Cloud", name: "Docker", color: "#2496ed" },
  { group: "DevOps & Cloud", name: "Kubernetes", color: "#326ce5" },
  { group: "DevOps & Cloud", name: "AWS", color: "#ff9900" },
  { group: "DevOps & Cloud", name: "Google Cloud", color: "#4285f4" },
  { group: "DevOps & Cloud", name: "Azure", color: "#0078d4" },
  { group: "DevOps & Cloud", name: "Vercel", color: "#ffffff" },
  { group: "DevOps & Cloud", name: "Terraform", color: "#7b42bc" },
  { group: "DevOps & Cloud", name: "GitHub Actions", color: "#2088ff" },

  // Tools
  { group: "Tools", name: "Git", color: "#f05032" },
  { group: "Tools", name: "Figma", color: "#f24e1e" },
  { group: "Tools", name: "Jest", color: "#c21325" },
  { group: "Tools", name: "Vitest", color: "#6e9f18" },
  { group: "Tools", name: "Playwright", color: "#2ead33" },
  { group: "Tools", name: "Linux", color: "#fcc624" },
];

/** Default colour for a custom tech with no chosen colour. */
export const DEFAULT_TECH_COLOR = "#8b949e";

/**
 * Search the catalog. When `query` is empty, returns entries in the given
 * group (or all). Otherwise matches names case-insensitively across all groups.
 * Already-selected names are excluded.
 */
export function searchCatalog(
  query: string,
  group: TechGroup | "All",
  selectedNames: string[]
): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  const taken = new Set(selectedNames.map((n) => n.toLowerCase()));

  return TECH_CATALOG.filter((entry) => {
    if (taken.has(entry.name.toLowerCase())) return false;
    if (q) return entry.name.toLowerCase().includes(q);
    return group === "All" || entry.group === group;
  });
}
