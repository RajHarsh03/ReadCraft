import { useCallback, useEffect, useRef, useState } from "react";
import { TopNav } from "../components/shell/TopNav";
import { LeftRail } from "../components/shell/LeftRail";
import { Button } from "../components/ui/Button";
import { ProfileProvider, useProfile } from "../store";
import { SectionsEditor } from "./editor/SectionsEditor";
import { PreviewPanel } from "./editor/PreviewPanel";
import { generateMarkdown } from "../lib/markdown";

interface EditorWorkbenchProps {
  username: string;
  /** Return to the landing/username-entry screen. */
  onHome?: () => void;
}

/** The main builder: top nav + left rail + sub-header + 40/60 workbench. */
export function EditorWorkbench({ username, onHome }: EditorWorkbenchProps) {
  return (
    <ProfileProvider username={username}>
      <div className="rc-app-shell min-h-screen text-on-surface">
        <TopNav onHome={onHome} />
        <LeftRail />
        <div className="pt-14 lg:pl-52">
          <SubHeader />
          <ResizableWorkbench />
        </div>
      </div>
    </ProfileProvider>
  );
}

/** Minimum / maximum editor width as a percentage of the workbench. */
const MIN_EDITOR_PCT = 25;
const MAX_EDITOR_PCT = 70;

/**
 * The two-pane workbench with a draggable divider. On desktop the editor and
 * preview widths are user-resizable; on smaller screens the panes stack and
 * the divider is hidden.
 */
function ResizableWorkbench() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorPct, setEditorPct] = useState(40);
  const [dragging, setDragging] = useState(false);
  // Resizing only applies on the desktop side-by-side layout (Tailwind lg).
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      setEditorPct(Math.min(MAX_EDITOR_PCT, Math.max(MIN_EDITOR_PCT, pct)));
    },
    []
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  // While dragging, listen on the window so the cursor can leave the handle.
  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // Keep the resize cursor and prevent text selection during the drag.
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging, onPointerMove, onPointerUp]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:h-[calc(100vh-6.5rem)] lg:flex-row"
    >
      <aside
        className="rc-editor-pane w-full shrink-0 overflow-y-auto p-4 lg:h-full"
        style={isDesktop ? { width: `${editorPct}%` } : undefined}
      >
        <SectionsEditor />
      </aside>

      {/* Draggable divider — desktop only */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and preview"
        onPointerDown={onPointerDown}
        className={`group relative hidden w-px shrink-0 cursor-col-resize bg-outline-variant lg:block ${
          dragging ? "bg-primary-container" : "hover:bg-primary-container/70"
        }`}
      >
        {/* Wider invisible hit area for easy grabbing */}
        <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
        {/* Grip indicator */}
        <span
          className={`absolute left-1/2 top-1/2 flex h-8 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant bg-surface-container transition-colors ${
            dragging
              ? "border-primary-container"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="text-code-sm leading-none text-on-surface-variant">
            ⋮
          </span>
        </span>
      </div>

      <main className="min-h-0 w-full flex-1 lg:h-full">
        <PreviewPanel />
      </main>
    </div>
  );
}

function SubHeader() {
  const { state } = useProfile();
  const [copied, setCopied] = useState(false);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown(state));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([generateMarkdown(state)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const fileSlug = state.basics.username || "profile";

  return (
    <section className="rc-nav-surface relative z-20 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 py-2 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded border border-outline-variant/70 bg-surface-container px-2 py-0.5">
          <span className="text-code-sm font-bold text-primary-container">
            #
          </span>
          <span className="text-code-sm text-on-surface">
            readme-{fileSlug}.md
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          icon={copied ? "check" : "content_copy"}
          onClick={copyMarkdown}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="primary" icon="download" onClick={download}>
          Download
        </Button>
      </div>
    </section>
  );
}
