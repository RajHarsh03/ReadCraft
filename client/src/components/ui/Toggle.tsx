import { cn } from "../../lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Stops click from bubbling to a parent summary/row. */
  stopPropagation?: boolean;
}

/** Brutalist switch: a 2px ink-outlined track whose fill signals the state. */
export function Toggle({
  checked,
  onChange,
  label,
  stopPropagation = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-ink transition-colors duration-150",
        checked ? "bg-primary-container" : "bg-surface-container-highest"
      )}
    >
      <span
        className={cn(
          "absolute h-3 w-3 rounded-full border border-ink bg-surface-container-lowest transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}
