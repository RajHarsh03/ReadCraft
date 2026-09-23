import type { ProfileState } from "../types";
import {
  buildReadmeDocument,
  metricImageUrl,
  metricLabel,
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
    case "metrics":
      return [
        "### GitHub Activity & Streak",
        "",
        ...block.cards.flatMap((kind) => [renderMetricCard(kind, encoded), ""]),
      ]
        .join("\n")
        .trimEnd();
    case "projects":
      return [
        "### Pinned Repositories",
        "",
        ...block.items.map(
          (p) => `- **${p.name}** (★ ${p.stars}) - ${p.description}`
        ),
      ].join("\n");
  }
}

/** Render an already-built document to Markdown. */
export function renderMarkdown(document: ReadmeDocument): string {
  const body = document.blocks
    .map((block) => renderBlock(block, encodeUsername(document.username)))
    .join("\n\n");
  // The ReadCraft credit is always appended, even for an empty document, so
  // every exported README carries attribution.
  const footer = creditFooter();
  return body ? `${body}\n\n${footer}\n` : `${footer}\n`;
}

/** Public entry point: build the document from state and render it. */
export function generateMarkdown(state: ProfileState): string {
  return renderMarkdown(buildReadmeDocument(state));
}
