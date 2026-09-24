import { useCallback, useEffect, useRef, useState } from "react";
import {
  GitHubApiError,
  fetchGitHubBundle,
  type GitHubBundle,
} from "../lib/github";
import { isValidUsername } from "../lib/username";

export type GitHubState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; bundle: GitHubBundle }
  | { status: "error"; error: GitHubApiError };

function toApiError(err: unknown): GitHubApiError {
  return err instanceof GitHubApiError
    ? err
    : new GitHubApiError("unknown", "Something went wrong.");
}

/** How long typing must pause before we check/fetch a username. */
const FETCH_DEBOUNCE_MS = 600;

/**
 * Fetch a user's public GitHub data for the connection panel.
 *
 * The username is debounced: while the user is still typing we do NOT fetch, so
 * intermediate values (e.g. "raj", "rajharsh") never trigger a lookup or an
 * auto-import. Only after typing pauses for FETCH_DEBOUNCE_MS do we validate
 * and fetch the settled value. `refetch` runs immediately against the current
 * username. A stale request is ignored if the username changes before it
 * resolves.
 */
export function useGitHub(username: string) {
  const [state, setState] = useState<GitHubState>({ status: "idle" });
  // The username we actually fetch: it lags behind `username` until typing
  // settles. `refetch` also drives it (immediately) via a nonce bump.
  const [settled, setSettled] = useState(username);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => {
    setSettled(username);
    setNonce((n) => n + 1);
  }, [username]);

  // Debounce the username → `settled`. Cleared on each keystroke so a fetch
  // only starts once the user stops typing.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      // Adopt the initial username immediately (it came from the URL, not a
      // keystroke), so the first load isn't delayed.
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => setSettled(username), FETCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    /* Fetch-on-change: entering idle/loading synchronously here is intentional;
       success/error are set asynchronously once the request resolves. */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isValidUsername(settled)) {
      setState({ status: "idle" });
      return;
    }

    let active = true;
    setState({ status: "loading" });
    /* eslint-enable react-hooks/set-state-in-effect */

    fetchGitHubBundle(settled)
      .then((bundle) => {
        if (active) setState({ status: "success", bundle });
      })
      .catch((err) => {
        if (active) setState({ status: "error", error: toApiError(err) });
      });

    return () => {
      active = false;
    };
  }, [settled, nonce]);

  return { state, refetch };
}
