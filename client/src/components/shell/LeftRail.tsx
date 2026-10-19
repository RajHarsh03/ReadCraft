import { useCallback, useState } from "react";
import { Icon } from "../ui/Icon";
import { useRouter, type Route, type RouteName } from "../../router";
import { PreferencesDialog } from "../PreferencesDialog";
import { SavedProfilesPopover } from "../SavedProfilesPopover";
import { cn } from "../../lib/cn";

interface NavItem {
  icon: string;
  label: string;
  /** Route to navigate to when clicked. */
  to: Route;
  /** Route names that should render this item as the active one. */
  activeFor: RouteName[];
}

/** Nav items shown above the "Saved Profiles" switcher. */
const NAV_BEFORE: NavItem[] = [
  {
    icon: "edit_document",
    label: "Section Editor",
    // Section Editor lives in the builder; open it with no seeded username.
    to: { name: "builder", username: "" },
    activeFor: ["builder", "landing"],
  },
  {
    icon: "grid_view",
    label: "Templates",
    to: { name: "templates" },
    activeFor: ["templates"],
  },
  {
    icon: "military_tech",
    label: "Badge Studio",
    to: { name: "badges" },
    activeFor: ["badges"],
  },
];

/** Nav items shown below the "Saved Profiles" switcher. */
const NAV_AFTER: NavItem[] = [
  {
    icon: "menu_book",
    label: "Documentation",
    to: { name: "docs" },
    activeFor: ["docs"],
  },
];

interface LeftRailProps {
  /** When true the rail shrinks to an icon-only strip. */
  collapsed: boolean;
  /** Toggle the collapsed state (owned by the shell so content can reflow). */
  onToggleCollapse: () => void;
}

/** Fixed left workspace rail (Section Editor / Templates / Badge Studio / …). */
export function LeftRail({ collapsed, onToggleCollapse }: LeftRailProps) {
  const { route, navigate } = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedRefresh, setSavedRefresh] = useState(0);

  const renderNavItem = useCallback(
    (item: NavItem) => {
      const active = item.activeFor.includes(route.name);
      const inner = (
        <>
          <Icon name={item.icon} size={18} className="shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </>
      );
      return active ? (
        <span
          key={item.label}
          aria-current="page"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "flex w-full items-center rounded-[4px] border-2 border-ink bg-primary-container py-2 font-mono text-label-md font-bold uppercase tracking-wide text-on-primary",
            collapsed ? "justify-center px-0" : "gap-2.5 px-3"
          )}
        >
          {inner}
        </span>
      ) : (
        <button
          key={item.label}
          type="button"
          onClick={() => navigate(item.to)}
          aria-label={item.label}
          title={item.label}
          className={cn(
            "flex w-full items-center rounded-[4px] border-2 border-transparent py-2 font-mono text-label-md uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface",
            collapsed ? "justify-center px-0" : "gap-2.5 px-3"
          )}
        >
          {inner}
        </button>
      );
    },
    [route.name, navigate, collapsed]
  );

  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-16 z-40 hidden flex-col justify-between border-r-2 border-ink bg-surface py-4 transition-[width] duration-200 lg:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex flex-col gap-4">
        {!collapsed && (
          <div className="flex items-center px-3">
            <span className="font-mono text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
              Workspace
            </span>
          </div>
        )}
        <nav className="flex flex-col gap-1 px-2">
          {NAV_BEFORE.map(renderNavItem)}

          {/* Saved Profiles: opens a popover of per-username saved drafts. */}
          <div data-rc-saved className="relative">
            <SavedProfilesPopover
              open={savedOpen}
              onClose={() => setSavedOpen(false)}
              onOpenProfile={(username) =>
                navigate({ name: "builder", username })
              }
              refreshKey={savedRefresh}
              onChanged={() => setSavedRefresh((n) => n + 1)}
            />
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={savedOpen}
              aria-label="Saved Profiles"
              title="Saved Profiles"
              onClick={() => setSavedOpen((v) => !v)}
              className={cn(
                "flex w-full items-center rounded-[4px] py-2 font-mono text-label-md uppercase tracking-wide transition-colors",
                collapsed ? "justify-center px-0" : "gap-2.5 px-3",
                savedOpen
                  ? "border-2 border-ink bg-primary-container font-bold text-on-primary"
                  : "border-2 border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon name="folder_open" size={18} className="shrink-0" />
              {!collapsed && <span>Saved Profiles</span>}
            </button>
          </div>

          {NAV_AFTER.map(renderNavItem)}
        </nav>
      </div>

      <div data-rc-prefs className="relative flex flex-col gap-1 px-2">
        <PreferencesDialog
          open={prefsOpen}
          onClose={() => setPrefsOpen(false)}
        />
        <div
          className={cn(
            "flex items-center gap-1",
            collapsed ? "flex-col" : "flex-row"
          )}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={prefsOpen}
            aria-label="Preferences"
            title="Preferences"
            onClick={() => setPrefsOpen((v) => !v)}
            className={cn(
              "flex items-center rounded-[4px] py-2 font-mono text-label-md uppercase tracking-wide transition-colors",
              collapsed ? "w-full justify-center px-0" : "flex-1 gap-2.5 px-3",
              prefsOpen
                ? "border-2 border-ink bg-primary-container font-bold text-on-primary"
                : "border-2 border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <Icon name="tune" size={18} className="shrink-0" />
            {!collapsed && <span>Preferences</span>}
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="nb-press-sm flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border-2 border-ink bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
          >
            <Icon
              name={collapsed ? "chevron_right" : "chevron_left"}
              size={18}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
