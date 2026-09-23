import { useProfile } from "../../store";
import { useToast } from "../../components/ui/Toast";
import { Icon } from "../../components/ui/Icon";
import type { PinnedProject } from "../../types";

function makeProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputClass =
  "w-full rounded-[6px] border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 " +
  "text-code-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus-visible:outline-none";

/** Pinned-projects editor: add, edit, remove, reorder, restore suggested. */
export function ProjectsEditor() {
  const { state, dispatch } = useProfile();
  const toast = useToast();
  const projects = state.pinned;

  const add = () => {
    dispatch({
      type: "addProject",
      project: { id: makeProjectId(), name: "", stars: "", description: "" },
    });
  };

  const restore = () => {
    dispatch({ type: "restoreSuggestedProjects" });
    toast.info("Restored suggested projects.");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {projects.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">
          No projects yet. Add one, or restore the suggested set.
        </p>
      )}

      {projects.map((project, index) => (
        <ProjectRow
          key={project.id}
          project={project}
          isFirst={index === 0}
          isLast={index === projects.length - 1}
          onChange={(patch) =>
            dispatch({ type: "updateProject", id: project.id, patch })
          }
          onRemove={() => dispatch({ type: "removeProject", id: project.id })}
          onMove={(direction) =>
            dispatch({ type: "moveProject", id: project.id, direction })
          }
        />
      ))}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary-container px-3 py-1.5 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim"
        >
          <Icon name="add" size={15} /> Add project
        </button>
        <button
          type="button"
          onClick={restore}
          className="inline-flex items-center gap-1.5 rounded-[6px] border border-outline-variant bg-surface-container px-3 py-1.5 text-label-md text-on-surface-variant transition-colors hover:border-border-strong hover:text-on-surface"
        >
          <Icon name="restart_alt" size={15} /> Restore suggested
        </button>
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: {
  project: PinnedProject;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<PinnedProject>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="rounded-[8px] border border-outline-variant bg-surface-container-low/60 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Move project up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
          >
            <Icon name="keyboard_arrow_up" size={16} />
          </button>
          <button
            type="button"
            aria-label="Move project down"
            disabled={isLast}
            onClick={() => onMove(1)}
            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:pointer-events-none disabled:opacity-30"
          >
            <Icon name="keyboard_arrow_down" size={16} />
          </button>
        </div>
        <button
          type="button"
          aria-label="Remove project"
          onClick={onRemove}
          className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={project.name}
            placeholder="Project name"
            aria-label="Project name"
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <div className="flex w-24 shrink-0 items-center gap-1 rounded-[6px] border border-outline-variant bg-surface-container-lowest px-2 focus-within:border-primary-container">
            <Icon name="star" size={13} className="text-primary-container" />
            <input
              className="w-full bg-transparent py-1.5 text-code-sm text-on-surface placeholder:text-outline focus:outline-none focus-visible:outline-none"
              value={project.stars}
              placeholder="1.4k"
              aria-label="Star count"
              onChange={(e) => onChange({ stars: e.target.value })}
            />
          </div>
        </div>
        <textarea
          rows={2}
          className={`${inputClass} resize-none`}
          value={project.description}
          placeholder="Short description"
          aria-label="Project description"
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
    </div>
  );
}
