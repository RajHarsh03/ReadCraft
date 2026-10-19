import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";

interface TopNavProps {
  /** Return to the landing/username-entry screen. */
  onHome?: () => void;
}

/** Fixed top navigation bar for the editor workbench (§6.8). */
export function TopNav({ onHome }: TopNavProps) {
  return (
    <header className="rc-nav-surface fixed inset-x-0 top-0 z-50 h-16 border-b-2 border-ink">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2"
          aria-label="Back to home"
          title="Back to home"
        >
          <Logo size={26} />
          <span className="rc-brand text-[1.35rem] leading-none text-on-surface">
            ReadCraft
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 font-mono text-label-sm font-bold uppercase tracking-widest text-on-surface-variant sm:flex">
            <span className="font-bold text-primary-container">#</span>
            <span>readcraft.md</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
