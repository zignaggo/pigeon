import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ReactNode } from "react";

function isDesktopTauri(): boolean {
  const tauri = "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
  return tauri && !/android|iphone|ipad/i.test(navigator.userAgent);
}

function Control({
  onClick,
  ariaLabel,
  danger,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={
        "text-muted-foreground hover:text-foreground flex h-full w-10.5 items-center justify-center transition-colors " +
        (danger
          ? "hover:bg-[#e5484d] hover:text-white"
          : "hover:bg-muted")
      }
    >
      {children}
    </button>
  );
}

export function TitleBar() {
  if (!isDesktopTauri()) return null;
  const win = getCurrentWindow();

  return (
    <div
      className="bg-card/90 border-border h-9 shrink-0 select-none items-center border-b backdrop-blur hidden sm:flex"
      style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
    >
      <div
        data-tauri-drag-region
        className="flex h-full flex-1 items-center gap-2 pl-3"
      >
        <div className="bg-primary flex size-4 items-center justify-center rounded-[4px] text-white">
          <svg
            width="9"
            height="9"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M28 4L14 18M28 4l-10 24-4-10-10-4z" />
          </svg>
        </div>
        <span className="text-muted-foreground text-[12px] font-semibold">
          Pigeon
        </span>
      </div>
      <div className="flex h-full">
        <Control onClick={() => void win.minimize()} ariaLabel="Minimizar">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </Control>
        <Control onClick={() => void win.toggleMaximize()} ariaLabel="Maximizar">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </Control>
        <Control onClick={() => void win.close()} ariaLabel="Fechar" danger>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1" />
            <line x1="1" y1="9" x2="9" y2="1" stroke="currentColor" strokeWidth="1" />
          </svg>
        </Control>
      </div>
    </div>
  );
}
