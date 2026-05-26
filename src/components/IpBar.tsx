import { cn } from '../lib/utils'
import { usePigeon } from '../context/PigeonContext'

export function IpBar() {
  const { localIp, serverRunning } = usePigeon()

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-2.5">
      <span className="island-kicker">Meu IP</span>
      <code className="flex-1 font-mono text-[15px] font-semibold text-[var(--lagoon-deep)]">
        {localIp}
      </code>
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full transition-colors duration-300',
          serverRunning
            ? 'bg-[#2ea043] shadow-[0_0_0_3px_rgba(46,160,67,0.22)] animate-pulse'
            : 'bg-[var(--sea-ink-soft)] opacity-50',
        )}
      />
      <span className="text-xs text-[var(--sea-ink-soft)]">
        {serverRunning ? 'escutando' : 'parado'}
      </span>
    </div>
  )
}
