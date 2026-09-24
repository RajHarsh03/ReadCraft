import { useEffect, useRef } from "react";
import { useProfile } from "../../store";
import { useGitHub } from "../../hooks/useGitHub";
import { mapBundleToImport, type GitHubBundle } from "../../lib/github";
import { Icon } from "../../components/ui/Icon";

/**
 * The GitHub connection panel. Auto-loads the current username's public data
 * and imports it into the document automatically once fetched, so entering a
 * username is all it takes. Manual editing always remains available, and an
 * API failure never blocks work.
 */
export function GitHubConnectionCard() {
  const { state: profile, dispatch } = useProfile();
  const username = profile.basics.username;
  const { state, refetch } = useGitHub(username);

  // Auto-import fetched data once per username. A ref guards against
  // re-importing on every render (or when the user edits after import).
  const importedFor = useRef<string | null>(null);
  useEffect(() => {
    if (state.status !== "success") return;
    const login = state.bundle.profile.login.toLowerCase();
    if (importedFor.current === login) return;
    importedFor.current = login;
    dispatch({
      type: "importGitHub",
      payload: mapBundleToImport(state.bundle),
    });
  }, [state, dispatch]);

  return (
    <div className="border border-outline-variant/70 border-l-2 border-l-primary-container bg-surface-container-low p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-outline-variant/70 text-primary">
            <Icon name="hub" size={17} />
          </span>
          <div className="flex flex-col">
            <span className="text-headline-sm text-on-surface">
              GitHub Connection
            </span>
            <span className="text-body-sm text-on-surface-variant">
              Load public profile data for @{username || "username"}
            </span>
          </div>
        </div>
        {state.status !== "loading" && (
          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="refresh" size={15} />
            {state.status === "success" ? "Refresh" : "Retry"}
          </button>
        )}
      </div>

      <div className="mt-3">
        {state.status === "idle" && (
          <p className="text-body-sm text-on-surface-variant">
            Enter a valid GitHub username above to load profile data.
          </p>
        )}
        {state.status === "loading" && <ConnectionSkeleton />}
        {state.status === "error" && (
          <div className="flex flex-col gap-2 rounded-[6px] border border-error/40 bg-error-container/10 p-3">
            <div className="flex items-start gap-2">
              <Icon name="error" size={16} className="mt-0.5 text-error" />
              <div className="flex flex-col">
                <span className="text-body-md text-on-surface">
                  {state.error.message}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  You can still edit every section and export your README
                  manually.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="self-start rounded bg-surface-container-high px-2.5 py-1 text-label-md text-on-surface transition-colors hover:bg-surface-bright"
            >
              Try again
            </button>
          </div>
        )}
        {state.status === "success" && (
          <ConnectionSuccess bundle={state.bundle} />
        )}
      </div>
    </div>
  );
}

function ConnectionSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-surface-container-high" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-1/3 rounded bg-surface-container-high" />
        <div className="h-2.5 w-1/4 rounded bg-surface-container-high" />
      </div>
    </div>
  );
}

function ConnectionSuccess({ bundle }: { bundle: GitHubBundle }) {
  const { profile, totalPublic } = bundle;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img
          src={profile.avatarUrl}
          alt={`${profile.login}'s avatar`}
          className="h-12 w-12 rounded-full border border-outline-variant"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-body-md font-semibold text-on-surface">
              {profile.name ?? profile.login}
            </span>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-code-sm text-primary-container hover:underline"
            >
              @{profile.login}
            </a>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-code-sm text-on-surface-variant">
            <span>{totalPublic} repos</span>
            <span>{profile.followers} followers</span>
            <span>{profile.following} following</span>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
        <Icon
          name="check_circle"
          size={15}
          className="text-primary-container"
        />
        Profile data loaded and applied. Your bio and edits are preserved.
      </p>
    </div>
  );
}
