import type { ProfileState } from "../types";
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
 * This renderer only formats blocks; it never decides which sections appear or
 * in what order - that is owned by `buildReadmeDocument`. The preview renders
 * the same document, so preview and export stay in lockstep.
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

function renderMetricCard(kind: MetricKind, encoded: string): string {
  return `![${metricLabel(kind)}](${metricImageUrl(kind, encoded)})`;
}

function renderBlock(block: ReadmeBlock, encoded: string): string {
  switch (block.kind) {
    case "identity": {
      const lines = [`# ${block.greeting} 👋`];
      if (block.handle) lines.push("", code(block.handle));
      return lines.join("\n");
    }
    case "headline": {
      const lines: string[] = [];
      if (block.title) lines.push(`### ${block.title}`);
      if (block.bio) {
        if (lines.length) lines.push("");
        lines.push(block.bio);
      }
      return lines.join("\n");
    }
    case "focus":
      return block.items
        .map(
          (item) =>
            `- ${item.emoji} ${item.prefix} ${
              item.strong ? `**${item.value}**` : item.value
            }`
        )
        .join("\n");
    case "tech":
      return [
        "### Tech Stack & Tooling",
        "",
        block.items
          .map((t) =>
            t.badgeUrl ? `![${t.name}](${encodeURI(t.badgeUrl)})` : code(t.name)
          )
          .join(" "),
      ].join("\n");
    case "metrics": {
      const has = (k: MetricKind) => block.cards.includes(k);
      // Bare <img> so GitHub keeps images that share a centered <div> on the
      // same row (Markdown image syntax would force block layout).
      const img = (k: MetricKind) =>
        `<img src="${metricImageUrl(k, encoded)}" alt="${metricLabel(k)}" />`;

      // Each centered <div> is one row; GitHub renders <div align="center">,
      // so this lays out reliably in the exported README:
      //   row 1: stats + streak (two-up)
      //   row 2: top languages
      //   row 3: the wide calendar (graph or snake)
      const rows: string[] = [];

      const topCards = [has("stats") && img("stats"), has("streak") && img("streak")]
        .filter(Boolean)
        .join("\n  ");
      if (topCards) rows.push(`<div align="center">\n  ${topCards}\n</div>`);

      // Top languages spans the full width (not centered), like a banner.
      if (has("topLanguages"))
        rows.push(
          `<img src="${metricImageUrl("topLanguages", encoded)}" alt="${metricLabel("topLanguages")}" width="100%" />`
        );
      if (has("graph"))
        rows.push(`<div align="center">\n  ${img("graph")}\n</div>`);
      if (has("snake"))
        rows.push(`<div align="center">\n  ${img("snake")}\n</div>`);

      return ["### GitHub Activity & Streak", "", rows.join("\n\n")].join("\n");
    }
    case "projects":
      // Rendered as a self-hosted, centered card image of featured repos.
      return [
        "### Pinned Repositories",
        "",
        `<div align="center">`,
        `  <a href="https://github.com/${encoded}?tab=repositories"><img src="${projectsImageUrl(encoded)}" alt="Pinned repositories" /></a>`,
        `</div>`,
      ].join("\n");
  }
}

/** Render an already-built document to Markdown. */
export function renderMarkdown(document: ReadmeDocument): string {
  // Sections are separated by a <br> so they get breathing room on GitHub
  // (a blank line alone renders quite tight).
  const separator = "\n\n<br>\n\n";
  const body = document.blocks
    .map((block) => renderBlock(block, encodeUsername(document.username)))
    .join(separator);
  // The ReadCraft credit is always appended, even for an empty document, so
  // every exported README carries attribution.
  const footer = creditFooter();
  return body ? `${body}${separator}${footer}\n` : `${footer}\n`;
}

/** Public entry point: build the document from state and render it. */
export function generateMarkdown(state: ProfileState): string {
  return renderMarkdown(buildReadmeDocument(state));
}
