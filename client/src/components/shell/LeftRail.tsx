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
          className="flex items-center gap-2.5 rounded-lg border border-border-strong/70 bg-surface-container-high px-2.5 py-2 text-label-md font-semibold text-primary shadow-[inset_3px_0_0_var(--color-primary-container)]"
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </span>
      ) : (
        <button
          key={item.label}
          type="button"
          onClick={() => navigate(item.to)}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </button>
      );
    },
    [route.name, navigate]
  );

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-52 flex-col justify-between border-r border-outline-variant bg-surface-container-lowest/95 py-4 backdrop-blur-xl lg:flex">
      <div className="flex flex-col gap-4">
        <div className="px-4">
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Workspace Canvas
          </span>
        </div>
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
              onClick={() => setSavedOpen((v) => !v)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-label-md transition-colors",
                savedOpen
                  ? "bg-surface-container text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon name="folder_open" size={18} />
              <span>Saved Profiles</span>
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
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={prefsOpen}
          onClick={() => setPrefsOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-label-md transition-colors",
            prefsOpen
              ? "bg-surface-container text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          )}
        >
          <Icon name="tune" size={18} />
          <span>Preferences</span>
        </button>
      </div>
    </aside>
  );
}
