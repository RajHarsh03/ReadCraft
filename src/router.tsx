import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * A tiny hash-based router. Hash routing is used deliberately: it survives a
 * full page refresh on any static host without server rewrites, and keeps the
 * browser Back/Forward buttons working. No external dependency.
 */

export type Route =
  | { name: "landing" }
  | { name: "builder"; username: string }
  | { name: "templates" }
  | { name: "badges" }
  | { name: "docs" }
  | { name: "notfound" };

export type RouteName = Route["name"];

/** Serialize a route to its URL hash. */
export function routeToHash(route: Route): string {
  switch (route.name) {
    case "landing":
      return "#/";
    case "builder":
      return route.username
        ? `#/builder/${encodeURIComponent(route.username)}`
        : "#/builder";
    case "templates":
      return "#/templates";
    case "badges":
      return "#/badges";
    case "docs":
      return "#/docs";
    case "notfound":
      return "#/404";
  }
}

/** Parse the current location hash into a typed route. */
export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#/, "");
  // /builder or /builder/<username> (username optional).
  const builder = clean.match(/^\/builder(?:\/([^/?#]+))?/);
  if (builder) {
    return {
      name: "builder",
      username: builder[1] ? decodeURIComponent(builder[1]) : "",
    };
  }
  if (clean.startsWith("/templates")) return { name: "templates" };
  if (clean.startsWith("/badges")) return { name: "badges" };
  if (clean.startsWith("/docs")) return { name: "docs" };
  // Empty hash (or bare "/") is the landing page; any other unknown path is a
  // genuine not-found so mistyped links get a clear recovery screen.
  if (clean === "" || clean === "/") return { name: "landing" };
  return { name: "notfound" };
}

interface RouterApi {
  route: Route;
  /** Push a new route (adds a history entry). */
  navigate: (route: Route) => void;
  /** Replace the current route (no new history entry). */
  replace: (route: Route) => void;
  /** Go back one entry in history. */
  back: () => void;
}

const RouterContext = createContext<RouterApi | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    // Setting location.hash pushes a history entry and fires hashchange,
    // which updates state via the listener above.
    window.location.hash = routeToHash(next);
  }, []);

  const replace = useCallback((next: Route) => {
    const url = `${window.location.pathname}${window.location.search}${routeToHash(next)}`;
    window.history.replaceState(null, "", url);
    setRoute(next);
  }, []);

  const back = useCallback(() => window.history.back(), []);

  const api = useMemo<RouterApi>(
    () => ({ route, navigate, replace, back }),
    [route, navigate, replace, back]
  );

  return <RouterContext.Provider value={api}>{children}</RouterContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter(): RouterApi {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}
