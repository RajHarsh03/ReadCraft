import { PageShell } from "../components/shell/PageShell";
import { Icon } from "../components/ui/Icon";
import { useRouter } from "../router";

/** Shown for any unrecognized route hash. */
export function NotFoundScreen() {
  const { navigate } = useRouter();

  return (
    <PageShell
      title="Page not found"
      description="That link doesn't match any part of ReadCraft."
    >
      <div className="flex flex-col items-start gap-6 border border-outline-variant/70 border-l-2 border-l-primary-container bg-surface-container-low p-8">
        <span className="font-display text-[6rem] font-bold leading-none tracking-tight text-outline-variant">
          404
        </span>
        <p className="max-w-md text-body-md text-on-surface-variant">
          The page you were looking for may have moved, or the address was
          mistyped. Head back and pick up where you left off.
        </p>
        <button
          type="button"
          onClick={() => navigate({ name: "landing" })}
          className="inline-flex items-center gap-1.5 bg-primary-container px-5 py-2.5 text-label-md font-bold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
        >
          <Icon name="home" size={16} />
          Back to home
        </button>
      </div>
    </PageShell>
  );
}
