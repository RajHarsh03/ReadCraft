/**
 * Light/dark theme control for the neo-brutalist design system. The design
 * defaults to light; dark is a class-based override on <html>. The pre-paint
 * script in index.html reads the same key so the first frame never flashes.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "readcraft:theme";

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** The persisted theme, defaulting to light when unset/unavailable. */
export function loadTheme(): Theme {
  if (!hasStorage()) return "light";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/** Flip the `.dark` class on <html> so every token override applies. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Persist the choice. Fails silently when storage is unavailable. */
export function saveTheme(theme: Theme): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
