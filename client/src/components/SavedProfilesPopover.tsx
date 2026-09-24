import { useEffect, useRef } from "react";
import { Icon } from "./ui/Icon";
import { cn } from "../lib/cn";
import {
  deleteSavedProfile,
  listSavedProfiles,
  type SavedProfile,
} from "../lib/persistence";

interface SavedProfilesPopoverProps {
  open: boolean;
  onClose: () => void;
  /** Open the builder for a username (switches to that saved draft). */
  onOpenProfile: (username: string) => void;
  /** Bumped by the parent to force a re-read of the list (e.g. after delete). */
  refreshKey: number;
  /** Ask the parent to re-read the list. */
  onChanged: () => void;
}

/** Relative time like "2h ago", "just now". */
function relativeTime(ms: number): string {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

/**
 * Floating "Saved Profiles" card anchored to the rail item. Lists every
 * per-username saved draft (most recent first); clicking one opens its draft in
 * the builder, and each row can be deleted. Only per-username drafts appear
 * here, so it is most useful with the "Draft per username" preference on.
 * Closes on Escape or a click outside the [data-rc-saved] wrapper.
 */
export function SavedProfilesPopover({
  open,
  onClose,
  onOpenProfile,
  refreshKey,
  onChanged,
}: SavedProfilesPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // The popover only mounts while open, so it's safe to read the saved list
  // during render. `refreshKey` changing (e.g. after a delete) re-renders and
  // re-reads. Reference it so the intent is explicit to readers and linters.
  void refreshKey;
  const profiles: SavedProfile[] = open ? listSavedProfiles() : [];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-rc-saved]")) return;
      if (cardRef.current && !cardRef.current.contains(target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(
      () => window.addEventListener("mousedown", onDown),
      0
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-label="Saved profiles"
      className="rc-elevated rc-fade-in absolute left-full top-0 z-50 ml-2 max-h-[70vh] w-72 origin-top-left overflow-hidden border border-outline-variant/70 bg-surface-container-low"
    >
      <header className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
        <Icon name="folder_open" size={16} className="text-primary-container" />
        <span className="text-label-lg font-semibold text-on-surface">
          Saved Profiles
        </span>
      </header>

      {profiles.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-body-sm text-on-surface-variant">
            No saved profiles yet.
          </p>
          <p className="mt-1 text-body-sm text-on-surface-variant/80">
            Turn on “Draft per username” in Preferences, then each username you
            edit is saved here.
          </p>
        </div>
      ) : (
        <ul className="max-h-[calc(70vh-3rem)] overflow-y-auto py-1">
          {profiles.map((p) => (
            <li key={p.username}>
              <div className="group flex items-center gap-2 px-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile(p.username);
                    onClose();
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left",
                    "transition-colors hover:bg-surface-container"
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary-container">
                    <Icon name="person" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label-md text-on-surface">
                      {p.fullName}
                    </span>
                    <span className="block truncate text-body-sm text-on-surface-variant">
                      @{p.username}
                      {p.savedAt ? ` · ${relativeTime(p.savedAt)}` : ""}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete saved draft for ${p.username}`}
                  title="Delete"
                  onClick={() => {
                    deleteSavedProfile(p.username);
                    onChanged();
                  }}
                  className="shrink-0 rounded p-1.5 text-on-surface-variant opacity-0 transition-opacity hover:bg-surface-container hover:text-on-surface focus:opacity-100 group-hover:opacity-100"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
