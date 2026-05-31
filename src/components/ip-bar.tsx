import { cn } from '../lib/utils'
import { usePigeon } from '../context/pigeon-context'

export function IpBar() {
  const { localIp, serverRunning } = usePigeon()

  return (
    <div className="border-border bg-card flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5">
      <span className="island-kicker">Meu IP</span>
      <code className="text-primary flex-1 font-mono text-[15px] font-semibold">
        {localIp}
      </code>
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full transition-colors duration-300',
          serverRunning
            ? 'bg-chart-3 ring-chart-3/25 animate-pulse ring-[3px]'
            : 'bg-muted-foreground opacity-50',
        )}
      />
      <span className="text-muted-foreground text-xs">
        {serverRunning ? 'escutando' : 'parado'}
      </span>
    </div>
  )
}
