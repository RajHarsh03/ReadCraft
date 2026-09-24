import { useState } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { cn } from "../../lib/cn";
import { generateMarkdown } from "../../lib/markdown";
import { MarkdownPreview } from "../../components/MarkdownPreview";
import { usePreferences } from "../../preferences-store";

type Tab = "preview" | "markdown";

/**
 * The right column: Preview / Markdown tabs. The Preview tab renders the exact
 * Markdown through GitHub's own stylesheet, so what you see is what a pasted
 * README actually looks like on GitHub (true WYSIWYG). The Markdown tab shows
 * the raw source that Copy/Download produce.
 */
export function PreviewPanel() {
  const { state } = useProfile();
  const { prefs } = usePreferences();
  const [tab, setTab] = useState<Tab>(prefs.defaultPreviewTab);
  const markdown = generateMarkdown(state);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Tab switch bar */}
      <div className="z-10 flex items-center justify-between border-b border-outline-variant/60 bg-surface px-4">
        <div className="flex items-center gap-6">
          <TabButton
            icon="visibility"
            label="Preview"
            active={tab === "preview"}
            onClick={() => setTab("preview")}
          />
          <TabButton
            icon="code"
            label="Markdown"
            active={tab === "markdown"}
            onClick={() => setTab("markdown")}
          />
        </div>
        <div className="flex items-center gap-1.5 text-label-sm uppercase tracking-widest text-on-surface-variant">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
          <span>GitHub preview</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-y-auto bg-surface-dim/40 p-4 lg:p-8">
        {tab === "preview" ? (
          <div className="relative z-10 mx-auto w-full max-w-3xl overflow-hidden border border-outline-variant/70 bg-surface-container-low p-4 shadow-[0_30px_80px_-50px_rgb(0_0_0_/_0.9)] sm:p-8">
            <MarkdownPreview markdown={markdown} />
          </div>
        ) : (
          <pre className="relative z-10 mx-auto w-full max-w-3xl whitespace-pre-wrap break-words border border-outline-variant/70 bg-surface-container-low p-6 text-code-sm text-on-surface">
            {markdown}
          </pre>
        )}
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 border-b-2 py-3 text-label-md transition-colors",
        active
          ? "border-primary-container text-on-surface"
          : "border-transparent text-on-surface-variant hover:text-on-surface"
      )}
    >
      <Icon
        name={icon}
        size={16}
        className={active ? "text-primary" : undefined}
      />
      <span>{label}</span>
    </button>
  );
}
