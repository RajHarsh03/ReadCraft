import type {
  GitHubProfile,
  GitHubRepo,
  LanguageStat,
  StreakStats,
} from "./types.js";

/**
 * Server-rendered GitHub-style metric cards as self-contained SVG strings.
 *
 * Everything is drawn from data we already fetch, on our own server, so the
 * exported README depends only on ReadCraft's API - never a third-party card
 * service that may be paused. Output is plain, cache-friendly SVG that renders
 * anywhere images do, including GitHub READMEs.
 */

const BG = "#0d1117";
const BORDER = "#30363d";
const TEXT = "#c9d1d9";
const MUTED = "#8b949e";
const DEFAULT_ACCENT = "#f7a718"; // ReadCraft amber
const FONT = "-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif";

/** Sanitize an accent query value to a safe #rrggbb, falling back to amber. */
export function normalizeAccent(raw?: string): string {
  if (!raw) return DEFAULT_ACCENT;
  const hex = raw.replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : DEFAULT_ACCENT;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Compact count, e.g. 2284 -> "2.3k". */
function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

function frame(width: number, height: number, title: string, body: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}" role="img" aria-label="${esc(title)}">`,
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${BG}" stroke="${BORDER}"/>`,
    body,
    `</svg>`,
  ].join("");
}

/* -------------------------------------------------------------------------- */
/*  Stats card                                                                */
/* -------------------------------------------------------------------------- */

export function renderStatsSvg(
  profile: GitHubProfile,
  repos: GitHubRepo[],
  accent: string = DEFAULT_ACCENT
): string {
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const rows: [string, string][] = [
    ["Total Stars (top repos)", compact(stars)],
    ["Public Repositories", compact(profile.publicRepos)],
    ["Followers", compact(profile.followers)],
    ["Following", compact(profile.following)],
  ];

  const width = 330;
  const height = 165;
  const startY = 62;
  const lineH = 24;

  const body = [
    `<text x="20" y="32" fill="${accent}" font-size="15" font-weight="600">GitHub Stats</text>`,
    `<line x1="20" y1="44" x2="${width - 20}" y2="44" stroke="${BORDER}"/>`,
    ...rows.map(([label, value], i) => {
      const y = startY + i * lineH;
      return (
        `<text x="20" y="${y}" fill="${MUTED}" font-size="12">${esc(label)}:</text>` +
        `<text x="${width - 20}" y="${y}" fill="${TEXT}" font-size="12" font-weight="700" text-anchor="end">${esc(
          value
        )}</text>`
      );
    }),
  ].join("");

  return frame(width, height, `${profile.login} GitHub stats`, body);
}

/* -------------------------------------------------------------------------- */
/*  Top languages card                                                        */
/* -------------------------------------------------------------------------- */

const LANG_COLORS = ["#f97316", "#f7a718", "#00add8", "#3178c6", "#a970ff"];

export function renderLanguagesSvg(
  languages: LanguageStat[],
  accent: string = DEFAULT_ACCENT
): string {
  const top = languages.slice(0, 3);
  const width = 840;
  const height = 74;
  const barX = 20;
  const barW = width - 40;
  const barY = 48;

  if (top.length === 0) {
    const body = `<text x="20" y="42" fill="${MUTED}" font-size="13">No language data available.</text>`;
    return frame(width, 64, "Top languages", body);
  }

  const summary = top.map((l) => `${l.language} ${l.percent}%`).join("  ·  ");

  const sum = top.reduce((s, l) => s + l.percent, 0) || 1;
  let offset = 0;
  const palette = [accent, ...LANG_COLORS];
  const segments = top
    .map((l, i) => {
      const w = (l.percent / sum) * barW;
      const seg = `<rect x="${(barX + offset).toFixed(1)}" y="${barY}" width="${w.toFixed(
        1
      )}" height="8" fill="${palette[i % palette.length]}"/>`;
      offset += w;
      return seg;
    })
    .join("");

  const body = [
    `<text x="20" y="30" fill="${accent}" font-size="14" font-weight="600">Top Languages</text>`,
    `<text x="${width - 20}" y="30" fill="${MUTED}" font-size="12" text-anchor="end">${esc(
      summary
    )}</text>`,
    `<clipPath id="langbar"><rect x="${barX}" y="${barY}" width="${barW}" height="8" rx="4"/></clipPath>`,
    `<rect x="${barX}" y="${barY}" width="${barW}" height="8" rx="4" fill="#21262d"/>`,
    `<g clip-path="url(#langbar)">${segments}</g>`,
  ].join("");

  return frame(width, height, "Top languages", body);
}

