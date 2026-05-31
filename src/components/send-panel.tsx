import { Panel, FieldLabel } from "./panel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { fileNameOf, formatBytes } from "../lib/format";
import { usePigeon } from "../context/pigeon-context";

export function SendPanel() {
  const {
    targetIp,
    filePath,
    sending,
    progress,
    setTargetIp,
    setFilePath,
    pickFile,
    send,
  } = usePigeon();

  const pct =
    progress && progress.total
      ? Math.min(100, Math.round((progress.sent / progress.total) * 100))
      : 0;

  return (
    <Panel
      title="Enviar"
      className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-200 duration-500"
    >
      <FieldLabel>IP do destinatário</FieldLabel>
      <Input
        placeholder="192.168.1.x"
        value={targetIp}
        inputMode="decimal"
        onChange={(e) => setTargetIp(e.target.value)}
      />

      <FieldLabel>Arquivo</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          placeholder="/caminho/do/arquivo"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
        />
        <Button variant="ghost" onClick={pickFile}>
          Escolher…
        </Button>
      </div>
      {filePath && (
        <p className="animate-in fade-in slide-in-from-top-1 text-primary m-0 break-all text-xs font-semibold duration-300">
          📎 {fileNameOf(filePath)}
        </p>
      )}

      <Button variant="send" onClick={send} disabled={sending}>
        {sending ? "Enviando…" : "Enviar arquivo"}
      </Button>

      {progress && (
        <div className="animate-in fade-in border-border bg-background relative h-[26px] overflow-hidden rounded-lg border duration-300">
          <div
            className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--primary),var(--chart-2))] transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
          <span className="text-foreground relative block text-center text-xs font-semibold leading-[26px]">
            {formatBytes(progress.sent)} / {formatBytes(progress.total)} · {pct}
            %
          </span>
        </div>
      )}
    </Panel>
  );
}
