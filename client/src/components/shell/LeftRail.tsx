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

/** Fixed left workspace rail (Section Editor / Templates / Badge Studio / …). */
export function LeftRail() {
  const { route, navigate } = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedRefresh, setSavedRefresh] = useState(0);

  const renderNavItem = useCallback(
    (item: NavItem) => {
      const active = item.activeFor.includes(route.name);
      return active ? (
        <span
          key={item.label}
          aria-current="page"
          className="relative flex items-center gap-2.5 border-l-2 border-primary-container bg-surface-container-high/60 py-2 pl-3 pr-3 text-label-md font-semibold text-on-surface"
        >
          <Icon name={item.icon} size={18} className="text-primary" />
          <span>{item.label}</span>
        </span>
      ) : (
        <button
          key={item.label}
          type="button"
          onClick={() => navigate(item.to)}
          className="flex items-center gap-2.5 border-l-2 border-transparent py-2 pl-3 pr-3 text-left text-label-md text-on-surface-variant transition-colors hover:border-outline-variant hover:bg-surface-container-lowest hover:text-on-surface"
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </button>
      );
    },
    [route.name, navigate]
  );

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-56 flex-col justify-between border-r border-outline-variant/60 bg-surface py-4 lg:flex">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4">
          <span className="text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
            Workspace
          </span>
        </div>
        <nav className="flex flex-col">
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
              onClick={() => setSavedOpen((v) => !v)}
              className={cn(
                "flex w-full items-center gap-2.5 border-l-2 py-2 pl-3 pr-3 text-left text-label-md transition-colors",
                savedOpen
                  ? "border-primary-container bg-surface-container-high/60 text-on-surface"
                  : "border-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-lowest hover:text-on-surface"
              )}
            >
              <Icon name="folder_open" size={18} />
              <span>Saved Profiles</span>
            </button>
          </div>

          {NAV_AFTER.map(renderNavItem)}
        </nav>
      </div>

      <div data-rc-prefs className="relative flex flex-col">
        <PreferencesDialog
          open={prefsOpen}
          onClose={() => setPrefsOpen(false)}
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={prefsOpen}
          onClick={() => setPrefsOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2.5 border-l-2 py-2 pl-3 pr-3 text-left text-label-md transition-colors",
            prefsOpen
              ? "border-primary-container bg-surface-container-high/60 text-on-surface"
              : "border-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-lowest hover:text-on-surface"
          )}
        >
          <Icon name="tune" size={18} />
          <span>Preferences</span>
        </button>
      </div>
    </aside>
  );
}
