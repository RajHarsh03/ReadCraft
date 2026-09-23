import type { ProfileState } from "../types";
import { SCHEMA_VERSION, coerceState } from "./persistence";

/**
 * Portable draft files.
 *
 * A ReadCraft draft can be exported to a self-describing JSON file and later
 * re-imported (on another machine, or after clearing local storage). The file
 * carries the schema version so imports of older payloads still load: parsing
 * runs the same defensive `coerceState` pass used for local drafts, repairing
 * partial or slightly-stale data instead of rejecting it.
 */

/** The shape written to and read from an exported `.json` draft file. */
export interface DraftFile {
  /** Marker so a stray JSON file isn't mistaken for a ReadCraft draft. */
  kind: "readcraft-draft";
  version: number;
  exportedAt: string;
  state: ProfileState;
}

/** Serialize the current document to pretty-printed draft-file JSON. */
export function exportDraftJson(state: ProfileState): string {
  const file: DraftFile = {
    kind: "readcraft-draft",
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(file, null, 2);
}

export interface ParsedImport {
  state: ProfileState;
  /** True when the file version differed from the current schema version. */
  migrated: boolean;
}

/**
 * Parse imported JSON text into a complete ProfileState.
 *
 * Throws a descriptive Error when the text isn't a recognizable ReadCraft
 * draft. Otherwise the payload is coerced over `defaults`, so missing or
 * malformed fields are filled in rather than causing a failure.
 */
export function parseImportedDraft(
  text: string,
  defaults: ProfileState
): ParsedImport {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (!raw || typeof raw !== "object") {
    throw new Error("That file isn't a ReadCraft draft.");
  }

  const file = raw as Partial<DraftFile>;

  // Accept files we clearly wrote (kind marker) as well as bare state objects
  // for resilience, but reject anything that has neither shape.
  const looksLikeDraftFile = file.kind === "readcraft-draft" && file.state;
  const looksLikeBareState =
    !file.kind &&
    typeof raw === "object" &&
    "basics" in (raw as Record<string, unknown>);

  if (!looksLikeDraftFile && !looksLikeBareState) {
    throw new Error("That file isn't a ReadCraft draft.");
  }

  const stateSource = looksLikeDraftFile ? file.state : raw;
  const version =
    typeof file.version === "number" ? file.version : SCHEMA_VERSION;

  return {
    state: coerceState(stateSource, defaults),
    migrated: version !== SCHEMA_VERSION,
  };
}
