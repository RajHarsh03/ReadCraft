import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { Toggle } from "../../components/ui/Toggle";
import { SECTION_META } from "../../lib/sections";

/**
 * Accessible section-order editor. Each row lists a section with an enable
 * toggle and keyboard-focusable Move up / Move down buttons that reorder the
 * document. Order here drives both the preview and the exported Markdown.
 */
export function SectionOrderEditor() {
  const { state, dispatch } = useProfile();
  const { order, enabled } = state;

  return (
    <ul className="flex flex-col gap-1.5">
      {order.map((id, index) => {
        const meta = SECTION_META[id];
        const isOn = enabled[id];
        return (
          <li
            key={id}
            className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-surface-container-lowest px-2 py-1.5"
          >
            <span className="flex w-5 shrink-0 justify-center text-code-sm text-on-surface-variant">
              {index + 1}
            </span>
            <Icon
              name={meta.icon}
              size={16}
              className={
                isOn ? "text-on-surface" : "text-on-surface-variant/50"
              }
            />
            <span
              className={`flex-1 text-body-sm ${
                isOn ? "text-on-surface" : "text-on-surface-variant/60"
              }`}
            >
              {meta.label}
            </span>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label={`Move ${meta.label} up`}
                disabled={index === 0}
                onClick={() =>
                  dispatch({ type: "reorderSection", id, direction: -1 })
                }
                className="nb-press-sm rounded-[4px] border-2 border-transparent p-1 text-on-surface-variant hover:border-ink hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon name="keyboard_arrow_up" size={16} />
              </button>
              <button
                type="button"
                aria-label={`Move ${meta.label} down`}
                disabled={index === order.length - 1}
                onClick={() =>
                  dispatch({ type: "reorderSection", id, direction: 1 })
                }
                className="nb-press-sm rounded-[4px] border-2 border-transparent p-1 text-on-surface-variant hover:border-ink hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon name="keyboard_arrow_down" size={16} />
              </button>
            </div>

            <Toggle
              checked={isOn}
              onChange={(value) =>
                dispatch({ type: "toggleSection", id, value })
              }
              label={`Enable ${meta.label}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
