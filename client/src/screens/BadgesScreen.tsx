import { PageShell } from "../components/shell/PageShell";
import { BadgeStudio } from "../components/BadgeStudio";
import { useToast } from "../components/ui/Toast";
import { PENDING_BADGE_KEY, type BadgeSpec } from "../lib/badges";

/** Standalone Badge Studio. "Add to README" queues the badge for the editor. */
export function BadgesScreen() {
  const toast = useToast();

  const addToReadme = (spec: BadgeSpec) => {
    try {
      sessionStorage.setItem(PENDING_BADGE_KEY, JSON.stringify(spec));
      toast.success("Badge ready! Open your editor to add it to the README.");
    } catch {
      toast.error("Couldn't save badge. Your storage may be full.");
    }
  };

  return (
    <PageShell
      title="Badge Studio"
      description="Design a Shields.io badge, copy the Markdown, or add it straight to your README."
    >
      <BadgeStudio onAdd={addToReadme} />
    </PageShell>
  );
}
