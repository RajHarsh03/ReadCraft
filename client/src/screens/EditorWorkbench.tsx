import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "../components/shell/AppShell";
import { Button } from "../components/ui/Button";
import { ProfileProvider, useProfile } from "../store";
import { SectionsEditor } from "./editor/SectionsEditor";
import { PreviewPanel } from "./editor/PreviewPanel";
import { generateMarkdown } from "../lib/markdown";
import { copyText, downloadTextFile, safeSlug } from "../lib/export";
import { useToast } from "../components/ui/Toast";
import { getTemplate, PENDING_TEMPLATE_KEY } from "../lib/templates";
import {
  PENDING_BADGE_KEY,
  badgeImageUrl,
  type BadgeSpec,
} from "../lib/badges";

interface EditorWorkbenchProps {
  username: string;
}

/** The main builder: persistent app shell + sub-header + 40/60 workbench. */
export function EditorWorkbench({ username }: EditorWorkbenchProps) {
  return (
    <ProfileProvider username={username}>
      <AppShell>
        <PendingHandoff />
        <SubHeader />
        <ResizableWorkbench />
      </AppShell>
    </ProfileProvider>
  );
}

/**
 * Applies anything handed over from a standalone page (a chosen template or a
 * badge) via sessionStorage, once, when the builder mounts. Renders nothing.
 */
function PendingHandoff() {
  const { dispatch } = useProfile();
  const toast = useToast();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    // Pending template
    try {
      const id = sessionStorage.getItem(PENDING_TEMPLATE_KEY);
      if (id) {
        sessionStorage.removeItem(PENDING_TEMPLATE_KEY);
        const template = getTemplate(id);
        if (template) {
          dispatch({ type: "applyTemplate", template });
          toast.success(`Applied the ${template.name} template.`);
        }
      }
    } catch {
      // ignore
    }

    // Pending badge → add to the Tech section as an image badge.
    try {
      const raw = sessionStorage.getItem(PENDING_BADGE_KEY);
      if (raw) {
        sessionStorage.removeItem(PENDING_BADGE_KEY);
        const spec = JSON.parse(raw) as BadgeSpec;
        const name =
          [spec.label, spec.message].filter(Boolean).join(" ").trim() ||
          "Badge";
        dispatch({
          type: "addTech",
          tech: {
            name,
            color: `#${spec.color.replace(/^#/, "")}`,
            badgeUrl: badgeImageUrl(spec),
          },
        });
        dispatch({ type: "toggleSection", id: "tech", value: true });
        toast.success("Badge added to your Tech Stack.");
      }
    } catch {
      // ignore
    }
  }, [dispatch, toast]);

  return null;
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

      {/* Draggable divider - desktop only */}
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
  const { state, savedAt, restored, resetDraft } = useProfile();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Announce a restored draft once, on mount.
  const announced = useRef(false);
  useEffect(() => {
    if (restored && !announced.current) {
      announced.current = true;
      toast.info("Restored your saved draft.");
    }
  }, [restored, toast]);

  const copyMarkdown = async () => {
    const ok = await copyText(generateMarkdown(state));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Markdown copied to clipboard.");
    } else {
      toast.error("Couldn't copy. Select the Markdown tab and copy manually.");
    }
  };

  const download = () => {
    try {
      const filename = `${safeSlug(state.basics.username)}-README.md`;
      downloadTextFile(generateMarkdown(state), filename);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error("Download failed. Try copying the Markdown instead.");
    }
  };

  const handleReset = () => {
    const ok = window.confirm(
      "Reset this draft? Your edits will be cleared and the saved draft removed."
    );
    if (!ok) return;
    resetDraft();
    toast.info("Draft reset.");
  };

  const fileSlug = state.basics.username || "profile";

  return (
    <section className="rc-nav-surface relative z-20 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 py-2 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded border border-outline-variant/70 bg-surface-container px-2 py-0.5">
          <span className="text-code-sm font-bold text-primary-container">
            #
          </span>
          <span className="text-code-sm text-on-surface">
            readme-{fileSlug}.md
          </span>
        </div>
        <span
          className="hidden items-center gap-1 text-code-sm text-on-surface-variant sm:flex"
          title={savedAt ? new Date(savedAt).toLocaleString() : undefined}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              savedAt ? "bg-primary-container" : "bg-outline-variant"
            }`}
          />
          {savedAt ? "Saved locally" : "Not saved"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          icon="restart_alt"
          onClick={handleReset}
        >
          Reset
        </Button>
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
