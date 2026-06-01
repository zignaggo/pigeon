import { useReceiveState } from "@/hooks/use-receive";
import { formatBytes } from "@/lib/format";

const MONO = '"Geist Mono", ui-monospace, monospace';

export function ReceiveIndicator() {
  const r = useReceiveState();
  if (r.status === "idle") return null;

  const done = r.status === "done";
  const pct = r.total > 0 ? Math.min(100, (r.received / r.total) * 100) : 0;

  return (
    <div className="bg-card/95 border-border absolute bottom-[140px] left-3 right-16 z-30 flex items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.35)] backdrop-blur md:bottom-[88px] md:left-auto md:right-5 md:w-80">
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in oklab, var(--chart-3) 20%, transparent)",
          color: "var(--chart-3)",
        }}
      >
        {done ? (
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 9.5l4 4 7-7" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M3 14h10" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground min-w-0 flex-1 truncate text-[13px] font-semibold">
            {done ? "Recebido" : "Recebendo"} {r.name}
          </span>
          {!done && (
            <span className="text-muted-foreground shrink-0 text-[11.5px]" style={{ fontFamily: MONO }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
        {!done && (
          <div className="bg-muted mt-1.5 h-1 overflow-hidden rounded-sm">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${pct}%`,
                background: "var(--chart-3)",
                transition: "width .15s linear",
              }}
            />
          </div>
        )}
        <div className="text-muted-foreground mt-1 truncate text-[10.5px]" style={{ fontFamily: MONO }}>
          {done ? `de ${r.from}` : `${formatBytes(r.received)} / ${formatBytes(r.total)} · de ${r.from}`}
        </div>
      </div>
    </div>
  );
}
