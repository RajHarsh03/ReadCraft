import { PageShell } from "../components/shell/PageShell";
import { BadgeStudio } from "../components/BadgeStudio";
import { useRouter } from "../router";
import { PENDING_BADGE_KEY, type BadgeSpec } from "../lib/badges";

/** Standalone Badge Studio. "Add to README" opens the builder with the badge. */
export function BadgesScreen() {
  const { navigate } = useRouter();

  const addToReadme = (spec: BadgeSpec) => {
    try {
      sessionStorage.setItem(PENDING_BADGE_KEY, JSON.stringify(spec));
    } catch {
      // If storage is unavailable, the builder simply opens without the badge.
    }
    navigate({ name: "builder", username: "" });
  };

  return (
    <PageShell
      title="Badge Studio"
      description="Design a Shields.io badge, copy the Markdown, or add it straight to your README."
    >
      <div className="max-w-2xl">
        <BadgeStudio onAdd={addToReadme} />
      </div>
    </PageShell>
  );
}
