import { cn } from "../../lib/cn";

const inputBase =
  "w-full rounded-[6px] bg-surface-container-lowest px-2.5 py-1.5 text-on-surface " +
  "placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Render the value in monospace (for handles, code-ish content). */
  mono?: boolean;
  /** Optional left adornment, e.g. "@". */
  prefix?: string;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
  prefix,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-label-sm text-on-surface-variant">{label}</label>
      {prefix ? (
        <div className="flex items-center rounded-[6px] bg-surface-container-lowest px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-primary-container">
          <span className="text-code-sm text-on-surface-variant">{prefix}</span>
          <input
            className="ml-1 w-full bg-transparent text-code-sm text-on-surface focus:outline-none"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <input
          className={cn(inputBase, mono ? "text-code-sm" : "text-body-md")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
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
  return (
    <div className="flex flex-col gap-1">
      <label className="text-label-sm text-on-surface-variant">{label}</label>
      <textarea
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
    <div className="flex items-center justify-between rounded-[6px] bg-surface-container-lowest p-2">
      <div className="flex flex-col">
        <span className="text-body-md font-medium text-on-surface">{title}</span>
        <span className="text-body-sm text-on-surface-variant">{description}</span>
      </div>
      {children}
    </div>
  );
}
