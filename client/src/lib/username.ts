/**
 * GitHub username helpers.
 *
 * GitHub usernames may contain alphanumerics and single hyphens, cannot begin
 * or end with a hyphen, and are limited to 39 characters. We normalize input
 * (trim + strip a leading "@") before validating, calling the API, or building
 * URLs, so the rest of the app only ever deals with a clean handle.
 */

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Trim surrounding whitespace and remove a leading "@". */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

/** True when the normalized value is a valid GitHub username. */
export function isValidUsername(raw: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(raw));
}

/**
 * Validation message for the editor field. Returns null when the value is
 * empty (nothing to complain about yet) or valid.
 */
export function usernameError(raw: string): string | null {
  const value = normalizeUsername(raw);
  if (!value) return null;
  if (value.length > 39) return "GitHub usernames are at most 39 characters.";
  if (!isValidUsername(value)) {
    return "Use letters, numbers, and single hyphens (no leading or trailing hyphen).";
  }
  return null;
}

/** Normalized, URL-encoded username safe to interpolate into a URL. */
export function encodeUsername(raw: string): string {
  return encodeURIComponent(normalizeUsername(raw));
}
