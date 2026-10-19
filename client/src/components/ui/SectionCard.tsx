import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";
import { Toggle } from "./Toggle";

interface SectionCardProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** When provided, renders an enable/disable toggle in the header. */
  enabled?: boolean;
  onToggle?: (value: boolean) => void;
}

/**
 * A collapsible section card matching the reference "Document Sections"
 * accordion: icon + title + description on the left, optional toggle and a
 * rotating chevron on the right.
 */
export function SectionCard({
  icon,
  title,
  description,
  children,
  defaultOpen = false,
  enabled,
  onToggle,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="group border-2 border-ink rounded-[4px] bg-surface-container-lowest shadow-[4px_4px_0_0_var(--color-ink)] transition-colors hover:shadow-[6px_6px_0_0_var(--color-ink)]">
      <div className="flex w-full items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink rounded-[4px] bg-surface-container-low text-on-surface-variant transition-colors group-hover:text-primary-container">
            <Icon name={icon} size={18} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-headline-sm text-on-surface">{title}</span>
            <span className="truncate text-body-sm text-on-surface-variant">
              {description}
            </span>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          {onToggle && (
            <Toggle
              checked={enabled ?? false}
              onChange={onToggle}
              label={`Enable ${title}`}
            />
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="nb-border nb-press-sm flex h-8 w-8 items-center justify-center rounded-[4px] bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
            aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
            aria-expanded={open}
          >
            <Icon
              name="expand_more"
              size={16}
              className={cn(
                "text-on-surface-variant transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-2 border-t-2 border-ink px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
