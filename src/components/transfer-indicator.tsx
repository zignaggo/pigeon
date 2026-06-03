import { useLocation, useNavigate } from "@tanstack/react-router";

import { useTransfer } from "@/hooks/use-transfer";
import { formatBytes } from "@/lib/format";

export function TransferIndicator() {
  const t = useTransfer();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (t.status !== "sending" && t.status !== "awaiting") return null;
  if (pathname.startsWith("/transfer")) return null;

  const awaiting = t.status === "awaiting";
  const pct = t.total > 0 ? Math.min(100, (t.sent / t.total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() =>
        navigate({ to: "/transfer/$peerId", params: { peerId: t.peerId } })
      }
      className="bg-card/95 border-border absolute bottom-[84px] left-3 right-16 z-30 flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.35)] backdrop-blur md:bottom-5 md:left-auto md:right-5 md:w-80"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        className="shrink-0 animate-spin"
      >
        <path d="M8 1.5a6.5 6.5 0 1 0 6.5 6.5" />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground min-w-0 flex-1 truncate text-[13px] font-semibold">
            {awaiting ? "Aguardando aprovação" : `Enviando ${t.name}`}
          </span>
          {!awaiting && (
            <span
              className="text-muted-foreground shrink-0 text-[11.5px]"
              style={{ fontFamily: '"Geist Mono", ui-monospace, monospace' }}
            >
              {Math.round(pct)}%
            </span>
          )}
        </div>
        <div className="bg-muted mt-1.5 h-1 overflow-hidden rounded-sm">
          <div
            className="h-full rounded-sm"
            style={{
              width: `${awaiting ? 100 : pct}%`,
              background:
                "linear-gradient(90deg, var(--primary), var(--chart-2))",
              transition: "width .15s linear",
              opacity: awaiting ? 0.4 : 1,
            }}
          />
        </div>
        <div
          className="text-muted-foreground mt-1 truncate text-[10.5px]"
          style={{ fontFamily: '"Geist Mono", ui-monospace, monospace' }}
        >
          {awaiting
            ? t.name
            : `${formatBytes(t.sent)} / ${formatBytes(t.total)}`}
        </div>
      </div>
    </button>
  );
}
