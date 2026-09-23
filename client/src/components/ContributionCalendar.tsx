import { useEffect, useMemo, useRef, useState } from "react";
import type { ContributionDay } from "../lib/github";

/** Track the user's reduced-motion preference, live. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * A GitHub-style contribution calendar rendered entirely from per-day data
 * (no third-party image). Days are laid out in week columns (Sun..Sat rows),
 * coloured by intensity level. An optional snake travels only across the days
 * that actually have contributions, skipping the empty cells.
 */

interface ContributionCalendarProps {
  days: ContributionDay[];
  /** Animate a snake across the contributed cells. */
  showSnake?: boolean;
}

const CELL = 12; // cell size in px
const GAP = 3; // gap between cells
const STEP = CELL + GAP;
const TOP = 18; // room for month labels
const LEFT = 30; // room for weekday labels

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

/** GitHub-like green ramp, from empty to most active. */
const LEVEL_COLORS = ["#1b1f24", "#0e4429", "#006d32", "#26a641", "#39d353"];

interface Cell {
  day: ContributionDay;
  level: number;
  /** Column (week) and row (weekday 0=Sun) in the grid. */
  col: number;
  row: number;
  x: number;
  y: number;
}

/** Map a count to an intensity level 0-4 relative to the dataset's max. */
function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.12) return 2;
  return 1;
}

interface Built {
  cells: Cell[];
  weeks: number;
  monthLabels: { col: number; label: string }[];
  /** Serpentine route across the whole grid, for the snake to follow. */
  snakeRoute: { x: number; y: number }[];
}

function buildGrid(allDays: ContributionDay[]): Built {
  if (allDays.length === 0) {
    return { cells: [], weeks: 0, monthLabels: [], snakeRoute: [] };
  }

  // Show exactly the trailing one year, like GitHub: from the same date one
  // year ago up to today (e.g. this Sep back to last Sep). Streak stats still
  // use the full history upstream; only the visible grid is windowed here.
  const ascending = [...allDays].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  // Keep only the trailing year and drop any future-dated padding the source
  // may include for the current calendar year.
  const windowed = ascending.filter(
    (d) => d.date >= cutoffKey && d.date <= todayKey
  );
  // Fall back to the whole set if the window somehow ends up empty.
  const sorted = windowed.length ? windowed : ascending;
  const max = sorted.reduce((m, d) => Math.max(m, d.count), 0);

  // Align the first column to the week containing the first day: pad leading
  // slots so row 0 is Sunday.
  const firstDow = new Date(`${sorted[0]!.date}T00:00:00Z`).getUTCDay();

  const cells: Cell[] = [];
  const monthSeen = new Set<string>();
  const monthLabels: { col: number; label: string }[] = [];

  sorted.forEach((day, i) => {
    const slot = firstDow + i;
    const col = Math.floor(slot / 7);
    const row = slot % 7;
    const x = LEFT + col * STEP;
    const y = TOP + row * STEP;
    const level = levelFor(day.count, max);
    cells.push({ day, level, col, row, x, y });

    // Month label at the first column where a new month starts.
    const month = day.date.slice(0, 7); // YYYY-MM
    if (!monthSeen.has(month)) {
      monthSeen.add(month);
      const monthIdx = Number(day.date.slice(5, 7)) - 1;
      monthLabels.push({ col, label: MONTHS[monthIdx] ?? "" });
    }
  });

  const weeks = cells.length ? cells[cells.length - 1]!.col + 1 : 0;

  // Which grid slots have a contribution — the snake never enters these.
  const contributed = new Set<string>();
  for (const c of cells) {
    if (c.day.count > 0) contributed.add(`${c.col},${c.row}`);
  }
  const isEmpty = (col: number, row: number) =>
    col >= 0 &&
    col < weeks &&
    row >= 0 &&
    row < 7 &&
    !contributed.has(`${col},${row}`);

  // Column-wise serpentine waypoints (empty cells only), left to right:
  // column 0 top->bottom, column 1 bottom->top, and so on.
  const waypoints: { col: number; row: number }[] = [];
  for (let col = 0; col < weeks; col += 1) {
    const rows =
      col % 2 === 0 ? [0, 1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1, 0];
    for (const row of rows) {
      if (isEmpty(col, row)) waypoints.push({ col, row });
    }
  }

  // Connect consecutive waypoints with a step-by-step path over EMPTY cells
  // only (4-directional BFS). This makes the snake detour *around* green cells
  // via neighbouring cells instead of ever crossing over one.
  const cellPath = linkWaypoints(waypoints, isEmpty);

  // There-and-back loop: to the right end, then retrace to the start. No
  // teleport. Reversed middle skips the two ends so they aren't repeated.
  const roundTrip =
    cellPath.length > 2
      ? [...cellPath, ...cellPath.slice(1, -1).reverse()]
      : cellPath;

  const snakeRoute = roundTrip.map((c) => ({
    x: LEFT + c.col * STEP + CELL / 2,
    y: TOP + c.row * STEP + CELL / 2,
  }));

  return { cells, weeks, monthLabels, snakeRoute };
}

/** 4-directional neighbours of a cell. */
const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

/** Shortest empty-cell path between two cells (BFS), excluding the start. */
function bfsPath(
  from: { col: number; row: number },
  to: { col: number; row: number },
  isEmpty: (col: number, row: number) => boolean
): { col: number; row: number }[] | null {
  if (from.col === to.col && from.row === to.row) return [];
  const key = (c: number, r: number) => `${c},${r}`;
  const queue: { col: number; row: number }[] = [from];
  const prev = new Map<string, string | null>([[key(from.col, from.row), null]]);

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.col === to.col && cur.row === to.row) {
      // Reconstruct, then drop the start cell.
      const path: { col: number; row: number }[] = [];
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
  return null; // no empty route (blocked by green); caller will snap
}

