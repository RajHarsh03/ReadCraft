import type { ProfileState, TemplateStyle } from "../types";
import {
  buildReadmeDocument,
  metricImageUrl,
  metricLabel,
  projectsImageUrl,
  type MetricKind,
  type ReadmeBlock,
  type ReadmeDocument,
} from "./document";
import { encodeUsername } from "./username";

/**
 * Render a README document to GitHub-Flavored Markdown.
 *
 * The renderer formats blocks according to the document's TemplateStyle
 * (heading style, alignment, tech display, accent, dividers). It never decides
 * which sections appear or in what order - that is owned by
 * `buildReadmeDocument`. The preview renders the same document, so preview and
 * export stay in lockstep.
 */

/** ReadCraft attribution. Appended to every generated README. */
export const READCRAFT_URL = "https://readcraft.harshx.in";
/** Plain lead-in text; only the brand word below is linked. */
export const READCRAFT_CREDIT_PREFIX = "Made with";
export const READCRAFT_BRAND = "ReadCraft";

/** The credit footer block (a divider + centered attribution link). */
function creditFooter(): string {
  return [
    "---",
    "",
    `<p align="center"><sub>${READCRAFT_CREDIT_PREFIX} <a href="${READCRAFT_URL}">${READCRAFT_BRAND}</a></sub></p>`,
  ].join("\n");
}

