import { Logo } from "../ui/Logo";

interface TopNavProps {
  /** Return to the landing/username-entry screen. */
  onHome?: () => void;
}

/** Fixed top navigation bar for the editor workbench. */
export function TopNav({ onHome }: TopNavProps) {
  return (
    <header className="rc-nav-surface fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-1 rounded-lg px-1 py-1 transition-colors hover:bg-surface-container-high"
          aria-label="Back to home"
          title="Back to home"
        >
          <Logo size={28} />
          <span className="rc-brand text-[1.5rem] leading-none text-on-surface">
            ReadCraft
          </span>
        </button>

        <div className="hidden items-center gap-1.5 rounded border border-outline-variant/70 bg-surface-container px-2 py-1 text-code-sm text-on-surface-variant sm:flex">
          <span className="font-bold text-primary-container">#</span>
          <span>readcraft.md</span>
        </div>
      </div>
    </header>
  );
}
