import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the tree and shows a recoverable
 * fallback instead of a blank white screen. The user's draft lives in
 * localStorage, so reloading restores their work.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Operational visibility without shipping user data anywhere.
    console.error("ReadCraft render error:", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="rc-app-shell flex min-h-screen items-center justify-center p-6 text-on-surface">
        <div
          role="alert"
          className="flex max-w-md flex-col gap-3 rounded-[12px] border border-outline-variant bg-surface-container-lowest p-6 text-center"
        >
          <span
            className="material-symbols-outlined mx-auto text-error"
            style={{ fontSize: 36 }}
            aria-hidden
          >
            error
          </span>
          <h1 className="text-headline-md font-semibold">
            Something went wrong
          </h1>
          <p className="text-body-md text-on-surface-variant">
            The app hit an unexpected error. Your saved draft is stored locally,
            so reloading should bring your work back.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rc-amber-glow mx-auto mt-1 inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-primary-container px-4 py-2 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
          >
            Reload the app
          </button>
        </div>
      </div>
    );
  }
}
