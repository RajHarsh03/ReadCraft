import { PageShell } from "../components/shell/PageShell";

const SECTIONS = [
  {
    q: "How do I start?",
    a: "Enter any public GitHub username on the home page and open the builder. Your profile data loads automatically and you can edit every section.",
  },
  {
    q: "Where is my work saved?",
    a: "Drafts are saved automatically in your browser's local storage. Refreshing the page restores your latest edits. Use Reset in the builder to clear a draft.",
  },
  {
    q: "How do I export my README?",
    a: "Use Copy to put the Markdown on your clipboard, or Download to save a README.md file. Commit it to a repository named after your username to show it on your profile.",
  },
  {
    q: "Is my data sent anywhere?",
    a: "Only the public GitHub username you enter is sent to the ReadCraft server to fetch public profile data. Your README content stays in your browser.",
  },
];

/** Lightweight documentation / FAQ page. */
export function DocsScreen() {
  return (
    <PageShell
      title="Documentation"
      description="Everything you need to build and export your profile README."
    >
      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <div
            key={s.q}
            className="rounded-[10px] border border-outline-variant/80 bg-surface-container-low/60 p-5"
          >
            <h2 className="text-headline-sm font-semibold text-on-surface">
              {s.q}
            </h2>
            <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">
              {s.a}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
