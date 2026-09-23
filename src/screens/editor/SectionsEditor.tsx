import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { SectionCard } from "../../components/ui/SectionCard";
import { Field, TextField, ToggleRow } from "../../components/ui/Field";
import { Toggle } from "../../components/ui/Toggle";
import { usernameError } from "../../lib/username";
import { GitHubConnectionCard } from "./GitHubConnectionCard";
import { TemplatePicker } from "./TemplatePicker";
import { TechSelector } from "./TechSelector";
import { ProjectsEditor } from "./ProjectsEditor";
import { SectionOrderEditor } from "./SectionOrderEditor";

/** The 40% left column: "Document Sections" accordion editor. */
export function SectionsEditor() {
  const { state, dispatch } = useProfile();
  const activeCount = Object.values(state.enabled).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2">
      {/* GitHub connection + import */}
      <GitHubConnectionCard />

      {/* Layout templates */}
      <SectionCard
        icon="dashboard_customize"
        title="Templates"
        description="Rearrange sections with a preset layout"
      >
        <TemplatePicker />
      </SectionCard>

      {/* Editor header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5">
          <Icon name="tune" size={18} className="text-primary" />
          <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Document Sections ({activeCount})
          </span>
        </div>
        <span className="text-code-sm text-on-surface-variant">
          Live Synced
        </span>
      </div>

      {/* 1. Profile Basics */}
      <SectionCard
        icon="badge"
        title="Profile Basics"
        description="Identity, handles & coordinates"
        defaultOpen
        enabled={state.enabled.profile}
        onToggle={(v) =>
          dispatch({ type: "toggleSection", id: "profile", value: v })
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Full Name"
            value={state.basics.fullName}
            onChange={(v) =>
              dispatch({ type: "setBasics", patch: { fullName: v } })
            }
          />
          <Field
            label="GitHub Username"
            prefix="@"
            value={state.basics.username}
            error={usernameError(state.basics.username)}
            onChange={(v) =>
              dispatch({ type: "setBasics", patch: { username: v } })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Location"
            value={state.basics.location}
            onChange={(v) =>
              dispatch({ type: "setBasics", patch: { location: v } })
            }
          />
          <Field
            label="Company / Lab"
            value={state.basics.company}
            onChange={(v) =>
              dispatch({ type: "setBasics", patch: { company: v } })
            }
          />
        </div>
      </SectionCard>

      {/* 2. Headline & Pitch */}
      <SectionCard
        icon="title"
        title="Headline & Pitch"
        description="Primary taglines and summary"
        defaultOpen
        enabled={state.enabled.headline}
        onToggle={(v) =>
          dispatch({ type: "toggleSection", id: "headline", value: v })
        }
      >
        <Field
          label="Primary Headline"
          value={state.headline.primary}
          onChange={(v) =>
            dispatch({ type: "setHeadline", patch: { primary: v } })
          }
        />
        <TextField
          label="Markdown Lead Bio"
          value={state.headline.bio}
          onChange={(v) => dispatch({ type: "setHeadline", patch: { bio: v } })}
        />
      </SectionCard>

      {/* 3. Current Focus & Goals */}
      <SectionCard
        icon="track_changes"
        title="Current Focus & Goals"
        description="Dynamic GFM bullet generator"
        enabled={state.enabled.focus}
        onToggle={(v) =>
          dispatch({ type: "toggleSection", id: "focus", value: v })
        }
      >
        <Field
          label="🔭 I'm currently working on..."
          mono
          value={state.focus.working}
          onChange={(v) =>
            dispatch({ type: "setFocus", patch: { working: v } })
          }
        />
        <Field
          label="🌱 I'm currently learning..."
          mono
          value={state.focus.learning}
          onChange={(v) =>
            dispatch({ type: "setFocus", patch: { learning: v } })
          }
        />
        <Field
          label="💬 Ask me about..."
          mono
          value={state.focus.askMeAbout}
          onChange={(v) =>
            dispatch({ type: "setFocus", patch: { askMeAbout: v } })
          }
        />
      </SectionCard>

      {/* 4. Tech Stack Badges */}
      <SectionCard
        icon="terminal"
        title="Tech Stack Badges"
        description="Skill matrix pills & icon sets"
        defaultOpen
        enabled={state.enabled.tech}
        onToggle={(v) =>
          dispatch({ type: "toggleSection", id: "tech", value: v })
        }
      >
        <TechSelector />
      </SectionCard>

      {/* 5. GitHub Metrics */}
      <SectionCard
        icon="query_stats"
        title="GitHub Metrics"
        description="Widgets configuration switches"
        defaultOpen
      >
        <ToggleRow
          title="Show GitHub Stats Card"
          description="Overview of stars, PRs, and top contributions"
        >
          <Toggle
            checked={state.metrics.showStatsCard}
            onChange={(v) =>
              dispatch({ type: "setMetrics", patch: { showStatsCard: v } })
            }
            label="Show GitHub Stats Card"
          />
        </ToggleRow>
        <ToggleRow
          title="Show Contribution Streak"
          description="Display current and longest commit streak"
        >
          <Toggle
            checked={state.metrics.showStreak}
            onChange={(v) =>
              dispatch({ type: "setMetrics", patch: { showStreak: v } })
            }
            label="Show Contribution Streak"
          />
        </ToggleRow>
        <ToggleRow
          title="Show Contribution Graph"
          description="Dynamic commit heat-map widget"
        >
          <Toggle
            checked={state.metrics.showGraph}
            onChange={(v) =>
              dispatch({ type: "setMetrics", patch: { showGraph: v } })
            }
            label="Show Contribution Graph"
          />
        </ToggleRow>
        <ToggleRow
          title="Snake Animation"
          description="Retro game eating commit contributions"
        >
          <Toggle
            checked={state.metrics.showSnake}
            onChange={(v) =>
              dispatch({ type: "setMetrics", patch: { showSnake: v } })
            }
            label="Snake Animation"
          />
        </ToggleRow>
        <ToggleRow
          title="Top Languages Card"
          description="Automatic language breakdown bar"
        >
          <Toggle
            checked={state.metrics.showTopLanguages}
            onChange={(v) =>
              dispatch({ type: "setMetrics", patch: { showTopLanguages: v } })
            }
            label="Top Languages Card"
          />
        </ToggleRow>
      </SectionCard>

      {/* 6. Pinned Projects */}
      <SectionCard
        icon="folder_special"
        title="Pinned Projects"
        description="Curated repository highlights"
        enabled={state.enabled.pinned}
        onToggle={(v) =>
          dispatch({ type: "toggleSection", id: "pinned", value: v })
        }
      >
        <ProjectsEditor />
      </SectionCard>

      {/* 7. Section order & visibility */}
      <SectionCard
        icon="reorder"
        title="Reorder & Layout"
        description={`${activeCount} of ${state.order.length} sections shown`}
      >
        <SectionOrderEditor />
      </SectionCard>
    </div>
  );
}
