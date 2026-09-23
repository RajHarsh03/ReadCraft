import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  GitHubImport,
  PinnedProject,
  ProfileState,
  SectionId,
  Tech,
} from "./types";
import { SECTION_IDS } from "./types";
import { clearDraft, loadDraft, saveDraft } from "./lib/persistence";
import { templateLayout, type Template } from "./lib/templates";

/* -------------------------------------------------------------------------- */
/*  Seed data — mirrors the reference design (Alex Rivera)                    */
/* -------------------------------------------------------------------------- */

/** Generate a stable-enough unique id for a new list item. */
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** The default "suggested" pinned projects, used for the seed and for restore. */
function suggestedProjects(): PinnedProject[] {
  return [
    {
      id: newId(),
      name: "hyper-canvas",
      stars: "1.4k",
      description:
        "Hardware-accelerated web graphics layout kernel written in Rust & WebAssembly.",
    },
    {
      id: newId(),
      name: "reactor-kit",
      stars: "842",
      description:
        "Zero-runtime reactive UI primitives with full accessibility and token exports.",
    },
  ];
}

function createInitialState(username = "alexrivera"): ProfileState {
  return {
    basics: {
      fullName: "Alex Rivera",
      username,
      location: "San Francisco, CA",
      company: "Acme Labs",
    },
    headline: {
      primary: "Senior Systems & UI Engineer",
      bio: "Architecting distributed interfaces, high-concurrency tooling, and developer productivity systems.",
    },
    focus: {
      working: "Low-latency WebAssembly graphics pipeline at Acme",
      learning: "Rust async actors and eBPF kernel observability",
      askMeAbout:
        "Design systems architecture, React compiler internals, or CLI engines",
    },
    tech: [
      { name: "TypeScript", color: "#f59e0b" },
      { name: "Rust", color: "#f97316" },
      { name: "Go", color: "#00add8" },
      { name: "React", color: "#61dafb" },
      { name: "TailwindCSS", color: "#38bdf8" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Docker", color: "#2496ed" },
    ],
    metrics: {
      showStatsCard: true,
      showStreak: true,
      showGraph: true,
      showSnake: false,
      showTopLanguages: true,
    },
    pinned: suggestedProjects(),
    enabled: {
      profile: true,
      headline: true,
      focus: true,
      tech: true,
      metrics: true,
      pinned: true,
    },
    order: [...SECTION_IDS],
  };
}

/* -------------------------------------------------------------------------- */
/*  Actions                                                                   */
/* -------------------------------------------------------------------------- */

type Action =
  | { type: "setBasics"; patch: Partial<ProfileState["basics"]> }
  | { type: "setHeadline"; patch: Partial<ProfileState["headline"]> }
  | { type: "setFocus"; patch: Partial<ProfileState["focus"]> }
  | { type: "setMetrics"; patch: Partial<ProfileState["metrics"]> }
  | { type: "addTech"; tech: Tech }
  | { type: "updateTech"; name: string; patch: Partial<Tech> }
  | { type: "removeTech"; name: string }
  | { type: "toggleSection"; id: SectionId; value: boolean }
  | { type: "reorderSection"; id: SectionId; direction: -1 | 1 }
  | { type: "setOrder"; order: SectionId[] }
  | { type: "addProject"; project: PinnedProject }
  | { type: "updateProject"; id: string; patch: Partial<PinnedProject> }
  | { type: "removeProject"; id: string }
  | { type: "moveProject"; id: string; direction: -1 | 1 }
  | { type: "restoreSuggestedProjects" }
  | { type: "hydrate"; state: ProfileState }
  | { type: "importGitHub"; payload: GitHubImport }
  | { type: "applyTemplate"; template: Template }
  | { type: "reset"; username?: string };

/** Merge technologies, de-duplicating by case-insensitive name. */
function mergeTech(existing: Tech[], incoming: Tech[]): Tech[] {
  const merged = [...existing];
  for (const tech of incoming) {
    const dup = merged.some(
      (t) => t.name.toLowerCase() === tech.name.toLowerCase()
    );
    if (!dup) merged.push(tech);
  }
  return merged;
}

/** Swap the item at `index` with its neighbor in `direction`, immutably. */
function moveInArray<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function reducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case "setBasics":
      return { ...state, basics: { ...state.basics, ...action.patch } };
    case "setHeadline":
      return { ...state, headline: { ...state.headline, ...action.patch } };
    case "setFocus":
      return { ...state, focus: { ...state.focus, ...action.patch } };
    case "setMetrics":
      return { ...state, metrics: { ...state.metrics, ...action.patch } };
    case "addTech":
      if (
        state.tech.some(
          (t) => t.name.toLowerCase() === action.tech.name.toLowerCase()
        )
      ) {
        return state;
      }
      return { ...state, tech: [...state.tech, action.tech] };
    case "updateTech":
      return {
        ...state,
        tech: state.tech.map((t) =>
          t.name === action.name ? { ...t, ...action.patch } : t
        ),
      };
    case "removeTech":
      return {
        ...state,
        tech: state.tech.filter((t) => t.name !== action.name),
      };
    case "toggleSection":
      return {
        ...state,
        enabled: { ...state.enabled, [action.id]: action.value },
      };
    case "reorderSection":
      return {
        ...state,
        order: moveInArray(
          state.order,
          state.order.indexOf(action.id),
          action.direction
        ),
      };
    case "setOrder":
      return { ...state, order: action.order };
    case "addProject":
      return { ...state, pinned: [...state.pinned, action.project] };
    case "updateProject":
      return {
        ...state,
        pinned: state.pinned.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
      };
    case "removeProject":
      return {
        ...state,
        pinned: state.pinned.filter((p) => p.id !== action.id),
      };
    case "moveProject":
      return {
        ...state,
        pinned: moveInArray(
          state.pinned,
          state.pinned.findIndex((p) => p.id === action.id),
          action.direction
        ),
      };
    case "restoreSuggestedProjects":
      return { ...state, pinned: suggestedProjects() };
    case "applyTemplate": {
      // Layout only: change which sections show and their order. Content
      // (basics, headline, focus, tech, pinned) is intentionally preserved.
      const { enabled, order } = templateLayout(action.template);
      return { ...state, enabled, order };
    }
    case "hydrate":
      return action.state;
    case "importGitHub": {
      const { basics, bioIfEmpty, techToMerge, projects } = action.payload;
      return {
        ...state,
        basics: { ...state.basics, ...basics },
        headline: {
          ...state.headline,
          bio: state.headline.bio.trim() ? state.headline.bio : bioIfEmpty,
        },
        tech: mergeTech(state.tech, techToMerge),
        pinned: projects.length ? projects : state.pinned,
      };
    }
    case "reset":
      return createInitialState(action.username ?? state.basics.username);
    default:
      return state;
  }
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

