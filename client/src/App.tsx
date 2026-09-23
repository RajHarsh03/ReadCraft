import { lazy, Suspense, type ReactNode } from "react";
import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { RouterProvider, useRouter } from "./router";

// Secondary routes are code-split: they're not on the critical landing/builder
// path, so they load on demand and stay out of the initial bundle.
const TemplatesScreen = lazy(() =>
  import("./screens/TemplatesScreen").then((m) => ({
    default: m.TemplatesScreen,
  }))
);
const BadgesScreen = lazy(() =>
  import("./screens/BadgesScreen").then((m) => ({ default: m.BadgesScreen }))
);
const DocsScreen = lazy(() =>
  import("./screens/DocsScreen").then((m) => ({ default: m.DocsScreen }))
);
const NotFoundScreen = lazy(() =>
  import("./screens/NotFoundScreen").then((m) => ({
    default: m.NotFoundScreen,
  }))
);

/** Minimal centered fallback while a lazily-loaded route resolves. */
function RouteFallback() {
  return (
    <div
      className="rc-app-shell flex min-h-screen items-center justify-center text-on-surface-variant"
      role="status"
      aria-live="polite"
    >
      <span className="text-body-md">Loading…</span>
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function Routes() {
  const { route, navigate } = useRouter();

  switch (route.name) {
    case "builder":
      return (
        // Keyed so switching users re-seeds the profile provider cleanly.
        <EditorWorkbench key={route.username} username={route.username} />
      );
    case "templates":
      return (
        <Lazy>
          <TemplatesScreen />
        </Lazy>
      );
    case "badges":
      return (
        <Lazy>
          <BadgesScreen />
        </Lazy>
      );
    case "docs":
      return (
        <Lazy>
          <DocsScreen />
        </Lazy>
      );
    case "notfound":
      return (
        <Lazy>
          <NotFoundScreen />
        </Lazy>
      );
    case "landing":
    default:
      return (
        <UsernameEntry
          onGenerate={(username) => navigate({ name: "builder", username })}
        />
      );
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider>
          <Routes />
        </RouterProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
