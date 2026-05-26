import { usePigeon } from '../context/PigeonContext'

export function StatusLog() {
  const { logs } = usePigeon()

  return (
    <section>
      <span className="island-kicker">Status</span>
      <div className="mt-1.5 flex max-h-[180px] flex-col gap-1.5 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="m-0 text-[var(--sea-ink-soft)] opacity-70">nenhum evento ainda</p>
        ) : (
          logs.map((l) => (
            <div
              key={l.id}
              className="animate-in fade-in slide-in-from-top-1 flex gap-2 text-[var(--sea-ink)] duration-300"
            >
              <span className="shrink-0 text-[var(--sea-ink-soft)]">{l.ts}</span>
              <span>{l.text}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
