import { createFileRoute } from "@tanstack/react-router";

import { FileIcon } from "@/components/pigeon/atoms";
import { PMAppBar, PMCard, PMSectionLabel } from "@/components/pigeon/mobile";
import { useReceivedFiles } from "@/hooks/use-received";
import { openPath, revealPath, safOpenDir, safOpenPath } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { addLog } from "@/lib/log-store";
import type { HistoryRecord } from "@/lib/history-db";
import { getSafDir } from "@/lib/receive-config";

const MONO = '"Geist Mono", ui-monospace, monospace';

export const Route = createFileRoute("/_frame/recebidos")({
  component: ReceivedScreen,
});

function when(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isAndroid = /android/i.test(navigator.userAgent);

function open(file: HistoryRecord) {
  const warn = (e: unknown) =>
    addLog("warn", "receive", `abrir falhou: ${String(e)}`);

  if (isAndroid) {
    const saf = getSafDir();
    if (saf) {
      void safOpenDir(saf).catch(warn);
      return;
    }
    if (file.path) {
      void safOpenPath(file.path).catch(warn);
      return;
    }
    addLog("warn", "receive", "sem pasta para abrir");
    return;
  }

  if (file.path) {
    const path = file.path;
    void revealPath(path)
      .catch(() => openPath(path))
      .catch(warn);
    return;
  }
  addLog("warn", "receive", "sem caminho para abrir");
}

function Item({ file, isLast }: { file: HistoryRecord; isLast?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => open(file)}
      className={
        "flex w-full items-center gap-3 px-3 py-3 text-left" +
        (isLast ? "" : " border-border border-b")
      }
    >
      <FileIcon ext={file.ext} size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate text-sm font-semibold">
          {file.name}
        </div>
        <div
          className="text-muted-foreground mt-0.5 truncate text-[11.5px]"
          style={{ fontFamily: MONO }}
        >
          de {file.peer} · {when(file.ts)}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: MONO }}
        >
          {formatBytes(file.size)}
        </span>
        {(file.uri || file.path) && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0 1 14 6v6.5A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5z" />
          </svg>
        )}
      </div>
    </button>
  );
}

function ReceivedScreen() {
  const { data: files = [], isLoading } = useReceivedFiles();

  return (
    <>
      <PMAppBar big title="Recebidos" />
      <div className="pm-screen flex-1 overflow-auto px-4 pb-5 pt-1">
        {isLoading ? (
          <div className="text-muted-foreground mt-10 text-center text-[13px]">
            Carregando…
          </div>
        ) : files.length === 0 ? (
          <EmptyReceived />
        ) : (
          <div className="mt-1.5">
            <PMSectionLabel right={`${files.length}`}>Arquivos</PMSectionLabel>
            <PMCard>
              {files.map((f, i) => (
                <Item
                  key={f.id ?? `${f.name}-${f.ts}`}
                  file={f}
                  isLast={i === files.length - 1}
                />
              ))}
            </PMCard>
            <div className="text-muted-foreground mt-3 px-1.5 text-center text-[11.5px]">
              Toque para mostrar o arquivo na pasta.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyReceived() {
  return (
    <div className="flex flex-col items-center justify-center px-8 pt-24 text-center">
      <div
        className="text-muted-foreground bg-card border-border flex size-16 items-center justify-center rounded-2xl border"
        style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v7M5 6.5l3 3 3-3M3 13h10" />
        </svg>
      </div>
      <div className="text-foreground mt-4 text-[15px] font-bold">
        Nenhum arquivo recebido
      </div>
      <div className="text-muted-foreground mt-1 max-w-[260px] text-[13px] leading-[1.5]">
        Os arquivos que chegarem de outros dispositivos vão aparecer aqui.
      </div>
    </div>
  );
}
