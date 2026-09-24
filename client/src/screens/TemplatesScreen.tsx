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
              className="group flex flex-col overflow-hidden rounded-[12px] border border-outline-variant/80 bg-surface-container-low/60 transition-colors hover:border-border-strong"
            >
              {/* Accent header strip */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: accent }}
              />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-surface-container-lowest"
                    style={{ backgroundColor: accent }}
                  />
                  <h2 className="text-headline-sm font-semibold text-on-surface">
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
                      className="rounded-full border border-outline-variant/70 bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Miniature layout preview: ordered section chips */}
                <div className="mt-4 flex flex-1 flex-wrap content-start gap-1 rounded-[8px] border border-outline-variant/60 bg-surface-container-lowest/60 p-2.5">
                  {template.layout.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-surface-container px-1.5 py-0.5 text-label-sm text-on-surface-variant"
                    >
                      {SECTION_META[id].label}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openWithTemplate(template.id)}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[6px] border px-3 py-2 text-label-md font-semibold transition-colors hover:bg-surface-container-high"
                  style={{ borderColor: accent, color: accent }}
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
