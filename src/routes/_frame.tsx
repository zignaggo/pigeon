import {
  createFileRoute,
  redirect,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";

import { DebugOverlay } from "@/components/devtools/debug-overlay";
import { PMTabBar, type Tab } from "@/components/pigeon/mobile";
import { Sidebar } from "@/components/pigeon/sidebar";
import { useDebugSetup } from "@/hooks/use-debug";
import { useDiscovery } from "@/hooks/use-peers";
import { getNick } from "@/lib/nick";

const TAB_PATH = {
  rede: "/rede",
  historico: "/historico",
  ajustes: "/ajustes",
} as const;

export const Route = createFileRoute("/_frame")({
  beforeLoad: () => {
    if (!getNick()) throw redirect({ to: "/onboarding" });
  },
  component: FrameLayout,
});

function FrameLayout() {
  useDiscovery();
  useDebugSetup();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active: Tab = pathname.startsWith("/historico")
    ? "historico"
    : pathname.startsWith("/ajustes")
      ? "ajustes"
      : "rede";

  return (
    <div
      className="bg-background text-foreground flex min-h-screen"
      style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
    >
      <aside className="hidden md:block">
        <Sidebar
          active={active}
          onChange={(t) => navigate({ to: TAB_PATH[t] })}
        />
      </aside>

      <div className="border-border relative mx-auto flex h-screen w-full max-w-110 flex-col overflow-hidden border-x md:mx-0 md:max-w-none md:flex-1 md:border-x-0">
        <div
          key={active}
          className="flex min-h-0 flex-1 flex-col"
          style={{ animation: "pmFadeIn .25s ease" }}
        >
          <div className="mx-auto flex min-h-0 w-full max-w-190 sm:max-w-full flex-1 flex-col">
            <Outlet />
          </div>
        </div>
        <div className="shrink-0 md:hidden">
          <PMTabBar
            active={active}
            onChange={(t) => navigate({ to: TAB_PATH[t] })}
          />
        </div>
        <DebugOverlay />
      </div>
    </div>
  );
}