/* -------------------------------------------------------------------------- */
/*  Streak card                                                               */
/* -------------------------------------------------------------------------- */

export function renderStreakSvg(
  streak: StreakStats,
  accent: string = DEFAULT_ACCENT
): string {
  const width = 330;
  const height = 165;

  const col1 = width / 6;
  const col2 = width / 2;
  const col3 = (width * 5) / 6;

  const totalRange = streak.firstDate
    ? `Since ${new Date(streak.firstDate).getFullYear()}`
    : "This Year";
  const currentRange =
    streak.currentStreakRange?.trim() ||
    fmtDate(new Date().toISOString().slice(0, 10));
  const longestRange = streak.longestStreakRange ?? "";

  const body = [
    // Title
    `<text x="${width / 2}" y="26" fill="${accent}" font-size="16" font-weight="600" text-anchor="middle">Contribution Streak</text>`,
    `<line x1="16" y1="38" x2="${width - 16}" y2="38" stroke="${BORDER}"/>`,

    // Vertical dividers
    `<line x1="${width / 3}" y1="45" x2="${width / 3}" y2="${height - 14}" stroke="${BORDER}" stroke-dasharray="3,3" opacity="0.5"/>`,
    `<line x1="${(width * 2) / 3}" y1="45" x2="${(width * 2) / 3}" y2="${height - 14}" stroke="${BORDER}" stroke-dasharray="3,3" opacity="0.5"/>`,

    // LEFT: Total Contributions
    `<text x="${col1}" y="99" fill="${TEXT}" font-size="32" font-weight="700" text-anchor="middle">${compact(streak.total)}</text>`,
    `<text x="${col1}" y="122" fill="${MUTED}" font-size="11" text-anchor="middle">Total Contributions</text>`,
    totalRange
      ? `<text x="${col1}" y="136" fill="${MUTED}" font-size="9" text-anchor="middle">${esc(totalRange)}</text>`
      : "",

    // CENTER: Current Streak
    `<defs>
      <mask id="current-streak-ring-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#fff"/>
        <ellipse cx="${col2}" cy="53" rx="10" ry="14" fill="#000"/>
      </mask>
    </defs>`,
    `<g mask="url(#current-streak-ring-mask)">
      <circle cx="${col2}" cy="87" r="31" fill="none" stroke="${accent}" stroke-width="5"/>
    </g>`,
    `<g transform="translate(${col2}, 43.2)">
      <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${accent}"/>
    </g>`,
    `<text x="${col2}" y="91" fill="${TEXT}" font-size="32" font-weight="700" text-anchor="middle" dominant-baseline="middle">${compact(streak.currentStreak)}</text>`,
    `<text x="${col2}" y="140" fill="${accent}" font-size="12" font-weight="600" text-anchor="middle">Current Streak</text>`,
    `<text x="${col2}" y="157" fill="${MUTED}" font-size="9" text-anchor="middle">${esc(currentRange)}</text>`,

    // RIGHT: Longest Streak
    `<text x="${col3}" y="99" fill="${TEXT}" font-size="32" font-weight="700" text-anchor="middle">${compact(streak.longestStreak)}</text>`,
    `<text x="${col3}" y="122" fill="${MUTED}" font-size="11" text-anchor="middle">Longest Streak</text>`,
    longestRange
      ? `<text x="${col3}" y="136" fill="${MUTED}" font-size="9" text-anchor="middle">${esc(longestRange)}</text>`
      : "",
  ].join("");

  return frame(width, height, "Contribution streak", body);
}

// Helper for formatting dates
function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export { fmtDate };