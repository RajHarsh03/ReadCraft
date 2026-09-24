import { useProfile } from "../../store";
import { useToast } from "../../components/ui/Toast";
import { Icon } from "../../components/ui/Icon";
import { TEMPLATES, templateLayout, type Template } from "../../lib/templates";
import { SECTION_META } from "../../lib/sections";
import type { SectionId } from "../../types";

/**
 * In-builder template picker. Applying a template changes the layout (enabled
 * sections + order) and the presentation style (headings, alignment, tech
 * display, accent, dividers); the user's content is preserved, so it is safe
 * to switch freely.
 */
export function TemplatePicker() {
  const { state, dispatch } = useProfile();
  const toast = useToast();

  /** A template is active only when its layout AND style match the document. */
  const isActive = (template: Template) => {
    const { enabled, order, style } = templateLayout(template);
    if (order.join() !== state.order.join()) return false;
    const layoutMatch = (Object.keys(enabled) as SectionId[]).every(
      (id) => enabled[id] === state.enabled[id]
    );
    if (!layoutMatch) return false;
    const s = state.templateStyle;
    return (
      s.headingStyle === style.headingStyle &&
      s.align === style.align &&
      s.techStyle === style.techStyle &&
      s.accent === style.accent &&
      s.divider === style.divider
    );
  };

  const apply = (template: Template) => {
    dispatch({ type: "applyTemplate", template });
    toast.success(`Applied the ${template.name} template.`);
  };

  return (
    <div className="flex flex-col gap-2">
      {TEMPLATES.map((template) => {
        const active = isActive(template);
        return (
          <div
            key={template.id}
            className={`rounded-[8px] border p-3 transition-colors ${
              active
                ? "border-primary-container/60 bg-primary-container/5"
                : "border-outline-variant bg-surface-container-low/50 hover:border-border-strong"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-body-md font-semibold text-on-surface">
                    {template.name}
                  </span>
                  {active && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-primary-container/15 px-1.5 py-0.5 text-label-sm text-primary-container">
                      <Icon name="check" size={12} /> Active
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-body-sm text-on-surface-variant">
                  {template.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => apply(template)}
                disabled={active}
                className="shrink-0 rounded-[6px] border border-outline-variant bg-surface-container px-2.5 py-1 text-label-md text-on-surface transition-colors hover:border-border-strong hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
              >
                {active ? "Applied" : "Apply"}
              </button>
            </div>

            {/* Layout preview: ordered section chips */}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {template.layout.map((id) => (
                <span
                  key={id}
                  className="rounded bg-surface-container-high px-1.5 py-0.5 text-label-sm text-on-surface-variant"
                >
                  {SECTION_META[id].label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Templates change the layout and styling only - your content is never
        changed.
      </p>
    </div>
  );
}
