/**
 * A content-area loading placeholder shown while a lazily-loaded route's chunk
 * is fetched. The persistent chrome (top nav + left rail) stays mounted around
 * it, so only this inner content shimmers into place - like cards rendering in.
 */
export function PageSkeleton() {
  return (
    <main
      className="mx-auto max-w-5xl px-6 pb-24 pt-10"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Heading block */}
      <div className="mb-8">
        <div className="rc-skeleton h-8 w-56 rounded-lg" />
        <div className="rc-skeleton mt-3 h-4 w-full max-w-xl rounded" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rc-skeleton-card flex flex-col gap-3 border border-outline-variant/60 bg-surface-container-lowest p-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="rc-skeleton h-24 w-full rounded-lg" />
            <div className="rc-skeleton h-4 w-2/3 rounded" />
            <div className="rc-skeleton h-3 w-full rounded" />
            <div className="rc-skeleton h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </main>
  );
}
