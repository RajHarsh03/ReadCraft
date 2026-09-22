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
    <div className="group rounded-[8px] border border-outline-variant bg-surface-container/95 p-4 shadow-[0_12px_28px_-22px_rgb(0_0_0_/_0.9)] transition-all hover:-translate-y-px hover:border-border-strong hover:bg-surface-container-high/85">
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2.5">
            <Icon
              name={icon}
              size={18}
              className="text-on-surface-variant transition-colors group-hover:text-primary-container"
            />
            <div className="flex flex-col">
              <span className="text-headline-sm text-on-surface">{title}</span>
              <span className="text-body-sm text-on-surface-variant">
                {description}
              </span>
            </div>
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

      {open && <div className="mt-3 flex flex-col gap-2 border-t border-outline-variant/70 pt-3">{children}</div>}
    </div>
  );
}
