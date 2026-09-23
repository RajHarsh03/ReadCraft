import { useCallback, useEffect, useState } from "react";
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

/**
 * Fetch a user's public GitHub data for the connection panel. Runs whenever the
 * username changes (and when `refetch` bumps the nonce). A stale request is
 * ignored if the username changes before it resolves.
 */
export function useGitHub(username: string) {
  const [state, setState] = useState<GitHubState>({ status: "idle" });
  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    /* Fetch-on-change: entering idle/loading synchronously here is intentional;
       success/error are set asynchronously once the request resolves. */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isValidUsername(username)) {
      setState({ status: "idle" });
      return;
    }

    let active = true;
    setState({ status: "loading" });
    /* eslint-enable react-hooks/set-state-in-effect */

    fetchGitHubBundle(username)
      .then((bundle) => {
        if (active) setState({ status: "success", bundle });
      })
      .catch((err) => {
        if (active) setState({ status: "error", error: toApiError(err) });
      });

    return () => {
      active = false;
    };
  }, [username, nonce]);

  return { state, refetch };
}
