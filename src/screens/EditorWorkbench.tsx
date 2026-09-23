import { useState } from "react";
import { TopNav } from "../components/shell/TopNav";
import { LeftRail } from "../components/shell/LeftRail";
import { Logo } from "../components/ui/Logo";
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
        <div className="pt-14 lg:pl-64">
          <SubHeader />
          {/* Two-column workbench: 40% editor / 60% preview */}
          <div className="flex min-h-[calc(100vh-6.5rem)] flex-col lg:flex-row">
            <aside className="rc-editor-pane max-h-[calc(100vh-6.5rem)] w-full overflow-y-auto border-r border-outline-variant p-4 lg:w-[40%]">
              <SectionsEditor />
            </aside>
            <main className="w-full lg:w-[60%]">
              <PreviewPanel />
            </main>
          </div>
        </div>
      </div>
    </ProfileProvider>
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
        <div className="flex items-center gap-1.5">
          <Logo size={30} />
          <span className="rc-brand text-headline-sm text-on-surface">
            ReadCraft
          </span>
        </div>
        <div className="hidden h-4 w-px bg-surface-container-highest sm:block" />
        <div className="hidden items-center gap-1.5 rounded border border-outline-variant/70 bg-surface-container px-2 py-0.5 sm:flex">
          <span className="text-code-sm font-bold text-primary-container">
            #
          </span>
          <span className="text-code-sm text-on-surface">
            readme-{fileSlug}.md
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button icon={copied ? "check" : "content_copy"} onClick={copyMarkdown}>
          {copied ? "Copied" : "Copy Markdown"}
        </Button>
        <Button variant="primary" icon="download" onClick={download}>
          <span className="hidden sm:inline">Download README.md</span>
          <span className="sm:hidden">Download</span>
        </Button>
      </div>
    </section>
  );
}
