import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";

interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "edit_document". */
  name: string;
  /** Pixel size. */
  size?: number;
  filled?: boolean;
  weight?: number;
  className?: string;
}

/** Material Symbols Outlined icon. */
export function Icon({
  name,
  size = 18,
  filled = false,
  weight = 400,
  className,
}: IconProps) {
  const style: CSSProperties = {
    fontSize: size,
    fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" ${size}`,
  };
  return (
    <span
      aria-hidden
      className={cn("material-symbols-outlined select-none", className)}
      style={style}
    >
      {name}
    </span>
  );
}
