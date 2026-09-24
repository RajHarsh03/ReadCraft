import { useState } from "react";
import { useProfile } from "../../store";
import { Icon } from "../../components/ui/Icon";
import { cn } from "../../lib/cn";
import { generateMarkdown } from "../../lib/markdown";
import { MarkdownPreview } from "../../components/MarkdownPreview";

type Tab = "preview" | "markdown";

/**
 * The right column: Preview / Markdown tabs. The Preview tab renders the exact
 * Markdown through GitHub's own stylesheet, so what you see is what a pasted
 * README actually looks like on GitHub (true WYSIWYG). The Markdown tab shows
 * the raw source that Copy/Download produce.
 */
export function PreviewPanel() {
  const { state } = useProfile();
  const [tab, setTab] = useState<Tab>("preview");
  const markdown = generateMarkdown(state);

  return (
    <div className="flex h-full flex-col bg-surface/80">
      {/* Tab switch bar */}
      <div className="z-10 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 py-1.5 backdrop-blur-xl">
        <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-1.5 text-code-sm text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary-container" />
          <span>GitHub preview</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-y-auto bg-surface-dim p-4 lg:p-8">
        {tab === "preview" ? (
          <div className="rc-elevated relative z-10 mx-auto w-full max-w-3xl overflow-hidden rounded-[12px] border border-outline-variant/80 bg-surface-container-lowest p-4 sm:p-8">
            <MarkdownPreview markdown={markdown} />
          </div>
        ) : (
          <pre className="relative z-10 mx-auto w-full max-w-3xl overflow-x-auto rounded-[12px] bg-surface-container-lowest p-6 text-code-sm text-on-surface shadow-2xl">
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
        "relative flex items-center gap-1.5 rounded px-4 py-1.5 text-label-md transition-colors",
        active
          ? "bg-surface-container text-on-surface"
          : "text-on-surface-variant hover:bg-surface-container/50"
      )}
    >
      <Icon
        name={icon}
        size={16}
        className={active ? "text-primary-container" : undefined}
      />
      <span>{label}</span>
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-container" />
      )}
    </button>
  );
}
