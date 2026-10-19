import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { TopNav } from "./TopNav";
import { LeftRail } from "./LeftRail";
import { useRouter } from "../../router";
import { cn } from "../../lib/cn";

interface AppShellProps {
  children: ReactNode;
}

const RAIL_COLLAPSED_KEY = "readcraft:rail-collapsed";

/** The rail starts collapsed on first load; a saved choice wins afterward. */
function loadRailCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(RAIL_COLLAPSED_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

/**
 * The persistent application frame: a fixed top nav and left workspace rail
 * that stay constant across every route. Individual screens render only their
 * own content inside it, so the navigation never remounts or shifts when
 * moving between the builder, Templates, Badge Studio, and Documentation.
 *
 * The shell owns the rail's collapsed state so the content area can reflow its
 * left padding to match the rail width (w-60 expanded / w-16 icon-only).
 */
export function AppShell({ children }: AppShellProps) {
  const { navigate } = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(loadRailCollapsed);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(RAIL_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore storage failures (private mode, quota)
      }
      return next;
    });
  }, []);

  return (
    <div className="rc-app-shell min-h-screen text-on-surface">
      <TopNav onHome={() => navigate({ name: "landing" })} />
      <LeftRail collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <div className={cn("pt-16", collapsed ? "lg:pl-16" : "lg:pl-60")}>
        {children}
      </div>
    </div>
  );
}
