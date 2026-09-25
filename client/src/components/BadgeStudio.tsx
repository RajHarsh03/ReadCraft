import { useMemo, useState } from "react";
import { Icon } from "./ui/Icon";
import { copyText } from "../lib/export";
import { useToast } from "./ui/Toast";
import {
  BADGE_PRESETS,
  BADGE_STYLES,
  badgeImageUrl,
  badgeMarkdown,
  type BadgeSpec,
} from "../lib/badges";

const DEFAULT_SPEC: BadgeSpec = {
  label: "label",
  message: "message",
  color: "2ea043",
  style: "for-the-badge",
  logo: "",
  link: "",
};

const inputClass =
  "w-full rounded-[6px] border border-outline-variant bg-surface-container px-2.5 py-1.5 " +
  "text-code-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus-visible:outline-none";

const labelClass = "text-label-sm text-on-surface-variant";

interface BadgeStudioProps {
  /** When provided, shows an "Add to README" action wired to this handler. */
  onAdd?: (spec: BadgeSpec) => void;
}

/**
 * Interactive Shields.io badge builder: edit fields, see a live preview and the
 * generated Markdown, copy it, or (optionally) add it to the README.
 */
export function BadgeStudio({ onAdd }: BadgeStudioProps) {
  const toast = useToast();
  const [spec, setSpec] = useState<BadgeSpec>(DEFAULT_SPEC);

  const set = (patch: Partial<BadgeSpec>) =>
    setSpec((s) => ({ ...s, ...patch }));

  const imageUrl = useMemo(() => badgeImageUrl(spec), [spec]);
  const markdown = useMemo(() => badgeMarkdown(spec), [spec]);

  const copy = async () => {
    const ok = await copyText(markdown);
    toast[ok ? "success" : "error"](
      ok
        ? "Badge Markdown copied."
        : "Couldn't copy - select and copy manually."
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Template selector - Full screen width, outside columns */}
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Quick start</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BADGE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setSpec({ logo: "", link: "", ...preset.spec })}
              className="shrink-0 rounded-[6px] border border-outline-variant bg-surface-container px-3 py-2 text-label-sm text-on-surface transition-colors hover:border-primary-container hover:bg-surface-container-high"
              title={preset.name}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two column layout for fields and preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: Fields + Actions */}
        <div className="flex flex-col gap-5">
          {/* Fields */}
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Label (left)">
              <input
                className={inputClass}
                value={spec.label}
                onChange={(e) => set({ label: e.target.value })}
                placeholder="build"
              />
            </Field>
            <Field label="Message (right)">
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={spec.message}
                  onChange={(e) => set({ message: e.target.value })}
                  placeholder="passing"
                  disabled={!spec.message?.trim()}
                />
                <input
                  type="checkbox"
                  id="use-message"
                  checked={Boolean(spec.message?.trim())}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      set({ message: "" });
                    } else {
                      set({ message: "message" });
                    }
                  }}
                  className="h-5 w-5 shrink-0 cursor-pointer rounded border-outline-variant accent-primary-container"
                  title="Show message segment"
                />
              </div>
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={spec.color}
                  onChange={(e) => set({ color: e.target.value })}
                  placeholder="2ea043 or green"
                />
                <input
                  type="color"
                  aria-label="Pick color"
                  value={
                    /^#?[0-9a-f]{6}$/i.test(spec.color)
                      ? `#${spec.color.replace(/^#/, "")}`
                      : "#2ea043"
                  }
                  onChange={(e) => set({ color: e.target.value.replace(/^#/, "") })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-[6px] border border-outline-variant bg-surface-container p-1"
                />
              </div>
            </Field>
            <Field label="Style">
              <select
                className={inputClass}
                value={spec.style}
                onChange={(e) =>
                  set({ style: e.target.value as BadgeSpec["style"] })
                }
              >
                {BADGE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Logo (optional)">
              <input
                className={inputClass}
                value={spec.logo ?? ""}
                onChange={(e) => set({ logo: e.target.value })}
                placeholder="github"
              />
            </Field>
            <Field label="Link (optional)">
              <input
                className={inputClass}
                value={spec.link ?? ""}
                onChange={(e) => set({ link: e.target.value })}
                placeholder="https://github.com/you"
              />
            </Field>
          </div>

          {/* Actions - Copy Markdown only */}
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-outline-variant bg-surface-container px-4 py-3 text-label-lg text-on-surface transition-colors hover:border-border-strong hover:bg-surface-container-high"
          >
            <Icon name="content_copy" size={18} /> Copy Markdown
          </button>
        </div>

        {/* RIGHT: Preview + Markdown */}
        <div className="flex flex-col gap-5">
          {/* Live preview */}
          <div className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>Preview</span>
            <div className="flex flex-1 items-center justify-center rounded-[8px] border border-outline-variant bg-surface-container p-6">
              <img
                src={imageUrl}
                alt="Badge preview"
                className="max-w-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                }}
              />
            </div>
          </div>

          {/* Markdown output */}
          <div className="flex flex-col gap-1">
            <span className={labelClass}>Markdown</span>
            <pre className="overflow-x-auto rounded-[6px] border border-outline-variant bg-surface-container p-3 text-code-sm text-on-surface">
              {markdown}
            </pre>
          </div>

          {/* Add to README button - Below Markdown */}
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(spec)}
              className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-primary-container px-4 py-3 text-label-lg font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
            >
              <Icon name="add" size={18} /> Add to README
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
