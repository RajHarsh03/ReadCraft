/** Join conditional class names. Small on purpose - no dependency needed. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
