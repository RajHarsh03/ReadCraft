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

  const width = 260;
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
  // Full-width bar banner: the top three languages as an inline summary line
  // and a single normalized bar underneath. Wide viewBox so it scales cleanly
  // when stretched to the README width.
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

  // Normalize the shown languages so their segments fill the whole bar.
  const sum = top.reduce((s, l) => s + l.percent, 0) || 1;
  let offset = 0;
  // First segment uses the template accent; the rest cycle the palette.
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
  // Match the stats card's size so the two sit level side by side.
  const width = 260;
  const height = 165;
  const cols: [number, string][] = [
    [streak.currentStreak, "Current Streak"],
    [streak.longestStreak, "Longest Streak"],
    [streak.total, "Total"],
  ];
  const colW = width / 3;

  const body = [
    `<text x="20" y="32" fill="${accent}" font-size="15" font-weight="600">Contribution Streak</text>`,
    `<line x1="20" y1="44" x2="${width - 20}" y2="44" stroke="${BORDER}"/>`,
    ...cols.map(([value, label], i) => {
      const cx = colW * i + colW / 2;
      const highlight = i === 1;
      return (
        `<text x="${cx}" y="102" fill="${highlight ? accent : TEXT}" font-size="26" font-weight="700" text-anchor="middle">${compact(
          value
        )}</text>` +
        `<text x="${cx}" y="126" fill="${MUTED}" font-size="11" text-anchor="middle">${esc(
          label
        )}</text>`
      );
    }),
  ].join("");

  return frame(width, height, "Contribution streak", body);
}
