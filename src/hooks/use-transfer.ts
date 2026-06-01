import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { sendFile } from "@/lib/api";
import { addLog } from "@/lib/log-store";
import {
  getTransfer,
  subscribe,
  transferBegin,
  transferDone,
  transferError,
  transferProgress,
} from "@/lib/transfer-store";
import type { TransferState } from "@/lib/transfer-store";

export function useTransferEvents(): void {
  useEffect(() => {
    const subs = [
      listen<{ bytes_sent: number; total: number }>("send-progress", (e) =>
        transferProgress(e.payload.bytes_sent, e.payload.total),
      ),
      listen<{ name: string; target: string }>("send-done", (e) => {
        transferDone();
        addLog("event", "transfer", `enviado: ${e.payload.name}`);
      }),
    ];
    return () => {
      for (const sub of subs) void sub.then((un) => un());
    };
  }, []);
}

export function useTransfer(): TransferState {
  return useSyncExternalStore(subscribe, getTransfer, getTransfer);
}

export async function startSend(
  peerId: string,
  ip: string,
  path: string,
  name: string,
): Promise<void> {
  transferBegin({ peerId, ip, path, name });
  addLog("info", "transfer", `enviando ${name} → ${ip}`);
  try {
    await sendFile(ip, path);
    transferDone();
  } catch (e) {
    transferError(String(e));
    addLog("error", "transfer", `envio falhou: ${String(e)}`);
  }
}
