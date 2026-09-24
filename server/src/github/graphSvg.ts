import type { ContributionDay } from "./types.js";

/**
 * Render a GitHub-style contribution calendar as a self-contained SVG string.
 *
 * This is generated from real per-day data on our own server, so the exported
 * README never depends on a third-party card service (which can be paused).
 * The output is a plain, cache-friendly SVG that renders anywhere images do,
 * including GitHub READMEs.
 */

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const TOP = 44; // room for the header line and the month labels above the grid
const LEFT = 30;
const ROWS = 7;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// GitHub-dark contribution ramp.
const LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const r = count / max;
  if (r > 0.66) return 4;
  if (r > 0.33) return 3;
  if (r > 0.12) return 2;
  return 1;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Build the contribution-calendar SVG for the trailing year of `days`. */
export function renderContributionSvg(
  days: ContributionDay[],
  login: string,
  accent: string = "#f7a718"
): string {
  const ascending = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const windowed = ascending.filter(
    (d) => d.date >= cutoffKey && d.date <= todayKey
  );
  const data = windowed.length ? windowed : ascending;

  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const firstDow = data.length
    ? new Date(`${data[0]!.date}T00:00:00Z`).getUTCDay()
    : 0;

  const rects: string[] = [];
  const monthLabels: string[] = [];
  const monthSeen = new Set<string>();
  let maxCol = 0;

  data.forEach((day, i) => {
    const slot = firstDow + i;
    const col = Math.floor(slot / ROWS);
    const row = slot % ROWS;
    if (col > maxCol) maxCol = col;
    const x = LEFT + col * STEP;
    const y = TOP + row * STEP;
    const fill = LEVELS[levelFor(day.count, max)];
    rects.push(
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`
    );

    const month = day.date.slice(0, 7);
    if (!monthSeen.has(month)) {
      monthSeen.add(month);
      const label = MONTHS[Number(day.date.slice(5, 7)) - 1] ?? "";
      monthLabels.push(
        `<text x="${LEFT + col * STEP}" y="${TOP - 6}" fill="#8b949e" font-size="9">${label}</text>`
      );
    }
  });

  const weekdayLabels = [
    [1, "Mon"],
    [3, "Wed"],
    [5, "Fri"],
  ]
    .map(
      ([r, label]) =>
        `<text x="0" y="${TOP + (r as number) * STEP + CELL - 2}" fill="#8b949e" font-size="9">${label}</text>`
    )
    .join("");

  const width = LEFT + (maxCol + 1) * STEP + 4;
  const height = TOP + ROWS * STEP + 4;
  const total = data.reduce((s, d) => s + d.count, 0);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system,Segoe UI,sans-serif" role="img" aria-label="Contribution calendar for ${esc(login)}">`,
    `<rect width="${width}" height="${height}" fill="#0d1117"/>`,
    `<text x="2" y="16" fill="#c9d1d9" font-size="12"><tspan fill="${accent}" font-weight="700">${total}</tspan> contributions in the last year</text>`,
    monthLabels.join(""),
    weekdayLabels,
    rects.join(""),
    `</svg>`,
  ].join("");
}
