import { useEffect, useState } from "react";
import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";
import { ToastProvider } from "./components/ui/Toast";

type Route = { view: "landing" } | { view: "editor"; username: string };

/**
 * Read the current route. Prefers history.state, then falls back to parsing the
 * URL hash (which survives a full page refresh) so reloading the builder keeps
 * you in the builder.
 */
function routeFromHistory(): Route {
  const state = window.history.state as Route | null;
  if (state && state.view === "editor" && state.username) {
    return { view: "editor", username: state.username };
  }
  const match = window.location.hash.match(/^#\/builder\/([^/?#]+)/);
  if (match) {
    return { view: "editor", username: decodeURIComponent(match[1]) };
  }
  return { view: "landing" };
}

function App() {
  const [route, setRoute] = useState<Route>(() => routeFromHistory());

  // Keep the route in sync with browser Back/Forward navigation.
  useEffect(() => {
    const onPopState = () => setRoute(routeFromHistory());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openEditor = (username: string) => {
    const next: Route = { view: "editor", username };
    // Push a history entry so the browser Back button returns to the landing.
    window.history.pushState(next, "", `#/builder/${username}`);
    setRoute(next);
  };

  const goHome = () => {
    const landing: Route = { view: "landing" };
    window.history.pushState(landing, "", "#/");
    setRoute(landing);
  };

  return (
    <ToastProvider>
      {route.view === "editor" ? (
        // Keyed so switching users re-seeds the profile provider cleanly.
        <EditorWorkbench
          key={route.username}
          username={route.username}
          onHome={goHome}
        />
      ) : (
        <UsernameEntry onGenerate={openEditor} />
      )}
    </ToastProvider>
  );
}

export default App;
