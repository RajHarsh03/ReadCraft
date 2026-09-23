import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";
import { Icon } from "../ui/Icon";
import { useRouter } from "../../router";

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** A simple page frame (top bar + centered content) for non-builder routes. */
export function PageShell({ title, description, children }: PageShellProps) {
  const { navigate } = useRouter();

  return (
    <div className="rc-app-shell min-h-screen text-on-surface">
      <header className="rc-nav-surface fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate({ name: "landing" })}
            className="flex items-center gap-1 rounded-lg px-1 py-1 transition-colors hover:bg-surface-container-high"
            aria-label="Back to home"
          >
            <Logo size={28} />
            <span className="rc-brand text-[1.5rem] leading-none text-on-surface">
              ReadCraft
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ name: "landing" })}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="arrow_back" size={16} />
            Home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-24">
        <div className="mb-8">
          <h1 className="text-headline-lg font-bold tracking-tight text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
