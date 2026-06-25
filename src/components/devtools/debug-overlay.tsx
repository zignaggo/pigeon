import { useState } from "react";

import { useDebugLogs } from "@/hooks/use-debug";
import { useLocalIp } from "@/hooks/use-local-ip";
import { restartDiscovery, usePeers } from "@/hooks/use-peers";
import { getDeviceId } from "@/lib/device-id";
import { clearLogs, getLogs, type LogLevel } from "@/lib/log-store";
import { getNick } from "@/lib/nick";

const MONO = '"Geist Mono", ui-monospace, monospace';

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: "var(--muted-foreground)",
  warn: "var(--chart-2)",
  error: "#ff7a7a",
  event: "var(--primary)",
};

function platformLabel(): string {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad/i.test(ua)) return "ios";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os/i.test(ua)) return "macos";
  return "linux";
}

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

function time(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false });
}

export function DebugOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir debug"
        onClick={() => setOpen(true)}
        className="bg-card/90 border-border text-muted-foreground absolute right-3 bottom-[88px] z-50 flex size-11 items-center justify-center rounded-full border shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7l4 4-4 4M12 17h8" />
        </svg>
      </button>
      {open && <DebugPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function DebugPanel({ onClose }: { onClose: () => void }) {
  const logs = useDebugLogs();
  const peers = usePeers();
  const { data: localIpData, isError: localIpError } = useLocalIp();
  const localIp = localIpError ? "indisponível" : (localIpData ?? "—");
  const [rescanning, setRescanning] = useState(false);

  const rescan = async () => {
    setRescanning(true);
    try {
      await Promise.race([
        restartDiscovery(),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    } finally {
      setRescanning(false);
    }
  };

  const copy = () => {
    const text = getLogs()
      .map((l) => `${time(l.ts)} [${l.level}] ${l.source}: ${l.message}`)
      .join("\n");
    void navigator.clipboard?.writeText(text).catch(() => void 0);
  };

  return (
    <div className="bg-background absolute inset-0 z-50 flex flex-col">
      <div
        className="bg-card/80 border-border flex shrink-0 items-center gap-2 border-b pr-3 pl-4 backdrop-blur-md"
        style={{ paddingTop: 22, paddingBottom: 12 }}
      >
        <div className="flex-1">
          <div className="text-foreground text-[17px] font-extrabold">Debug</div>
          <div
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: MONO }}
          >
            {logs.length} logs
          </div>
        </div>
        <button
          type="button"
          aria-label="Limpar logs"
          onClick={clearLogs}
          className="border-border bg-card text-muted-foreground rounded-[12px] border px-3 py-2 text-[12px] font-semibold"
        >
          Limpar
        </button>
        <button
          type="button"
          aria-label="Copiar logs"
          onClick={copy}
          className="border-border bg-card text-muted-foreground rounded-[12px] border px-3 py-2 text-[12px] font-semibold"
        >
          Copiar
        </button>
        <button
          type="button"
          aria-label="Fechar debug"
          onClick={onClose}
          className="text-primary flex size-10 items-center justify-center"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>
      </div>

      <div
        className="border-border grid shrink-0 grid-cols-2 gap-x-4 gap-y-1.5 border-b px-4 py-3 text-[12px]"
        style={{ fontFamily: MONO }}
      >
        <Info label="nick" value={getNick() ?? "—"} />
        <Info label="device" value={getDeviceId().slice(0, 8)} />
        <Info label="ip" value={localIp} />
        <Info label="plataforma" value={platformLabel()} />
        <Info label="tauri" value={isTauri() ? "sim" : "não (browser)"} />
        <Info label="peers" value={String(peers.length)} />
      </div>

      <div className="border-border shrink-0 border-b px-4 py-2.5">
        <button
          type="button"
          onClick={rescan}
          disabled={rescanning}
          className="bg-primary flex w-full items-center justify-center gap-2 rounded-[12px] border-none py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={rescanning ? "animate-spin" : undefined}
          >
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" />
          </svg>
          {rescanning ? "Rodando…" : "Rodar descoberta de novo"}
        </button>
      </div>

      <div
        className="flex-1 overflow-auto px-3 py-2 text-[11.5px] leading-[1.5]"
        style={{ fontFamily: MONO }}
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center">
            Sem logs ainda.
          </div>
        ) : (
          logs
            .slice()
            .reverse()
            .map((l) => (
              <div key={l.id} className="flex gap-2 py-0.5">
                <span className="text-muted-foreground shrink-0 opacity-70">
                  {time(l.ts)}
                </span>
                <span
                  className="shrink-0 font-bold"
                  style={{ color: LEVEL_COLOR[l.level] }}
                >
                  {l.source}
                </span>
                <span className="text-foreground break-all">{l.message}</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 truncate">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}