/** Debounce window before an edit is written to local storage. */
const SAVE_DEBOUNCE_MS = 600;

interface Store {
  state: ProfileState;
  dispatch: React.Dispatch<Action>;
  /** Timestamp (ms) of the last successful local save, or null. */
  savedAt: number | null;
  /** True once a draft was restored from a previous session. */
  restored: boolean;
  /** Clear the saved draft and reset the document for the given username. */
  resetDraft: (username?: string) => void;
}

const ProfileContext = createContext<Store | null>(null);

/**
 * Build the initial state, preferring any saved local draft so returning users
 * keep their work. There is a single active draft; the incoming username is
 * only the seed used when no draft exists yet.
 */
function initState(username: string): {
  state: ProfileState;
  savedAt: number | null;
  restored: boolean;
} {
  const defaults = createInitialState(username);
  const draft = loadDraft(defaults);
  if (draft) {
    return { state: draft.state, savedAt: draft.savedAt, restored: true };
  }
  return { state: defaults, savedAt: null, restored: false };
}

export function ProfileProvider({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  const initial = useMemo(() => initState(username), [username]);
  const [state, dispatch] = useReducer(reducer, initial.state);
  const [savedAt, setSavedAt] = useState<number | null>(initial.savedAt);
  const [restored, setRestored] = useState(initial.restored);

  // Skip the very first render so restoring a draft doesn't immediately re-save.
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (saveDraft(state) === "saved") setSavedAt(Date.now());
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const resetDraft = useMemo(
    () => (nextUsername?: string) => {
      clearDraft();
      firstRun.current = true; // don't re-save the reset default immediately
      setSavedAt(null);
      setRestored(false);
      dispatch({ type: "reset", username: nextUsername ?? username });
    },
    [username]
  );

  const value = useMemo(
    () => ({ state, dispatch, savedAt, restored, resetDraft }),
    [state, savedAt, restored, resetDraft]
  );
  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// The provider component and this hook are intentionally co-located; splitting
// them would add indirection for no runtime benefit. (Restructured in Phase 1.)
// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): Store {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
