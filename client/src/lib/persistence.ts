import type { ProfileState, SectionId, TemplateStyle } from "../types";
import { SECTION_IDS } from "../types";

/** Coerce a stored template style to valid enum values over `defaults`. */
function coerceTemplateStyle(
  raw: unknown,
  defaults: TemplateStyle
): TemplateStyle {
  if (!raw || typeof raw !== "object") return { ...defaults };
  const r = raw as Partial<TemplateStyle>;
  const pick = <T extends string>(
    value: unknown,
    allowed: readonly T[],
    fallback: T
  ): T => (allowed.includes(value as T) ? (value as T) : fallback);
  const accent =
    typeof r.accent === "string" && /^[0-9a-fA-F]{6}$/.test(r.accent)
      ? r.accent
      : defaults.accent;
  return {
    headingStyle: pick(
      r.headingStyle,
      ["plain", "centered", "banner"] as const,
      defaults.headingStyle
    ),
    align: pick(r.align, ["left", "center"] as const, defaults.align),
    techStyle: pick(
      r.techStyle,
      ["code", "badges"] as const,
      defaults.techStyle
    ),
    accent,
    divider: pick(r.divider, ["line", "blank"] as const, defaults.divider),
  };
}

/**
 * Local draft persistence.
 *
 * Drafts are stored in localStorage under a versioned key. Reads are defensive:
 * a corrupt, partial, or older payload is coerced back into a complete
 * ProfileState (merged over the caller's defaults) rather than throwing, so a
 * bad entry can never break app startup. Writes fail silently when storage is
 * unavailable (private mode, quota) - the in-memory draft keeps working.
 */

const STORAGE_KEY = "readcraft:draft";

/**
 * Resolve the storage key for a draft. With `perUsername` on, each username
 * gets its own namespaced key so switching users preserves each draft; with it
 * off, a single shared key is used (the default). An empty/blank username also
 * falls back to the shared key.
 */
function draftKey(username?: string, perUsername?: boolean): string {
  const user = username?.trim().toLowerCase();
  if (perUsername && user) return `${STORAGE_KEY}:${user}`;
  return STORAGE_KEY;
}

/**
 * Draft schema version. Bump when the on-disk shape changes in a way that
 * needs migration; `coerceState` keeps older/partial payloads loadable.
 */
export const SCHEMA_VERSION = 1;

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
export function coerceState(
  raw: unknown,
  defaults: ProfileState
): ProfileState {
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
    // Insert any section missing from an older draft at its canonical position
    // (from SECTION_IDS) rather than blindly at the end, so newly-added
    // sections land where they belong.
    for (let i = 0; i < SECTION_IDS.length; i += 1) {
      const id = SECTION_IDS[i]!;
      if (seen.has(id)) continue;
      const insertAt = cleaned.findIndex(
        (existing) => SECTION_IDS.indexOf(existing) > i
      );
      if (insertAt === -1) cleaned.push(id);
      else cleaned.splice(insertAt, 0, id);
      seen.add(id);
    }
    order = cleaned;
  }

  return {
    basics: { ...defaults.basics, ...(r.basics ?? {}) },
    headline: { ...defaults.headline, ...(r.headline ?? {}) },
    focus: { ...defaults.focus, ...(r.focus ?? {}) },
    metrics: { ...defaults.metrics, ...(r.metrics ?? {}) },
    tech: Array.isArray(r.tech) ? r.tech : defaults.tech,
    social: Array.isArray(r.social) ? r.social : defaults.social,
    pinned: Array.isArray(r.pinned) ? r.pinned : defaults.pinned,
    enabled,
    order,
    templateStyle: coerceTemplateStyle(r.templateStyle, defaults.templateStyle),
  };
}

export interface LoadedDraft {
  state: ProfileState;
  savedAt: number;
}

/** Options controlling which draft slot is read/written. */
export interface DraftScope {
  /** Username the draft belongs to (used only when `perUsername` is on). */
  username?: string;
  /** When true, use a per-username storage slot. */
  perUsername?: boolean;
}

/** Load and validate the saved draft, or null when none/invalid. */
export function loadDraft(
  defaults: ProfileState,
  scope: DraftScope = {}
): LoadedDraft | null {
  if (!hasStorage()) return null;
  let rawText: string | null;
  try {
    rawText = window.localStorage.getItem(
      draftKey(scope.username, scope.perUsername)
    );
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
export function saveDraft(
  state: ProfileState,
  scope: DraftScope = {}
): SaveResult {
  if (!hasStorage()) return "unavailable";
  const payload: StoredDraft = {
    version: SCHEMA_VERSION,
    savedAt: Date.now(),
    state,
  };
  try {
    window.localStorage.setItem(
      draftKey(scope.username, scope.perUsername),
      JSON.stringify(payload)
    );
    return "saved";
  } catch {
    return "error";
  }
}

/** Remove the saved draft for the given scope. */
export function clearDraft(scope: DraftScope = {}): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(draftKey(scope.username, scope.perUsername));
  } catch {
    // ignore
  }
}

export const PERSISTENCE_INTERNALS = {
  STORAGE_KEY,
  SCHEMA_VERSION,
  coerceState,
};
