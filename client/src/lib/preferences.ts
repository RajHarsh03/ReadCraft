/**
 * User preferences, persisted to localStorage independently of the profile
 * draft. Reads are defensive: an unknown or partial payload is coerced back to
 * complete defaults so a bad entry can never break startup. Writes fail
 * silently when storage is unavailable (private mode, quota).
 */

/** Which tab the preview panel opens on. */
export type PreviewTab = "preview" | "markdown";

export interface Preferences {
  /** Tab the preview panel shows first when the builder opens. */
  defaultPreviewTab: PreviewTab;
  /**
   * When true, each GitHub username keeps its own saved draft, so switching
   * users (and switching back) preserves each one. When false, there is a
   * single shared draft that follows whichever user is being edited.
   */
  perUsernameDrafts: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultPreviewTab: "preview",
  perUsernameDrafts: false,
};

const STORAGE_KEY = "readcraft:prefs";

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Coerce arbitrary parsed data into a complete Preferences over defaults. */
export function coercePreferences(raw: unknown): Preferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFERENCES };
  const r = raw as Partial<Preferences>;
  const pick = <T extends string>(
    value: unknown,
    allowed: readonly T[],
    fallback: T
  ): T => (allowed.includes(value as T) ? (value as T) : fallback);
  return {
    defaultPreviewTab: pick(
      r.defaultPreviewTab,
      ["preview", "markdown"] as const,
      DEFAULT_PREFERENCES.defaultPreviewTab
    ),
    perUsernameDrafts:
      typeof r.perUsernameDrafts === "boolean"
        ? r.perUsernameDrafts
        : DEFAULT_PREFERENCES.perUsernameDrafts,
  };
}

/** Load saved preferences, or complete defaults when none/invalid. */
export function loadPreferences(): Preferences {
  if (!hasStorage()) return { ...DEFAULT_PREFERENCES };
  try {
    const rawText = window.localStorage.getItem(STORAGE_KEY);
    if (!rawText) return { ...DEFAULT_PREFERENCES };
    return coercePreferences(JSON.parse(rawText));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/** Persist preferences. Fails silently when storage is unavailable. */
export function savePreferences(prefs: Preferences): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export const PREFERENCES_INTERNALS = { STORAGE_KEY, coercePreferences };
