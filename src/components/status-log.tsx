import { usePigeon } from "../context/pigeon-context";

export function StatusLog() {
  const { logs } = usePigeon();

  return (
    <section>
      <span className="island-kicker">Status</span>
      <div className="border-border bg-card mt-1.5 flex max-h-[180px] flex-col gap-1.5 overflow-y-auto rounded-xl border px-3 py-2.5 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-muted-foreground m-0 opacity-70">
            nenhum evento ainda
          </p>
        ) : (
          logs.map((l) => (
            <div
              key={l.id}
              className="animate-in fade-in slide-in-from-top-1 text-foreground flex gap-2 duration-300"
            >
              <span className="text-muted-foreground shrink-0">{l.ts}</span>
              <span>{l.text}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
