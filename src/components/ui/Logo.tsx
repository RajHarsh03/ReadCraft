interface LogoProps {
  size?: number;
  className?: string;
}

/** The ReadCraft mark: a stylized amber markdown hash on a dark tile. */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="#161922" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#2a2f3d" />
      <path
        d="M9 13.5H23M9 18.5H23M13.5 9L11.5 23M19.5 9L17.5 23"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
