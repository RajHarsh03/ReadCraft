import { PageShell } from "../components/shell/PageShell";

/** Badge Studio. Snippet generation is added in a later task. */
export function BadgesScreen() {
  return (
    <PageShell
      title="Badge Studio"
      description="Generate Shields.io badges and copy the Markdown."
    >
      <p className="text-body-md text-on-surface-variant">
        The badge builder is coming up shortly.
      </p>
    </PageShell>
  );
}