/** Escape backticks so user text can't break an inline code span. */
function code(value: string): string {
  return "`" + value.replace(/`/g, "") + "`";
}

/** Shields.io badge for a tech name, tinted with the template accent. */
function shieldBadge(name: string, accent: string): string {
  const label = encodeURIComponent(name);
  return `![${name}](https://img.shields.io/badge/${label}-${accent}?style=for-the-badge&labelColor=0d1117)`;
}

/**
 * Derive a distinct snake color from the template accent so the snake never
 * matches the graph's accent. We rotate the hue ~150 degrees and keep it away
 * from the contribution grid's green ramp (hue ~140), so it stays readable on
 * top of the dark/green cells. Input/output are 6-digit hex WITHOUT a leading
 * "#", matching how accents flow into the SVG query param.
 */
export function snakeAccentFor(accent: string): string {
  const hex = accent.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "a970ff";
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + 360) % 360;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  // Rotate hue for contrast, then push it out of the grid's green band
  // (roughly 90-160 degrees) so the snake reads against green cells.
  let hue = (h + 150) % 360;
  if (hue >= 90 && hue <= 160) hue = 275; // land on a vivid violet instead
  const sat = Math.min(1, Math.max(0.55, s));
  const lig = Math.min(0.72, Math.max(0.55, l || 0.6));

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rp: number;
  let gp: number;
  let bp: number;
  if (hue < 60) [rp, gp, bp] = [c, x, 0];
  else if (hue < 120) [rp, gp, bp] = [x, c, 0];
  else if (hue < 180) [rp, gp, bp] = [0, c, x];
  else if (hue < 240) [rp, gp, bp] = [0, x, c];
  else if (hue < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  const to2 = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `${to2(rp)}${to2(gp)}${to2(bp)}`;
}

/** Format a section heading per the template's heading style. */
function heading(text: string, style: TemplateStyle): string {
  switch (style.headingStyle) {
    case "centered":
      return `<h3 align="center">${text}</h3>`;
    case "banner":
      return `<h2 align="center">${text}</h2>`;
    case "plain":
    default:
      return `### ${text}`;
  }
}

/** Wrap raw markdown/HTML in a centered div when the template is centered. */
function centered(inner: string, style: TemplateStyle): string {
  if (style.align !== "center") return inner;
  return `<div align="center">\n\n${inner}\n\n</div>`;
}

function renderBlock(
  block: ReadmeBlock,
  encoded: string,
  style: TemplateStyle
): string {
  const accent = style.accent;
  switch (block.kind) {
    case "identity": {
      if (style.align === "center") {
        // Inside raw HTML, Markdown backticks don't render, so use a <code>
        // tag for the handle instead of a code span.
        const handle = block.handle
          ? `<p align="center"><code>${block.handle}</code></p>`
          : "";
        return [`<h1 align="center">${block.greeting} 👋</h1>`, handle]
          .filter(Boolean)
          .join("\n");
      }
      const title = `# ${block.greeting} 👋`;
      const handle = block.handle ? code(block.handle) : "";
      return [title, handle ? `\n${handle}` : ""].filter(Boolean).join("\n");
    }
    case "headline": {
      const lines: string[] = [];
      if (block.title) lines.push(heading(block.title, style));
      if (block.bio) {
        if (lines.length) lines.push("");
        lines.push(
          style.align === "center"
            ? `<p align="center">${block.bio}</p>`
            : block.bio
        );
      }
      return lines.join("\n");
    }
    case "social": {
      const badges = block.items
        .map(
          (s) =>
            `<a href="${s.url}"><img src="${encodeURI(s.badgeUrl)}" alt="${s.label}" /></a>`
        )
        .join("\n  ");
      // Social badges are always centered - they read best as a row.
      return `<div align="center">\n  ${badges}\n</div>`;
    }
    case "focus": {
      const items = block.items
        .map(
          (item) =>
            `- ${item.emoji} ${item.prefix} ${
              item.strong ? `**${item.value}**` : item.value
            }`
        )
        .join("\n");
      return items;
    }
    case "tech": {
      const head = heading("Tech Stack & Tooling", style);
      const chips =
        style.techStyle === "badges"
          ? block.items
              .map((t) =>
                t.badgeUrl
                  ? `![${t.name}](${encodeURI(t.badgeUrl)})`
                  : shieldBadge(t.name, accent)
              )
              .join(" ")
          : block.items
              .map((t) =>
                t.badgeUrl
                  ? `![${t.name}](${encodeURI(t.badgeUrl)})`
                  : code(t.name)
              )
              .join(" ");
      return `${head}\n\n${centered(chips, style)}`;
    }
    case "metrics": {
      const has = (k: MetricKind) => block.cards.includes(k);
      const img = (k: MetricKind) =>
        `<img src="${metricImageUrl(k, encoded, accent)}" alt="${metricLabel(k)}" />`;

      // Each group is its own block, separated by a <br> for breathing room:
      //   1. stats + streak (two-up, centered)
      //   2. graph / snake (centered)
      //   3. top languages (full-width, below the graph)
      const groups: string[] = [];

      const topCards = [
        has("stats") && img("stats"),
        has("streak") && img("streak"),
      ]
        .filter(Boolean)
        .join("\n  ");
      if (topCards) groups.push(`<div align="center">\n  ${topCards}\n</div>`);

      if (has("graph"))
        groups.push(`<div align="center">\n  ${img("graph")}\n</div>`);
      if (has("snake")) {
        // The snake body gets its own color, derived from (but distinct from)
        // the template accent, so it never matches the graph's accent. The
        // contribution-count header, though, uses the template accent (via the
        // `header` param) so it stays on-theme with the rest of the card.
        const snakeUrl = metricImageUrl(
          "snake",
          encoded,
          snakeAccentFor(accent),
          {
            header: accent,
          }
        );
        const snakeImg = `<img src="${snakeUrl}" alt="${metricLabel("snake")}" />`;
        groups.push(`<div align="center">\n  ${snakeImg}\n</div>`);
      }

      if (has("topLanguages"))
        groups.push(
          `<img src="${metricImageUrl("topLanguages", encoded, accent)}" alt="${metricLabel("topLanguages")}" width="100%" />`
        );

      // Join groups with a <br>, and add a trailing <br> after the last one.
      const body = groups.length
        ? `${groups.join("\n\n<br>\n\n")}\n\n<br>`
        : "";

      return [heading("GitHub Activity & Streak", style), "", body].join("\n");
    }
    case "projects": {
      return [
        heading("Pinned Repositories", style),
        "",
        `<div align="center">`,
        `  <a href="https://github.com/${encoded}?tab=repositories"><img src="${projectsImageUrl(encoded, accent)}" alt="Pinned repositories" /></a>`,
        `</div>`,
      ].join("\n");
    }
  }
}

/** Render an already-built document to Markdown, honoring its style. */
export function renderMarkdown(document: ReadmeDocument): string {
  const { style } = document;
  // Section separator: a rule for "line" style, otherwise just breathing room.
  const separator = style.divider === "line" ? "\n\n---\n\n" : "\n\n<br>\n\n";
  const body = document.blocks
    .map((block) =>
      renderBlock(block, encodeUsername(document.username), style)
    )
    .join(separator);
  const footer = creditFooter();
  return body ? `${body}\n\n${footer}\n` : `${footer}\n`;
}

/** Public entry point: build the document from state and render it. */
export function generateMarkdown(state: ProfileState): string {
  return renderMarkdown(buildReadmeDocument(state));
}
