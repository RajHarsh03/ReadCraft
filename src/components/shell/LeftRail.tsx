import { Icon } from "../ui/Icon";
import { useRouter, type Route } from "../../router";

interface NavItem {
  icon: string;
  label: string;
  /** Route to navigate to, or null for the current/disabled item. */
  to: Route | null;
  active?: boolean;
  disabled?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { icon: "edit_document", label: "Section Editor", to: null, active: true },
  { icon: "grid_view", label: "Templates", to: { name: "templates" } },
  { icon: "military_tech", label: "Badge Studio", to: { name: "badges" } },
  { icon: "menu_book", label: "Documentation", to: { name: "docs" } },
];

/** Fixed left workspace rail (Section Editor / Templates / Badge Studio / …). */
export function LeftRail() {
  const { navigate } = useRouter();

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-52 flex-col justify-between border-r border-outline-variant bg-surface-container-lowest/95 py-4 backdrop-blur-xl lg:flex">
      <div className="flex flex-col gap-4">
        <div className="px-4">
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Workspace Canvas
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {PRIMARY_NAV.map((item) =>
            item.active ? (
              <span
                key={item.label}
                aria-current="page"
                className="flex items-center gap-2.5 rounded-lg border border-border-strong/70 bg-surface-container-high px-2.5 py-2 text-label-md font-semibold text-primary shadow-[inset_3px_0_0_var(--color-primary-container)]"
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </span>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => item.to && navigate(item.to)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-4">
        <span
          aria-disabled="true"
          title="Coming soon"
          className="flex cursor-not-allowed items-center gap-2.5 rounded px-2.5 py-1 text-label-md text-on-surface-variant/50"
        >
          <Icon name="tune" size={18} />
          <span>Preferences</span>
        </span>
      </div>
    </aside>
  );
}
