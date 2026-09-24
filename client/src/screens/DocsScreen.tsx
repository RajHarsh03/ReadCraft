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
      <div className="divide-y divide-outline-variant/50 border-y border-outline-variant/50">
        {SECTIONS.map((s, i) => (
          <div
            key={s.q}
            className="group grid grid-cols-12 items-baseline gap-4 py-7 transition-colors hover:bg-surface-container-lowest/40"
          >
            <span className="col-span-2 font-display text-headline-md font-bold text-outline-variant transition-colors group-hover:text-primary md:col-span-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="col-span-10 md:col-span-11">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                {s.q}
              </h2>
              <p className="mt-2 max-w-2xl text-body-md leading-relaxed text-on-surface-variant">
                {s.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
