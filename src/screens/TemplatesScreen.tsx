import { PageShell } from "../components/shell/PageShell";
import { useRouter } from "../router";
import { TEMPLATES, PENDING_TEMPLATE_KEY } from "../lib/templates";
import { SECTION_META } from "../lib/sections";

/** Templates gallery. Choosing one opens the builder with it applied. */
export function TemplatesScreen() {
  const { navigate } = useRouter();

  const useTemplate = (id: string) => {
    try {
      sessionStorage.setItem(PENDING_TEMPLATE_KEY, id);
    } catch {
      // If storage is unavailable the builder simply opens without the preset.
    }
    navigate({ name: "builder", username: "" });
  };

  return (
    <PageShell
      title="Templates"
      description="Pick a layout to start from. Templates only arrange sections — you can fine-tune everything in the builder afterwards."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="flex flex-col rounded-[10px] border border-outline-variant/80 bg-surface-container-low/60 p-5"
          >
            <h2 className="text-headline-sm font-semibold text-on-surface">
              {template.name}
            </h2>
            <p className="mt-1 flex-1 text-body-sm text-on-surface-variant">
              {template.description}
            </p>

            {/* Miniature layout preview */}
            <div className="mt-4 flex flex-col gap-1 rounded-[8px] border border-outline-variant/70 bg-surface-container-lowest/60 p-2.5">
              {template.layout.map((id) => (
                <div
                  key={id}
                  className="rounded bg-surface-container px-2 py-1 text-label-sm text-on-surface-variant"
                >
                  {SECTION_META[id].label}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => useTemplate(template.id)}
              className="rc-amber-glow mt-4 inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-primary-container px-3 py-2 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
            >
              Use template
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
