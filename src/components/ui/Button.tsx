import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary-container text-on-primary-container font-semibold hover:bg-primary-fixed-dim shadow-sm",
  secondary:
    "bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container hover:border-border-strong",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Material Symbols icon name shown before the label. */
  icon?: string;
  iconFilled?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "secondary",
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
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-[6px] px-4 text-label-md whitespace-nowrap",
        "transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} filled={iconFilled} />}
      {children}
    </button>
  );
}
