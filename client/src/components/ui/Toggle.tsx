import { cn } from "../../lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Stops click from bubbling to a parent summary/row. */
  stopPropagation?: boolean;
}

/** Linear-style 28×16 switch with a 12px thumb sliding 12px. */
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
        "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-150",
        checked ? "bg-primary-container" : "bg-surface-container-highest"
      )}
    >
      <span
        className={cn(
          "absolute h-3 w-3 rounded-full bg-surface-container-lowest transition-transform duration-150",
          checked ? "translate-x-[14px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}
