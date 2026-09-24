import { useEffect, useRef } from "react";
import { Icon } from "./ui/Icon";
import { cn } from "../lib/cn";
import { usePreferences } from "../preferences-store";

interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A floating preferences card (Vercel-style popover) anchored to the rail's
 * Preferences button. Each row shows a label on the left and its control on the
 * right. Changes apply and persist immediately - there is no Save step. Closes
 * on Escape or a click outside.
 *
 * The parent must position this: it renders as an absolutely-positioned card,
 * so wrap it in a `relative` container placed where you want it anchored.
 */
export function PreferencesDialog({ open, onClose }: PreferencesDialogProps) {
  const { prefs, update, reset } = usePreferences();
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a click/tap outside the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // Ignore clicks inside the card and on the trigger (both live in the
      // [data-rc-prefs] wrapper). Without this, clicking the button while open
      // would close via this handler and then the button's own onClick would
      // toggle it right back open.
      if (target?.closest("[data-rc-prefs]")) return;
      if (cardRef.current && !cardRef.current.contains(target)) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    // Defer so the opening click doesn't immediately close it.
    const id = window.setTimeout(
      () => window.addEventListener("mousedown", onDown),
      0
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-label="Preferences"
      className="rc-elevated rc-fade-in absolute bottom-full left-2 z-50 mb-2 w-72 origin-bottom-left overflow-hidden border border-border-strong bg-surface-container-lowest"
    >
      <header className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
        <Icon name="tune" size={16} className="text-primary-container" />
        <span className="text-label-lg font-semibold text-on-surface">
          Preferences
        </span>
      </header>

      <div className="py-1">
        {/* Default preview tab */}
        <Row label="Default preview tab">
          <Segmented
            value={prefs.defaultPreviewTab}
            options={[
              { value: "preview", label: "Preview", icon: "visibility" },
              { value: "markdown", label: "Markdown", icon: "code" },
            ]}
            onChange={(value) =>
              update({
                defaultPreviewTab: value as typeof prefs.defaultPreviewTab,
              })
            }
          />
        </Row>

        {/* Per-username drafts */}
        <Row
          label="Draft per username"
          hint="Keep a separate saved draft for each user."
        >
          <Switch
            checked={prefs.perUsernameDrafts}
            onChange={(value) => update({ perUsernameDrafts: value })}
            label="Keep a draft per username"
          />
        </Row>
      </div>

      <footer className="border-t border-outline-variant px-2 py-1">
        <button
          type="button"
          onClick={reset}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="restart_alt" size={16} />
          Reset to defaults
        </button>
      </footer>
    </div>
  );
}

/** A single settings row: label (+ optional hint) on the left, control right. */
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-label-md text-on-surface">{label}</p>
        {hint && (
          <p className="mt-0.5 text-body-sm leading-snug text-on-surface-variant">
            {hint}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface SegmentedOption {
  value: string;
  label: string;
  icon: string;
}

/** Compact icon segmented control (Vercel-style, tucked to the right). */
function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 border border-outline-variant bg-surface-container-low p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center transition-colors",
              active
                ? "bg-surface-container-high text-primary-container"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Icon name={opt.icon} size={15} />
          </button>
        );
      })}
    </div>
  );
}

/** Vercel-style pill switch. */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150",
        checked ? "bg-primary-container" : "bg-surface-container-highest"
      )}
    >
      <span
        className={cn(
          "absolute h-3.5 w-3.5 rounded-full bg-surface-container-lowest shadow transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
