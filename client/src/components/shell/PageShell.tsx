import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Content frame for non-builder routes (Templates, Badge Studio, Docs). It only
 * renders the centered page heading and content; the persistent chrome (top nav
 * + left rail) is provided by the AppShell mounted once in App, so switching
 * routes never remounts the navigation.
 */
export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
      <div className="mb-12 border-b border-outline-variant/60 pb-8">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-on-surface">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {children}
    </main>
  );
}
