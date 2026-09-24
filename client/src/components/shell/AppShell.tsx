import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { LeftRail } from "./LeftRail";
import { useRouter } from "../../router";

interface AppShellProps {
  children: ReactNode;
}

/**
 * The persistent application frame: a fixed top nav and left workspace rail
 * that stay constant across every route. Individual screens render only their
 * own content inside it, so the navigation never remounts or shifts when
 * moving between the builder, Templates, Badge Studio, and Documentation.
 */
export function AppShell({ children }: AppShellProps) {
  const { navigate } = useRouter();

  return (
    <div className="rc-app-shell min-h-screen text-on-surface">
      <TopNav onHome={() => navigate({ name: "landing" })} />
      <LeftRail />
      <div className="pt-14 lg:pl-56">{children}</div>
    </div>
  );
}
