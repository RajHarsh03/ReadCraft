import {
  createContext,
  useContext,
  useMemo,
  useReducer,
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

/* -------------------------------------------------------------------------- */
/*  Seed data — mirrors the reference design (Alex Rivera)                    */
/* -------------------------------------------------------------------------- */

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
    pinned: [
      {
        id: "p1",
        name: "hyper-canvas",
        stars: "1.4k",
        description:
          "Hardware-accelerated web graphics layout kernel written in Rust & WebAssembly.",
      },
      {
        id: "p2",
        name: "reactor-kit",
        stars: "842",
        description:
          "Zero-runtime reactive UI primitives with full accessibility and token exports.",
      },
    ],
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
  | { type: "hydrate"; state: ProfileState }
  | { type: "importGitHub"; payload: GitHubImport }
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

interface Store {
  state: ProfileState;
  dispatch: React.Dispatch<Action>;
}

const ProfileContext = createContext<Store | null>(null);

export function ProfileProvider({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, username, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
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
