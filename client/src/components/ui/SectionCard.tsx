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
    <div className="group border border-outline-variant/70 bg-surface-container-low transition-colors hover:border-border-strong">
      <div className="flex w-full items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-outline-variant/70 text-on-surface-variant transition-colors group-hover:border-primary-container/60 group-hover:text-primary">
            <Icon name={icon} size={17} />
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
            className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
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
        <div className="flex flex-col gap-2 border-t border-outline-variant/70 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
