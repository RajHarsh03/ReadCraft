import { PageShell } from "../components/shell/PageShell";
import { useRouter } from "../router";
import {
  TEMPLATES,
  PENDING_TEMPLATE_KEY,
  type Template,
} from "../lib/templates";
import { SECTION_META } from "../lib/sections";

/** Short human labels for a template's style, shown as chips on its card. */
function styleTags(t: Template): string[] {
  const s = t.style;
  return [
    s.align === "center" ? "Centered" : "Left-aligned",
    s.headingStyle === "banner"
      ? "Banner headings"
      : s.headingStyle === "centered"
        ? "Underlined headings"
        : "Plain headings",
    s.techStyle === "badges" ? "Shield badges" : "Code chips",
    s.divider === "line" ? "Ruled sections" : "Airy spacing",
  ];
}

/**
 * Templates gallery. Each card previews the template's *style* (accent, layout,
 * and presentation choices). Choosing one opens the builder with it applied.
 */
export function TemplatesScreen() {
  const { navigate } = useRouter();

  const openWithTemplate = (id: string) => {
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
      description="Each template restyles your README - alignment, headings, tech display, dividers, and an accent colour. Your content is never changed, so switch freely."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => {
          const accent = `#${template.style.accent}`;
          return (
            <div
              key={template.id}
              className="nb-press group flex flex-col overflow-hidden rounded-[4px] border-2 border-ink bg-surface-container-lowest shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              {/* Accent header strip */}
              <div className="h-1 w-full" style={{ backgroundColor: accent }} />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-ink"
                    style={{ backgroundColor: accent }}
                  />
                  <h2 className="font-display text-headline-sm font-semibold text-on-surface">
                    {template.name}
                  </h2>
                </div>
                <p className="mt-1.5 text-body-sm text-on-surface-variant">
                  {template.description}
                </p>

                {/* Style tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {styleTags(template).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[4px] border-2 border-ink bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Miniature layout preview: ordered section chips */}
                <div className="mt-4 flex flex-1 flex-wrap content-start gap-1 rounded-[4px] border-2 border-ink bg-surface-container-low p-2.5">
                  {template.layout.map((id) => (
                    <span
                      key={id}
                      className="rounded-[4px] border border-ink bg-surface-container-lowest px-1.5 py-0.5 font-mono text-label-sm text-on-surface-variant"
                    >
                      {SECTION_META[id].label}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openWithTemplate(template.id)}
                  className="nb-press-sm mt-4 inline-flex items-center justify-center gap-1.5 rounded-[4px] border-2 px-3 py-2 font-mono text-label-md font-bold uppercase tracking-wide transition-colors"
                  style={{ borderColor: "var(--color-ink)", color: accent, backgroundColor: "var(--color-surface-container-lowest)" }}
                >
                  Use template
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
