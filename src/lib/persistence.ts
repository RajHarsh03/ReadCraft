import type { ProfileState, SectionId } from "../types";
import { SECTION_IDS } from "../types";

/**
 * Local draft persistence.
 *
 * Drafts are stored in localStorage under a versioned key. Reads are defensive:
 * a corrupt, partial, or older payload is coerced back into a complete
 * ProfileState (merged over the caller's defaults) rather than throwing, so a
 * bad entry can never break app startup. Writes fail silently when storage is
 * unavailable (private mode, quota) — the in-memory draft keeps working.
 */

const STORAGE_KEY = "readcraft:draft";
const SCHEMA_VERSION = 1;

interface StoredDraft {
  version: number;
  savedAt: number;
  state: ProfileState;
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Coerce arbitrary parsed data into a complete ProfileState over `defaults`. */
function coerceState(raw: unknown, defaults: ProfileState): ProfileState {
  if (!raw || typeof raw !== "object") return defaults;
  const r = raw as Partial<ProfileState>;

  // enabled: keep only known section ids, fall back to default per id.
  const enabled = { ...defaults.enabled };
  if (r.enabled && typeof r.enabled === "object") {
    for (const id of SECTION_IDS) {
      const v = (r.enabled as Record<string, unknown>)[id];
      if (typeof v === "boolean") enabled[id] = v;
    }
  }

  // order: keep valid known ids, then append any missing ones so it stays complete.
  let order: SectionId[] = [...defaults.order];
  if (Array.isArray(r.order)) {
    const seen = new Set<SectionId>();
    const cleaned = r.order.filter(
      (id): id is SectionId =>
        SECTION_IDS.includes(id as SectionId) &&
        !seen.has(id as SectionId) &&
        (seen.add(id as SectionId), true)
    );
    for (const id of SECTION_IDS) if (!seen.has(id)) cleaned.push(id);
    order = cleaned;
  }

  return {
    basics: { ...defaults.basics, ...(r.basics ?? {}) },
    headline: { ...defaults.headline, ...(r.headline ?? {}) },
    focus: { ...defaults.focus, ...(r.focus ?? {}) },
    metrics: { ...defaults.metrics, ...(r.metrics ?? {}) },
    tech: Array.isArray(r.tech) ? r.tech : defaults.tech,
    pinned: Array.isArray(r.pinned) ? r.pinned : defaults.pinned,
    enabled,
    order,
  };
}

export interface LoadedDraft {
  state: ProfileState;
  savedAt: number;
}

/** Load and validate the saved draft, or null when none/invalid. */
export function loadDraft(defaults: ProfileState): LoadedDraft | null {
  if (!hasStorage()) return null;
  let rawText: string | null;
  try {
    rawText = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!rawText) return null;

  try {
    const parsed = JSON.parse(rawText) as Partial<StoredDraft>;
    if (!parsed || parsed.version !== SCHEMA_VERSION) return null;
    return {
      state: coerceState(parsed.state, defaults),
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return null;
  }
}

export type SaveResult = "saved" | "unavailable" | "error";

/** Persist the draft. Returns a result so callers can surface feedback. */
export function saveDraft(state: ProfileState): SaveResult {
  if (!hasStorage()) return "unavailable";
  const payload: StoredDraft = {
    version: SCHEMA_VERSION,
    savedAt: Date.now(),
    state,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return "saved";
  } catch {
    return "error";
  }
}

/** Remove any saved draft. */
export function clearDraft(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const PERSISTENCE_INTERNALS = { STORAGE_KEY, SCHEMA_VERSION, coerceState };
