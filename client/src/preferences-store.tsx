import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./lib/preferences";

interface PreferencesApi {
  prefs: Preferences;
  /** Merge a partial update into the current preferences and persist it. */
  update: (patch: Partial<Preferences>) => void;
  /** Restore all preferences to their defaults. */
  reset: () => void;
}

const PreferencesContext = createContext<PreferencesApi | null>(null);

/**
 * Holds user preferences (default preview tab, preview theme, per-username
 * drafts) and persists them to localStorage. Lives above the router so every
 * screen and the profile store can read the same values.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = { ...DEFAULT_PREFERENCES };
    savePreferences(next);
    setPrefs(next);
  }, []);

  const api = useMemo<PreferencesApi>(
    () => ({ prefs, update, reset }),
    [prefs, update, reset]
  );

  return (
    <PreferencesContext.Provider value={api}>
      {children}
    </PreferencesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences(): PreferencesApi {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return ctx;
}
