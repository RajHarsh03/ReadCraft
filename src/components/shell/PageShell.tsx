import type { ReactNode } from "react";
import { AppShell } from "./AppShell";

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * A content frame for non-builder routes (Templates, Badge Studio, Docs). It
 * renders inside the persistent AppShell (top nav + left rail), so only the
 * centered page content and heading belong here.
 */
export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
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
    </AppShell>
  );
}
