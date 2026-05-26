import { Panel, FieldLabel } from './Panel'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Switch } from './ui/Switch'
import { cn } from '../lib/utils'
import { isMobile } from '../lib/platform'
import { usePigeon } from '../context/PigeonContext'

const mobile = isMobile()

export function ReceivePanel() {
  const {
    saveDir,
    serverRunning,
    safDirName,
    setSaveDir,
    pickDir,
    pickSafDir,
    toggleServer,
  } = usePigeon()

  return (
    <Panel
      title="Receber"
      className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-100 duration-500"
    >
      <FieldLabel>Pasta de destino</FieldLabel>
      {mobile ? (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--sea-ink)]">
              {safDirName ?? 'Nenhuma pasta escolhida'}
            </div>
            <Button variant="ghost" onClick={pickSafDir}>
              Escolher pasta…
            </Button>
          </div>
          {!safDirName && (
            <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
              Sem uma pasta escolhida, os arquivos ficam no cache do app.
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            value={saveDir}
            onChange={(e) => setSaveDir(e.target.value)}
            disabled={serverRunning}
          />
          <Button variant="ghost" onClick={pickDir} disabled={serverRunning}>
            Escolher pasta…
          </Button>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-colors duration-300',
              serverRunning
                ? 'bg-[#2ea043] shadow-[0_0_0_3px_rgba(46,160,67,0.22)] animate-pulse'
                : 'bg-[var(--sea-ink-soft)] opacity-50',
            )}
          />
          <span className="text-sm font-semibold text-[var(--sea-ink)]">
            {serverRunning ? 'Servidor ativo · porta 7878' : 'Servidor parado'}
          </span>
        </div>
        <Switch checked={serverRunning} onChange={toggleServer} />
      </div>
    </Panel>
  )
}
