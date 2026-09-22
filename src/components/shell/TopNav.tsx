import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";

const NAV_ITEMS = ["Builder", "Templates", "Badges", "Docs"];

/** Fixed top navigation bar for the editor workbench. */
export function TopNav() {
  return (
    <header className="rc-nav-surface fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <span className="text-headline-sm font-semibold tracking-tight text-on-surface">
            ReadCraft
          </span>
          <span className="hidden rounded bg-surface-container-high px-1.5 py-0.5 text-code-sm text-on-surface-variant sm:inline-flex">
            v2.4.0
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item, i) =>
            i === 0 ? (
              <span
                key={item}
                aria-current="page"
                className="rounded-lg bg-primary-container px-4 py-1 text-label-md font-semibold text-on-primary-container shadow-[0_6px_18px_-8px_rgb(247_167_24_/_0.9)]"
              >
                {item}
              </span>
            ) : (
              <span
                key={item}
                aria-disabled="true"
                title="Coming soon"
                className="cursor-not-allowed rounded-lg px-4 py-1 text-label-md text-on-surface-variant/50"
              >
                {item}
              </span>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded border border-outline-variant/70 bg-surface-container px-2 py-1 text-code-sm text-on-surface-variant sm:flex">
            <span className="font-bold text-primary-container">#</span>
            <span>readcraft.md</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={18} className="text-on-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
