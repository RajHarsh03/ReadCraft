import { Logo } from "../ui/Logo";

interface TopNavProps {
  /** Return to the landing/username-entry screen. */
  onHome?: () => void;
}

/** Fixed top navigation bar for the editor workbench. */
export function TopNav({ onHome }: TopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          aria-label="Back to home"
          title="Back to home"
        >
          <Logo size={24} />
          <span className="rc-brand text-[1.35rem] leading-none text-on-surface">
            ReadCraft
          </span>
        </button>

        <div className="hidden items-center gap-2 text-label-sm uppercase tracking-widest text-on-surface-variant sm:flex">
          <span className="font-bold text-primary">#</span>
          <span>readcraft.md</span>
        </div>
      </div>
    </header>
  );
}
