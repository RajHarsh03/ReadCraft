import { useEffect, useState } from "react";
import { applyTheme, loadTheme, saveTheme, type Theme } from "../../lib/theme";
import { Icon } from "./Icon";
import { cn } from "../../lib/cn";

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

/**
 * Light/dark switch. Flips the `.dark` class on <html>, persists the choice,
 * and syncs with whatever the pre-paint script already applied on load.
 */
export function ThemeToggle({ className, size = 16 }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  // Reconcile the DOM class with the stored theme on mount (the head script
  // may already have set it, but keep React as the source of truth).
  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={cn(
        "nb-border nb-press-sm inline-flex h-8 w-8 items-center justify-center",
        "bg-surface-container-lowest text-on-surface",
        className
      )}
    >
      <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size={size} />
    </button>
  );
}
