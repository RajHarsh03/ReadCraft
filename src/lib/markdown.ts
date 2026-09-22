import type { ProfileState } from "../types";

/**
 * Generate GitHub-flavoured Markdown from the profile state. Kept intentionally
 * simple; the same source feeds both the "Markdown" tab and (conceptually) an
 * export, so the preview stays honest.
 */
export function generateMarkdown(state: ProfileState): string {
  const { basics, headline, focus, tech, metrics, pinned, enabled } = state;
  const lines: string[] = [];

  if (enabled.profile) {
    lines.push(`# Hi there, I'm ${basics.fullName} 👋`, "");
    if (basics.username) lines.push(`\`@${basics.username}\``, "");
  }

  if (enabled.headline) {
    lines.push(
      `### ${headline.primary}${basics.company ? ` at ${basics.company}` : ""}`,
      ""
    );
    if (headline.bio) {
      const location = basics.location ? ` Based in ${basics.location}.` : "";
      lines.push(`${headline.bio}${location}`, "");
    }
  }

  if (enabled.focus) {
    if (focus.working) lines.push(`- 🔭 I'm currently working on **${focus.working}**`);
    if (focus.learning) lines.push(`- 🌱 I'm currently learning **${focus.learning}**`);
    if (focus.askMeAbout) lines.push(`- 💬 Ask me about ${focus.askMeAbout}`);
    if (focus.working || focus.learning || focus.askMeAbout) lines.push("");
  }

  if (enabled.tech && tech.length) {
    lines.push("### Tech Stack & Tooling", "");
    lines.push(tech.map((t) => `\`${t.name}\``).join(" "), "");
  }

  if (enabled.metrics) {
    lines.push("### GitHub Activity & Streak", "");
    if (metrics.showStatsCard) {
      lines.push(
        `![${basics.username}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${basics.username})`,
        ""
      );
    }
    if (metrics.showStreak) {
      lines.push(
        `![Streak](https://streak-stats.demolab.com?user=${basics.username})`,
        ""
      );
    }
    if (metrics.showTopLanguages) {
      lines.push(
        `![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${basics.username})`,
        ""
      );
    }
    if (metrics.showSnake) {
      lines.push(
        `![Snake](https://github.com/${basics.username}/${basics.username}/blob/output/snake.svg)`,
        ""
      );
    }
  }

  if (enabled.pinned && pinned.length) {
    lines.push("### Pinned Repositories", "");
    for (const p of pinned) {
      lines.push(`- **${p.name}** (★ ${p.stars}) — ${p.description}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
