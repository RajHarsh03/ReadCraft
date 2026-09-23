import { useMemo, useState } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import {
  DEFAULT_TECH_COLOR,
  TECH_GROUPS,
  searchCatalog,
  type TechGroup,
} from "../../lib/techCatalog";
import type { Tech } from "../../types";

type Filter = TechGroup | "All";

/**
 * Searchable, grouped technology selector. Type to filter the catalog across
 * all groups, or browse a group; click a suggestion to add it. A custom form
 * covers anything not in the catalog (name + colour + optional badge URL).
 */
export function TechSelector() {
  const { state, dispatch } = useProfile();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [customOpen, setCustomOpen] = useState(false);

  const selectedNames = useMemo(
    () => state.tech.map((t) => t.name),
    [state.tech]
  );

  const suggestions = useMemo(
    () => searchCatalog(query, filter, selectedNames).slice(0, 24),
    [query, filter, selectedNames]
  );

  const add = (tech: Tech) => {
    dispatch({ type: "addTech", tech });
  };

  const remove = (name: string) => {
    dispatch({ type: "removeTech", name });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected chips */}
      <div className="flex flex-wrap gap-1.5">
        {state.tech.length === 0 && (
          <span className="text-body-sm text-on-surface-variant">
            No technologies yet — search or browse below.
          </span>
        )}
        {state.tech.map((t) => (
          <span
            key={t.name}
            className="inline-flex items-center gap-1.5 rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface"
          >
            {t.badgeUrl ? (
              <img src={t.badgeUrl} alt="" className="h-3 w-3 rounded-sm" />
            ) : (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
            )}
            {t.name}
            <button
              type="button"
              aria-label={`Remove ${t.name}`}
              onClick={() => remove(t.name)}
              className="text-on-surface-variant transition-colors hover:text-error"
            >
              <Icon name="close" size={13} />
            </button>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-1.5 rounded-[6px] border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 focus-within:border-primary-container">
        <Icon name="search" size={16} className="text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technologies…"
          className="w-full bg-transparent text-code-sm text-on-surface placeholder:text-outline focus:outline-none focus-visible:outline-none"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" size={15} />
          </button>
        )}
      </div>

      {/* Group filters (only meaningful when not searching) */}
      {!query && (
        <div className="flex flex-wrap gap-1">
          {(["All", ...TECH_GROUPS] as Filter[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setFilter(g)}
              className={
                filter === g
                  ? "rounded bg-surface-container-high px-2 py-1 text-label-sm font-semibold text-primary"
                  : "rounded px-2 py-1 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              }
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {suggestions.length === 0 ? (
          <span className="text-body-sm text-on-surface-variant">
            {query
              ? "No matches. Add it as a custom technology below."
              : "Everything in this group is already added."}
          </span>
        ) : (
          suggestions.map((entry) => (
            <button
              key={entry.name}
              type="button"
              onClick={() =>
                add({ name: entry.name, color: entry.color })
              }
              className="inline-flex items-center gap-1.5 rounded border border-outline-variant bg-surface-container-low px-2 py-0.5 text-label-sm text-on-surface-variant transition-colors hover:border-border-strong hover:text-on-surface"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
              <Icon name="add" size={13} />
            </button>
          ))
        )}
      </div>

      {/* Custom technology */}
      <div className="rounded-[6px] border border-outline-variant/70 bg-surface-container-lowest/60 p-2.5">
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="flex w-full items-center justify-between text-label-md text-on-surface"
          aria-expanded={customOpen}
        >
          <span className="flex items-center gap-1.5">
            <Icon name="add_circle" size={16} className="text-primary-container" />
            Add custom technology
          </span>
          <Icon
            name="expand_more"
            size={16}
            className={`text-on-surface-variant transition-transform ${customOpen ? "rotate-180" : ""}`}
          />
        </button>
        {customOpen && (
          <CustomTechForm
            existing={selectedNames}
            onAdd={(tech) => {
              add(tech);
              setCustomOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CustomTechForm({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (tech: Tech) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_TECH_COLOR);
  const [badgeUrl, setBadgeUrl] = useState("");

  const trimmed = name.trim();
  const duplicate = existing.some(
    (n) => n.toLowerCase() === trimmed.toLowerCase()
  );
  const canAdd = trimmed.length > 0 && !duplicate;

  const submit = () => {
    if (!canAdd) return;
    onAdd({
      name: trimmed,
      color,
      badgeUrl: badgeUrl.trim() || undefined,
    });
    setName("");
    setColor(DEFAULT_TECH_COLOR);
    setBadgeUrl("");
  };

  return (
    <div className="mt-2.5 flex flex-col gap-2 border-t border-outline-variant/60 pt-2.5">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Technology name"
          className="flex-1 rounded-[6px] border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-code-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus-visible:outline-none"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Badge colour"
          className="h-9 w-9 shrink-0 cursor-pointer rounded-[6px] border border-outline-variant bg-surface-container-lowest p-1"
        />
      </div>
      <input
        value={badgeUrl}
        onChange={(e) => setBadgeUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Badge image URL (optional)"
        className="rounded-[6px] border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-code-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus-visible:outline-none"
      />
      {duplicate && (
        <span className="text-body-sm text-error">
          “{trimmed}” is already added.
        </span>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!canAdd}
        className="inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-primary-container px-3 py-1.5 text-label-md font-semibold text-on-primary-container transition-colors hover:bg-primary-fixed-dim disabled:pointer-events-none disabled:opacity-40"
      >
        <Icon name="add" size={15} /> Add technology
      </button>
    </div>
  );
}
