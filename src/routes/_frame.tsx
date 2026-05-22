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
import { ReceiveIndicator } from "@/components/receive-indicator";
import { RequestSheet } from "@/components/request-sheet";
import { TransferIndicator } from "@/components/transfer-indicator";
import { useDebugSetup } from "@/hooks/use-debug";
import { useDiscovery } from "@/hooks/use-peers";
import { useReceive } from "@/hooks/use-receive";
import {
  acceptRequest,
  declineRequest,
  useIncomingRequest,
  useReceiveRequest,
} from "@/hooks/use-receive-request";
import { useServer } from "@/hooks/use-server";
import { useTransferEvents } from "@/hooks/use-transfer";
import { getNick } from "@/lib/nick";
import { hasSaveDir } from "@/lib/receive-config";

const TAB_PATH = {
  rede: "/rede",
  recebidos: "/recebidos",
  historico: "/historico",
  ajustes: "/ajustes",
} as const;

export const Route = createFileRoute("/_frame")({
  beforeLoad: () => {
    if (!getNick() || !hasSaveDir()) throw redirect({ to: "/onboarding" });
  },
  component: FrameLayout,
});

function FrameLayout() {
  useServer();
  useDiscovery();
  useDebugSetup();
  useTransferEvents();
  useReceive();
  useReceiveRequest();
  const request = useIncomingRequest();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active: Tab = pathname.startsWith("/historico")
    ? "historico"
    : pathname.startsWith("/recebidos")
      ? "recebidos"
      : pathname.startsWith("/ajustes")
        ? "ajustes"
        : "rede";

  return (
    <div
      className="bg-background text-foreground flex h-full"
      style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
    >
      <aside className="hidden md:block">
        <Sidebar
          active={active}
          onChange={(t) => navigate({ to: TAB_PATH[t] })}
        />
      </aside>

      <div className="border-border relative mx-auto flex h-full w-full max-w-110 flex-col overflow-hidden border-x md:mx-0 md:max-w-none md:flex-1 md:border-x-0">
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
        <TransferIndicator />
        <ReceiveIndicator />
        {request && (
          <RequestSheet
            request={request}
            onAccept={() => void acceptRequest(request.id)}
            onDecline={() => void declineRequest(request.id)}
          />
        )}
        <DebugOverlay />
      </div>
    </div>
  );
}
