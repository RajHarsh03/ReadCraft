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
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {BADGE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => setSpec({ logo: "", link: "", ...preset.spec })}
            className="rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-label-sm text-on-surface-variant transition-colors hover:border-border-strong hover:text-on-surface"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className="flex items-center justify-center rounded-[8px] border border-outline-variant bg-surface-container-lowest p-6">
        <img
          src={imageUrl}
          alt="Badge preview"
          className="max-w-full"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
          }}
        />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Label (left)">
          <input
            className={inputClass}
            value={spec.label}
            onChange={(e) => set({ label: e.target.value })}
            placeholder="build"
          />
        </Field>
        <Field label="Message (right)">
          <input
            className={inputClass}
            value={spec.message}
            onChange={(e) => set({ message: e.target.value })}
            placeholder="passing"
          />
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
              className="h-9 w-9 shrink-0 cursor-pointer rounded-[6px] border border-outline-variant bg-surface-container-lowest p-1"
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
        <Field label="Logo (simple-icons slug, optional)">
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

      {/* Markdown output */}
      <div>
        <p className={`mb-1 ${labelClass}`}>Markdown</p>
        <pre className="overflow-x-auto rounded-[6px] border border-outline-variant bg-surface-container-lowest p-3 text-code-sm text-on-surface">
          {markdown}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-[6px] border border-outline-variant bg-surface-container px-3 py-2 text-label-md text-on-surface transition-colors hover:border-border-strong hover:bg-surface-container-high"
        >
          <Icon name="content_copy" size={15} /> Copy Markdown
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(spec)}
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary-container px-3 py-2 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
          >
            <Icon name="add" size={15} /> Add to README
          </button>
        )}
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
