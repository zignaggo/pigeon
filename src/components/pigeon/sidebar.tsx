import type { ReactNode } from "react";

import { usePeers } from "@/hooks/use-peers";
import { getNick } from "@/lib/nick";
import { cn, initialsOf } from "@/lib/utils";

import { PigeonAvatar, StatusDot } from "./atoms";
import type { Tab } from "./mobile";
import { IpAddress } from "./ip-address";

const MONO = '"Geist Mono", ui-monospace, monospace';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: "rede",
    label: "Na rede",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="8" cy="8" r="5" />
        <circle cx="8" cy="8" r="7" opacity=".4" />
      </svg>
    ),
  },
  {
    id: "historico",
    label: "Histórico",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4v4l2.5 1.5" />
        <circle cx="8" cy="8" r="6" />
      </svg>
    ),
  },
  {
    id: "ajustes",
    label: "Ajustes",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="2" />
        <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" />
      </svg>
    ),
  },
];

export function Sidebar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const nick = getNick() ?? "";
  const peers = usePeers();
  return (
    <div className="border-border bg-card/40 flex h-screen w-60 shrink-0 flex-col border-r">
      <div className="border-border flex items-center gap-2.5 border-b px-4 py-4">
        <PigeonAvatar
          name={initialsOf(nick || "?")}
          size={36}
          shape="squircle"
        />
        <div className="min-w-0">
          <div
            className="text-foreground truncate text-[13px] font-bold"
            style={{ letterSpacing: -0.1 }}
          >
            {nick || "—"}
          </div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[11px]">
            <StatusDot status="online" size={6} /> Visível na rede
          </div>
        </div>
      </div>

      <div className="flex-1 p-2">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "mb-0.5 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium",
                on
                  ? "bg-background text-foreground border-border border font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.icon}
              <span className="flex-1 text-left">{t.label}</span>
              {t.id === "rede" && peers.length > 0 && (
                <span
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: MONO }}
                >
                  {peers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <IpAddress />
    </div>
  );
}
