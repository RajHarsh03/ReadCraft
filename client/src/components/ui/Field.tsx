import { useId } from "react";
import { cn } from "../../lib/cn";

// §6.7: full-width inputs carry a 2px ink border and a hard offset shadow on
// focus (the border + shadow do the focus work; no default ring).
const inputBase =
  "w-full rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-2 text-on-surface " +
  "placeholder:text-outline focus:shadow-[3px_3px_0_0_var(--color-ink)] focus:outline-none";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Render the value in monospace (for handles, code-ish content). */
  mono?: boolean;
  /** Optional left adornment, e.g. "@". */
  prefix?: string;
  /** Inline validation message; when set, the field shows an error state. */
  error?: string | null;
}

const errorRing = "border-error focus:shadow-[3px_3px_0_0_var(--color-error)]";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
  prefix,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      {prefix ? (
        <div
          className={cn(
            "flex items-center rounded-[4px] border-2 border-ink bg-surface-container-lowest px-3 py-2 focus-within:shadow-[3px_3px_0_0_var(--color-ink)]",
            invalid && errorRing
          )}
        >
          <span className="font-mono text-code-sm text-on-surface-variant" aria-hidden>
            {prefix}
          </span>
          <input
            id={id}
            className="ml-1 w-full bg-transparent text-code-sm text-on-surface focus:outline-none"
            value={value}
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <input
          id={id}
          className={cn(
            inputBase,
            mono ? "text-code-sm" : "text-body-md",
            invalid && errorRing
          )}
          value={value}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && (
        <span id={errorId} className="text-body-sm text-error">
          {error}
        </span>
      )}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextField({
  label,
  value,
  onChange,
  rows = 2,
  placeholder,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-label-sm font-bold uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={cn(inputBase, "resize-none text-body-md")}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** A row-styled toggle with title + description (GitHub Metrics switches). */
export function ToggleRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-[4px] border-2 border-ink bg-surface-container-lowest p-2.5">
      <div className="flex flex-col">
        <span className="text-body-md font-semibold text-on-surface">
          {title}
        </span>
        <span className="text-body-sm text-on-surface-variant">
          {description}
        </span>
      </div>
      {children}
    </div>
  );
}
