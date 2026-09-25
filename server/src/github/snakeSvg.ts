import type { ContributionDay } from "./types.js";

/**
 * Self-hosted contribution-snake as an animated SVG.
 *
 * Draws the trailing-year contribution grid and a snake that travels a
 * column-wise serpentine route over EMPTY (uncontributed) cells only, routed
 * cell-by-cell with BFS so it detours *around* green days rather than crossing
 * them. Movement is a there-and-back loop (no teleport). Animation uses SMIL
 * (animateMotion), which renders in GitHub READMEs since they allow animated
 * SVG. Everything is generated on our server from real per-day data, so it
 * needs no third-party service or GitHub Action.
 */

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const TOP = 40; // room for the header line and month labels above the grid
const LEFT = 34; // left inset: weekday labels + padding off the card border
const PAD = 14; // inner padding on the right/bottom so cells clear the border
const ROWS = 7;
const MIN_LABEL_GAP = 3; // min columns between month labels so they don't overlap

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

const LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const SNAKE = "#a970ff";
const SNAKE_SEGMENTS = 5;

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

interface Cell {
  col: number;
  row: number;
}

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

/** Shortest empty-cell path between two cells (BFS), excluding the start. */
function bfsPath(
  from: Cell,
  to: Cell,
  isEmpty: (col: number, row: number) => boolean
): Cell[] | null {
  if (from.col === to.col && from.row === to.row) return [];
  const key = (c: number, r: number) => `${c},${r}`;
  const queue: Cell[] = [from];
  const prev = new Map<string, string | null>([
    [key(from.col, from.row), null],
  ]);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.col === to.col && cur.row === to.row) {
      const path: Cell[] = [];
      let k: string | null = key(cur.col, cur.row);
      while (k) {
        const [c, r] = k.split(",").map(Number);
        path.push({ col: c!, row: r! });
        k = prev.get(k) ?? null;
      }
      path.reverse();
      return path.slice(1);
    }
    for (const [dc, dr] of DIRS) {
      const nc = cur.col + dc!;
      const nr = cur.row + dr!;
      const nk = key(nc, nr);
      if (!prev.has(nk) && isEmpty(nc, nr)) {
        prev.set(nk, key(cur.col, cur.row));
        queue.push({ col: nc, row: nr });
      }
    }
  }
  return null;
}

/** Render the animated contribution-snake SVG for the trailing year. */
export function renderSnakeSvg(
  days: ContributionDay[],
  login: string,
  accent: string = SNAKE
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
  const monthSeen = new Set<string>();
  const monthStarts: { col: number; monthIndex: number }[] = [];
  const contributed = new Set<string>();
  let maxCol = 0;

  data.forEach((day, i) => {
    const slot = firstDow + i;
    const col = Math.floor(slot / ROWS);
    const row = slot % ROWS;
    if (col > maxCol) maxCol = col;
    const x = LEFT + col * STEP;
    const y = TOP + row * STEP;
    rects.push(
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${LEVELS[levelFor(day.count, max)]}"/>`
    );
    if (day.count > 0) contributed.add(`${col},${row}`);

    const month = day.date.slice(0, 7);
    if (!monthSeen.has(month)) {
      monthSeen.add(month);
      monthStarts.push({ col, monthIndex: Number(day.date.slice(5, 7)) - 1 });
    }
  });

  // Emit month labels, dropping the EARLIER of any two starts closer than
  // MIN_LABEL_GAP (usually the short partial first month) so labels never
  // collide (e.g. "SepOct") while genuinely-spaced months are all kept.
  const monthLabels: string[] = [];
  monthStarts.forEach((m, idx) => {
    const next = monthStarts[idx + 1];
    if (next && next.col - m.col < MIN_LABEL_GAP) return;
    const label = MONTHS[m.monthIndex] ?? "";
    monthLabels.push(
      `<text x="${LEFT + m.col * STEP}" y="${TOP - 6}" fill="#8b949e" font-size="9">${label}</text>`
    );
  });

  const weeks = maxCol + 1;
  const isEmpty = (col: number, row: number) =>
    col >= 0 &&
    col < weeks &&
    row >= 0 &&
    row < ROWS &&
    !contributed.has(`${col},${row}`);

  // Column-wise serpentine waypoints over empty cells, linked cell-by-cell
  // (BFS) so the snake detours around green days instead of crossing them.
  const waypoints: Cell[] = [];
  for (let col = 0; col < weeks; col += 1) {
    const rowsOrder =
      col % 2 === 0 ? [0, 1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1, 0];
    for (const row of rowsOrder) {
      if (isEmpty(col, row)) waypoints.push({ col, row });
    }
  }
  const linked: Cell[] = waypoints.length ? [waypoints[0]!] : [];
  for (let i = 1; i < waypoints.length; i += 1) {
    const seg = bfsPath(waypoints[i - 1]!, waypoints[i]!, isEmpty);
    if (seg && seg.length) linked.push(...seg);
    else linked.push(waypoints[i]!);
  }
  // There-and-back loop (no teleport).
  const route =
    linked.length > 2
      ? [...linked, ...linked.slice(1, -1).reverse()]
      : linked;

  const width = LEFT + weeks * STEP + PAD;
  const height = TOP + ROWS * STEP + PAD;

  const weekdayLabels = [
    [1, "Mon"],
    [3, "Wed"],
    [5, "Fri"],
  ]
    .map(
      ([r, label]) =>
        `<text x="${PAD}" y="${TOP + (r as number) * STEP + CELL - 2}" fill="#8b949e" font-size="9">${label}</text>`
    )
    .join("");

  // Build the motion path (centres of route cells) and the animated snake.
  let snake = "";
  if (route.length > 1) {
    const pts = route.map((c) => ({
      x: LEFT + c.col * STEP + CELL / 2,
      y: TOP + c.row * STEP + CELL / 2,
    }));
    const motion = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
      .join(" ");
    // Constant-ish speed: ~14 cells/sec.
    const dur = Math.max(4, route.length / 14);
    const stepFrac = 1 / route.length; // one cell as a fraction of the loop

    snake = Array.from({ length: SNAKE_SEGMENTS }, (_, i) => {
      // i = 0 is the biggest, most opaque segment: the HEAD. It must lead the
      // motion, so it gets the largest lead (most-negative begin). Higher i
      // segments are smaller/fainter and lag behind as the TAIL.
      const size = CELL + 1 - i * 0.8;
      const lead = SNAKE_SEGMENTS - 1 - i;
      const begin = (-lead * stepFrac * dur).toFixed(2);
      // animateMotion moves the element origin along the path, so drawing the
      // rect at (-size/2, -size/2) keeps it centred on the path point.
      return (
        `<rect x="${(-size / 2).toFixed(1)}" y="${(-size / 2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="3" fill="${accent}" opacity="${(1 - i * 0.15).toFixed(2)}">` +
        `<animateMotion dur="${dur.toFixed(2)}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear" path="${motion}"/>` +
        `</rect>`
      );
    }).join("");
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system,Segoe UI,sans-serif" role="img" aria-label="Contribution snake for ${esc(login)}">`,
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="#0d1117" stroke="#21262d"/>`,
    monthLabels.join(""),
    weekdayLabels,
    rects.join(""),
    snake,
    `</svg>`,
  ].join("");
}
