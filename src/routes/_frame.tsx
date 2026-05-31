import {
  createFileRoute,
  redirect,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";

import { PMTabBar, type Tab } from "@/components/pigeon/mobile";
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active: Tab = pathname.startsWith("/historico")
    ? "historico"
    : pathname.startsWith("/ajustes")
      ? "ajustes"
      : "rede";

  return (
    <div
      className="bg-background text-foreground flex min-h-screen justify-center"
      style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
    >
      <div className="border-border relative flex h-screen w-full max-w-110 flex-col overflow-hidden border-x">
        <div
          key={active}
          className="flex min-h-0 flex-1 flex-col"
          style={{ animation: "pmFadeIn .25s ease" }}
        >
          <Outlet />
        </div>
        <PMTabBar
          active={active}
          onChange={(t) => navigate({ to: TAB_PATH[t] })}
        />
      </div>
    </div>
  );
}
