import { createFileRoute } from "@tanstack/react-router";
import { MHISTORY, type HistoryItem } from "@/lib/mock";
import { FileIcon } from "@/components/pigeon/atoms";
import { PMAppBar, PMSectionLabel, PMCard } from "@/components/pigeon/mobile";

const MONO = '"Geist Mono", ui-monospace, monospace';

export const Route = createFileRoute("/_frame/historico")({
  component: HistoryScreen,
});

function Item({ it, isLast }: { it: HistoryItem; isLast?: boolean }) {
  const out = it.dir === "out";
  const color = out ? "var(--primary)" : "var(--chart-3)";
  return (
    <div className={"flex items-center gap-3 px-[15px] py-[13px]" + (isLast ? "" : " border-border border-b")}>
      <FileIcon ext={it.ext} size={34} />
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate text-sm font-semibold">{it.name}</div>
        <div className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1.5 text-xs">
          <span className="flex shrink-0 items-center gap-1 font-semibold whitespace-nowrap" style={{ color }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {out ? <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" /> : <path d="M6 2v8M2.5 6.5L6 10l3.5-3.5" />}
            </svg>
            {out ? "Enviado para" : "Recebido de"}
          </span>
          <span className="truncate">{it.peer}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-muted-foreground text-xs" style={{ fontFamily: MONO }}>
          {it.time}
        </div>
        <div className="text-muted-foreground mt-0.5 text-[11px]" style={{ fontFamily: MONO }}>
          {it.size}
        </div>
      </div>
    </div>
  );
}

function HistoryScreen() {
  return (
    <>
      <PMAppBar big title="Histórico" />
      <div className="pm-screen flex-1 overflow-auto px-4 pb-5 pt-1">
        {MHISTORY.map((grp, gi) => (
          <div key={grp.day} className={gi === 0 ? "mt-1.5" : "mt-[18px]"}>
            <PMSectionLabel>{grp.day}</PMSectionLabel>
            <PMCard>
              {grp.items.map((it, i) => (
                <Item key={`${it.name}-${it.time}`} it={it} isLast={i === grp.items.length - 1} />
              ))}
            </PMCard>
          </div>
        ))}
      </div>
    </>
  );
}
