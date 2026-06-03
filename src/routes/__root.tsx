import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { TitleBar } from "@/components/title-bar";

declare global {
  interface Window {
    PigeonSplash?: { ready?: () => void };
  }
}

let splashDismissed = false;

function dismissSplash(): void {
  if (splashDismissed) return;
  splashDismissed = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        window.PigeonSplash?.ready?.();
      } catch {
        // sem interface nativa (desktop / browser) — nada a fazer
      }
    });
  });
}

function Root() {
  useEffect(() => {
    dismissSplash();
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <TitleBar />
      <div className="relative min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: Root,
});
