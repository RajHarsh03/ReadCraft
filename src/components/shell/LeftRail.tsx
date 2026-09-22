import { Icon } from "../ui/Icon";

const PRIMARY_NAV = [
  { icon: "edit_document", label: "Section Editor", active: true },
  { icon: "grid_view", label: "Templates", active: false },
  { icon: "military_tech", label: "Badge Studio", active: false },
  { icon: "visibility", label: "Live Preview", active: false },
];

/** Fixed left workspace rail (Section Editor / Templates / Badge Studio / …). */
export function LeftRail() {
  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-64 flex-col justify-between border-r border-outline-variant bg-surface-container-lowest/95 py-4 backdrop-blur-xl lg:flex">
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
              <span
                key={item.label}
                aria-disabled="true"
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-label-md text-on-surface-variant/50"
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </span>
            )
          )}
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-center justify-between py-1 text-code-sm text-on-surface-variant">
          <span>Engine</span>
          <span className="text-primary">GFM Ready</span>
        </div>
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
