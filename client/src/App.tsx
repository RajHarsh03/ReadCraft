import { lazy, Suspense, type ReactNode } from "react";
import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { RouterProvider, useRouter } from "./router";
import { PreferencesProvider } from "./preferences-store";
import { AppShell } from "./components/shell/AppShell";
import { PageSkeleton } from "./components/PageSkeleton";

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

/**
 * Renders a route's content inside the persistent AppShell (top nav + left
 * rail). The shell stays mounted across route changes, and lazily-loaded pages
 * only swap the inner content - showing a skeleton while their chunk loads -
 * so the chrome never blinks or shifts.
 */
function Shelled({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}

function Routes() {
  const { route, navigate } = useRouter();

  switch (route.name) {
    case "builder":
      return (
        <Shelled>
          {/* Keyed so switching users re-seeds the profile provider cleanly. */}
          <EditorWorkbench key={route.username} username={route.username} />
        </Shelled>
      );
    case "templates":
      return (
        <Shelled>
          <TemplatesScreen />
        </Shelled>
      );
    case "badges":
      return (
        <Shelled>
          <BadgesScreen />
        </Shelled>
      );
    case "docs":
      return (
        <Shelled>
          <DocsScreen />
        </Shelled>
      );
    case "notfound":
      return (
        <Shelled>
          <NotFoundScreen />
        </Shelled>
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
      <PreferencesProvider>
        <ToastProvider>
          <RouterProvider>
            <Routes />
          </RouterProvider>
        </ToastProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
