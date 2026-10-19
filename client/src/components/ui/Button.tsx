import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";

// Every control carries a 2px ink border + a hard 4px offset shadow, and uses
// the press mechanic (hover lift, active sink). Primary = vermilion fill;
// secondary = paper fill; ghost = borderless, for low-emphasis actions.
const VARIANTS: Record<Variant, string> = {
  primary:
    "nb-press border-2 border-ink rounded-[4px] bg-primary-container text-on-primary-container shadow-[4px_4px_0_0_var(--color-ink)] font-bold uppercase tracking-wider hover:bg-primary-fixed-dim",
  secondary:
    "nb-press border-2 border-ink rounded-[4px] bg-surface-container-lowest text-on-surface shadow-[4px_4px_0_0_var(--color-ink)] font-bold uppercase tracking-wider hover:bg-surface-container",
  ghost:
    "border-2 border-transparent rounded-[4px] bg-transparent text-on-surface-variant font-bold uppercase tracking-wider transition-colors hover:bg-surface-container hover:text-on-surface",
};

type Size = "sm" | "md";

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-[11px]",
  md: "h-9 gap-2 px-4 text-label-md",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Material Symbols icon name shown before the label. */
  icon?: string;
  iconFilled?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconFilled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-mono",
        "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {icon && (
        <Icon name={icon} size={size === "sm" ? 15 : 16} filled={iconFilled} />
      )}
      {children}
    </button>
  );
}
