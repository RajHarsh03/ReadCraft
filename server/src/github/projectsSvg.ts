import type { GitHubRepo } from "./types.js";

/**
 * Self-hosted "pinned repositories" card as an SVG grid of repo cards
 * (name, stars, description), styled like GitHub. Rendered on our server from
 * the user's featured public repositories, so the README needs no third-party
 * card service.
 */

const BG = "#0d1117";
const CARD = "#161b22";
const BORDER = "#30363d";
const MUTED = "#8b949e";
const ACCENT = "#f7a718";
const FONT = "-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif";

const CARD_W = 300;
const CARD_H = 96;
const GAP = 14;
const PAD = 14;
const COLS = 2;

/** A small repo/book glyph, drawn at (x, y) top-left in `color`. */
function repoIcon(x: number, y: number, color: string): string {
  return `<path transform="translate(${x} ${y}) scale(0.75)" fill="${color}" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/** Wrap text into up to `maxLines` lines of about `maxChars` characters. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // Ellipsis if we truncated.
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
  }
  return lines;
}

/** Render the pinned-repositories card SVG. */
export function renderProjectsSvg(repos: GitHubRepo[], limit = 4): string {
  const items = repos.slice(0, limit);
  const rows = Math.ceil(Math.max(items.length, 1) / COLS);
  const width = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
  const height = PAD * 2 + rows * CARD_H + (rows - 1) * GAP;

  if (items.length === 0) {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="80" viewBox="0 0 ${width} 80" font-family="${FONT}" role="img" aria-label="Pinned repositories">`,
      `<rect width="${width}" height="80" fill="${BG}"/>`,
      `<text x="${PAD}" y="44" fill="${MUTED}" font-size="13">No public repositories to show.</text>`,
      `</svg>`,
    ].join("");
  }

  const cards = items
    .map((repo, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = PAD + col * (CARD_W + GAP);
      const y = PAD + row * (CARD_H + GAP);
      const descLines = wrap(repo.description ?? "", 44, 2);
      const desc = descLines
        .map(
          (ln, j) =>
            `<text x="${x + 14}" y="${y + 54 + j * 16}" fill="${MUTED}" font-size="11">${esc(ln)}</text>`
        )
        .join("");
      return [
        `<rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="6" fill="${CARD}" stroke="${BORDER}"/>`,
        repoIcon(x + 14, y + 15, ACCENT),
        `<text x="${x + 32}" y="${y + 27}" fill="${ACCENT}" font-size="13" font-weight="700">${esc(repo.name)}</text>`,
        `<text x="${x + CARD_W - 14}" y="${y + 27}" fill="${MUTED}" font-size="11" text-anchor="end">★ ${compact(repo.stars)}</text>`,
        desc,
      ].join("");
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}" role="img" aria-label="Pinned repositories">`,
    `<rect width="${width}" height="${height}" fill="${BG}"/>`,
    cards,
    `</svg>`,
  ].join("");
}
