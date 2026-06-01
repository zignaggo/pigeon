import { createRootRoute, Outlet } from "@tanstack/react-router";

import { TitleBar } from "@/components/title-bar";

function Root() {
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
