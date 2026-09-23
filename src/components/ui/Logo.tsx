interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * The ReadCraft mark: an amber Satisfy-script "#", slightly tilted with a soft
 * glow. No tile or background — the glyph stands on its own and sits snugly
 * next to the wordmark.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        fontFamily: "'Satisfy', cursive",
        fontSize: size,
        lineHeight: 1,
        color: "#f7a718",
        transform: "rotate(-10deg)",
        textShadow: "0 2px 10px rgb(247 167 24 / 0.45)",
        paddingRight: size * 0.08,
      }}
    >
      #
    </span>
  );
}