/** Turn serpentine waypoints into a fully step-adjacent empty-cell path. */
function linkWaypoints(
  waypoints: { col: number; row: number }[],
  isEmpty: (col: number, row: number) => boolean
): { col: number; row: number }[] {
  if (waypoints.length === 0) return [];
  const path: { col: number; row: number }[] = [waypoints[0]!];
  for (let i = 1; i < waypoints.length; i += 1) {
    const a = waypoints[i - 1]!;
    const b = waypoints[i]!;
    const seg = bfsPath(a, b, isEmpty);
    if (seg && seg.length) {
      path.push(...seg);
    } else {
      path.push(b); // unreachable via empties: fall back to a direct step
    }
  }
  return path;
}

/** How many empty cells the snake advances per second (higher = faster). */
const SNAKE_CELLS_PER_SECOND = 8;
/** Number of body segments trailing the head. */
const SNAKE_SEGMENTS = 5;

export function ContributionCalendar({
  days,
  showSnake = false,
}: ContributionCalendarProps) {
  const built = useMemo(() => buildGrid(days), [days]);
  const { cells, weeks, monthLabels, snakeRoute } = built;
  const reducedMotion = usePrefersReducedMotion();

  const width = LEFT + Math.max(weeks, 1) * STEP;
  const height = TOP + 7 * STEP;
  // Only animate when requested, there is a route, and motion is allowed.
  const hasSnake = showSnake && snakeRoute.length > 1 && !reducedMotion;

  // JS-driven snake. We advance a fractional index along the empty-cell route
  // and render the head + trailing segments interpolated behind it, sliding
  // smoothly between adjacent empty cells and snapping over gaps so the snake
  // is never drawn on a green (contributed) day. rAF pauses automatically
  // while the tab is hidden and resumes cleanly on return.
  const routeLen = snakeRoute.length;
  const [headIndex, setHeadIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasSnake || routeLen < 2) return;
    lastTsRef.current = null;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setHeadIndex((prev) => (prev + dt * SNAKE_CELLS_PER_SECOND) % routeLen);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hasSnake, routeLen]);

  // Smoothly interpolate a fractional position along the empty-cell route.
  // Adjacent cells are slid between (smooth glide); a jump to a non-adjacent
  // cell (a green day sits between them) snaps instantly, so the snake is
  // never drawn sliding across a contributed cell.
  const positionAt = useMemo(() => {
    const adjacent = (
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) => Math.abs(a.x - b.x) <= STEP + 0.5 && Math.abs(a.y - b.y) <= STEP + 0.5;

    return (t: number): { x: number; y: number } => {
      const wrapped = ((t % routeLen) + routeLen) % routeLen;
      const i = Math.floor(wrapped);
      const frac = wrapped - i;
      const from = snakeRoute[i % routeLen]!;
      const to = snakeRoute[(i + 1) % routeLen]!;
      if (!adjacent(from, to)) return from; // snap over gaps (green days)
      return {
        x: from.x + (to.x - from.x) * frac,
        y: from.y + (to.y - from.y) * frac,
      };
    };
  }, [routeLen, snakeRoute]);

  // Head + trailing segments, each a fixed fractional distance behind the head.
  const snakeSegments = useMemo(() => {
    if (!hasSnake || routeLen === 0) return [];
    return Array.from({ length: SNAKE_SEGMENTS }, (_, i) =>
      positionAt(headIndex - i)
    );
  }, [hasSnake, headIndex, routeLen, positionAt]);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="GitHub contribution calendar"
        className="block h-auto shrink-0"
        style={{ minWidth: width }}
      >
        {/* Weekday labels */}
        {[
          [1, "Mon"],
          [3, "Wed"],
          [5, "Fri"],
        ].map(([row, label]) => (
          <text
            key={label}
            x={0}
            y={TOP + (row as number) * STEP + CELL - 1}
            className="fill-on-surface-variant"
            style={{ fontSize: 9 }}
          >
            {label}
          </text>
        ))}

        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={`${m.label}-${m.col}-${i}`}
            x={LEFT + m.col * STEP}
            y={TOP - 5}
            className="fill-on-surface-variant"
            style={{ fontSize: 9 }}
          >
            {m.label}
          </text>
        ))}

        {/* Day cells */}
        {cells.map((c) => (
          <rect
            key={c.day.date}
            x={c.x}
            y={c.y}
            width={CELL}
            height={CELL}
            rx={2}
            fill={LEVEL_COLORS[c.level]}
          >
            <title>{`${c.day.count} contribution${
              c.day.count === 1 ? "" : "s"
            } on ${c.day.date}`}</title>
          </rect>
        ))}

        {/* Snake: head + trailing segments, each snapped to an empty-cell
            position on the route, so it is never drawn on a green day. */}
        {snakeSegments.map((p, i) => {
          const size = CELL + 1 - i * 0.8; // head largest, tail smaller
          return (
            <rect
              key={i}
              x={p.x - size / 2}
              y={p.y - size / 2}
              width={size}
              height={size}
              rx={3}
              fill="#a970ff"
              opacity={1 - i * 0.15}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** The small Less..More intensity legend. */
export function ContributionLegend() {
  return (
    <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
      <span>Less</span>
      {LEVEL_COLORS.map((color, i) => (
        <span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
      <span>More</span>
    </div>
  );
}
