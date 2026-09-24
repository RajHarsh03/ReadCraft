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
const ACCENT = "#f7a718"; // ReadCraft amber
const FONT = "-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif";

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
  repos: GitHubRepo[]
): string {
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const rows: [string, string][] = [
    ["Total Stars (top repos)", compact(stars)],
    ["Public Repositories", compact(profile.publicRepos)],
    ["Followers", compact(profile.followers)],
    ["Following", compact(profile.following)],
  ];

  const width = 360;
  const height = 165;
  const startY = 62;
  const lineH = 24;

  const body = [
    `<text x="24" y="34" fill="${ACCENT}" font-size="16" font-weight="600">${esc(
      profile.name ?? profile.login
    )}'s GitHub Stats</text>`,
    `<line x1="24" y1="46" x2="${width - 24}" y2="46" stroke="${BORDER}"/>`,
    ...rows.map(([label, value], i) => {
      const y = startY + i * lineH;
      return (
        `<text x="24" y="${y}" fill="${MUTED}" font-size="13">${esc(label)}:</text>` +
        `<text x="${width - 24}" y="${y}" fill="${TEXT}" font-size="13" font-weight="700" text-anchor="end">${esc(
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

export function renderLanguagesSvg(languages: LanguageStat[]): string {
  const top = languages.slice(0, 5);
  const width = 360;
  const rowH = 22;
  const height = 70 + Math.max(top.length, 1) * rowH;

  if (top.length === 0) {
    const body = `<text x="24" y="40" fill="${MUTED}" font-size="13">No language data available.</text>`;
    return frame(width, 80, "Top languages", body);
  }

  // Normalize the shown languages so their bar segments fill the width.
  const sum = top.reduce((s, l) => s + l.percent, 0) || 1;
  const barX = 24;
  const barW = width - 48;
  const barY = 56;
  let offset = 0;
  const segments = top
    .map((l, i) => {
      const w = (l.percent / sum) * barW;
      const seg = `<rect x="${(barX + offset).toFixed(1)}" y="${barY}" width="${w.toFixed(
        1
      )}" height="8" fill="${LANG_COLORS[i % LANG_COLORS.length]}"/>`;
      offset += w;
      return seg;
    })
    .join("");

  const legend = top
    .map((l, i) => {
      const y = barY + 26 + i * rowH;
      const color = LANG_COLORS[i % LANG_COLORS.length];
      return (
        `<circle cx="28" cy="${y - 4}" r="5" fill="${color}"/>` +
        `<text x="42" y="${y}" fill="${TEXT}" font-size="12">${esc(l.language)}</text>` +
        `<text x="${width - 24}" y="${y}" fill="${MUTED}" font-size="12" text-anchor="end">${l.percent}%</text>`
      );
    })
    .join("");

  const body = [
    `<text x="24" y="34" fill="${ACCENT}" font-size="16" font-weight="600">Most Used Languages</text>`,
    `<rect x="${barX}" y="${barY}" width="${barW}" height="8" rx="4" fill="#21262d"/>`,
    segments,
    legend,
  ].join("");

  return frame(width, height, "Top languages", body);
}

/* -------------------------------------------------------------------------- */
/*  Streak card                                                               */
/* -------------------------------------------------------------------------- */

export function renderStreakSvg(streak: StreakStats): string {
  const width = 360;
  const height = 120;
  const cols: [number, string][] = [
    [streak.currentStreak, "Current Streak"],
    [streak.longestStreak, "Longest Streak"],
    [streak.total, "Total"],
  ];
  const colW = width / 3;

  const body = cols
    .map(([value, label], i) => {
      const cx = colW * i + colW / 2;
      const accent = i === 1;
      return (
        `<text x="${cx}" y="58" fill="${accent ? ACCENT : TEXT}" font-size="30" font-weight="700" text-anchor="middle">${compact(
          value
        )}</text>` +
        `<text x="${cx}" y="82" fill="${MUTED}" font-size="12" text-anchor="middle">${esc(
          label
        )}</text>`
      );
    })
    .join("");

  return frame(width, height, "Contribution streak", body);
}
