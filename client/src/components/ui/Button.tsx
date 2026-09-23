import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary-container text-on-primary-container font-semibold hover:-translate-y-px hover:bg-primary-fixed-dim shadow-[0_10px_22px_-12px_rgb(247_167_24_/_0.85)]",
  secondary:
    "bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container hover:border-border-strong",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
};

type Size = "sm" | "md";

const SIZES: Record<Size, string> = {
  sm: "h-7 gap-1 rounded-[5px] px-2.5 text-code-sm",
  md: "h-8 gap-1.5 rounded-[6px] px-4 text-label-md",
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
        "inline-flex items-center justify-center whitespace-nowrap",
        "transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {icon && (
        <Icon name={icon} size={size === "sm" ? 14 : 16} filled={iconFilled} />
      )}
      {children}
    </button>
  );
}
