import { useProfile } from "../../store";
import { useRouter } from "../../router";
import { Icon } from "../../components/ui/Icon";

/**
 * Social links editor: lists the badges added from the Badge Studio, with
 * reorder and remove controls. New links are created in the Badge Studio and
 * handed over to the builder, which drops them into this section.
 */
export function SocialEditor() {
  const { state, dispatch } = useProfile();
  const { navigate } = useRouter();
  const links = state.social;

  return (
    <div className="flex flex-col gap-2">
      {links.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No social links yet. Design one in the Badge Studio and choose “Add to
          README”.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {links.map((link, i) => (
            <li
              key={link.id}
              className="flex items-center gap-2 rounded-[4px] border-2 border-ink bg-surface-container-lowest p-2"
            >
              <img
                src={link.badgeUrl}
                alt=""
                className="h-5 shrink-0 rounded-sm"
              />
              <span className="min-w-0 flex-1 truncate text-code-sm text-on-surface">
                {link.label}
              </span>
              <button
                type="button"
                aria-label={`Move ${link.label} up`}
                disabled={i === 0}
                onClick={() =>
                  dispatch({ type: "moveSocial", id: link.id, direction: -1 })
                }
                className="nb-press-sm rounded-[4px] border-2 border-transparent p-1 text-on-surface-variant hover:border-ink hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon name="keyboard_arrow_up" size={16} />
              </button>
              <button
                type="button"
                aria-label={`Move ${link.label} down`}
                disabled={i === links.length - 1}
                onClick={() =>
                  dispatch({ type: "moveSocial", id: link.id, direction: 1 })
                }
                className="nb-press-sm rounded-[4px] border-2 border-transparent p-1 text-on-surface-variant hover:border-ink hover:bg-surface-container hover:text-on-surface disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon name="keyboard_arrow_down" size={16} />
              </button>
              <button
                type="button"
                aria-label={`Remove ${link.label}`}
                onClick={() => dispatch({ type: "removeSocial", id: link.id })}
                className="nb-press-sm rounded-[4px] border-2 border-transparent p-1 text-on-surface-variant hover:border-ink hover:bg-surface-container hover:text-error"
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate({ name: "badges" })}
        className="nb-press-sm mt-1 inline-flex items-center justify-center gap-1.5 self-start rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-1.5 font-mono text-label-md font-bold uppercase tracking-wide text-on-surface hover:bg-surface-container"
      >
        <Icon name="add" size={15} />
        Add a social badge
      </button>
    </div>
  );
}
