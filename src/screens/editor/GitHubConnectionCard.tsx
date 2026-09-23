import { useState } from "react";
import { useProfile } from "../../store";
import { useGitHub } from "../../hooks/useGitHub";
import { mapBundleToImport, type GitHubBundle } from "../../lib/github";
import { Icon } from "../../components/ui/Icon";

/**
 * The GitHub connection panel. Auto-loads the current username's public data
 * and surfaces loading, success, and error states. Import is explicit, and
 * manual editing always remains available so an API failure never blocks work.
 */
export function GitHubConnectionCard() {
  const { state: profile, dispatch } = useProfile();
  const username = profile.basics.username;
  const { state, refetch } = useGitHub(username);

  return (
    <div className="rounded-[6px] border border-outline-variant bg-surface-container p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon name="hub" size={18} className="text-primary-container" />
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
          <ConnectionSuccess
            bundle={state.bundle}
            onImport={() =>
              dispatch({
                type: "importGitHub",
                payload: mapBundleToImport(state.bundle),
              })
            }
          />
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
        <div className="mt-1 flex gap-1.5">
          <div className="h-4 w-14 rounded bg-surface-container-high" />
          <div className="h-4 w-14 rounded bg-surface-container-high" />
          <div className="h-4 w-14 rounded bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}

function ConnectionSuccess({
  bundle,
  onImport,
}: {
  bundle: GitHubBundle;
  onImport: () => void;
}) {
  const [imported, setImported] = useState(false);
  const { profile, languages, totalPublic } = bundle;

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

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {languages.slice(0, 6).map((l) => (
            <span
              key={l.language}
              className="rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface"
            >
              {l.language} {l.percent}%
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          onImport();
          setImported(true);
        }}
        className="flex items-center justify-center gap-1.5 rounded-[6px] bg-primary-container px-3 py-2 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
      >
        <Icon name={imported ? "check" : "download"} size={16} />
        {imported ? "Imported — data applied" : "Import into README"}
      </button>
      <p className="text-body-sm text-on-surface-variant">
        Import fills your name, top languages, and featured
        repositories. Your existing bio and edits are preserved.
      </p>
    </div>
  );
}
