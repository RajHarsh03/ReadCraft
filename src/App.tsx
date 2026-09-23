import { useEffect, useState } from "react";
import { UsernameEntry } from "./screens/UsernameEntry";
import { EditorWorkbench } from "./screens/EditorWorkbench";

type Route = { view: "landing" } | { view: "editor"; username: string };

/** Read the current route from the browser's history state. */
function routeFromHistory(): Route {
  const state = window.history.state as Route | null;
  if (state && state.view === "editor" && state.username) {
    return { view: "editor", username: state.username };
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

  if (route.view === "editor") {
    // Keyed so switching users re-seeds the profile provider cleanly.
    return (
      <EditorWorkbench
        key={route.username}
        username={route.username}
        onHome={goHome}
      />
    );
  }

  return <UsernameEntry onGenerate={openEditor} />;
}

export default App;
