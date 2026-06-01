import { useQueryClient } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { sendFile } from "@/lib/api";
import { addHistory } from "@/lib/history-db";
import { addLog } from "@/lib/log-store";
import { getPeerById } from "@/lib/peers-store";
import {
  getTransfer,
  subscribe,
  transferBegin,
  transferDone,
  transferError,
  transferProgress,
} from "@/lib/transfer-store";
import type { TransferState } from "@/lib/transfer-store";

function extOf(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase();
}

export function useTransferEvents(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subs = [
      listen<{ bytes_sent: number; total: number }>("send-progress", (e) =>
        transferProgress(e.payload.bytes_sent, e.payload.total),
      ),
      listen<{ name: string; target: string }>("send-done", (e) => {
        const snap = getTransfer();
        transferDone();
        addLog("event", "transfer", `enviado: ${e.payload.name}`);
        const peer = getPeerById(snap.peerId)?.nick || snap.ip;
        void addHistory({
          dir: "out",
          name: snap.name || e.payload.name,
          ext: extOf(snap.name || e.payload.name),
          peer,
          size: snap.total,
          ts: Date.now(),
        }).then(() => queryClient.invalidateQueries({ queryKey: ["history"] }));
      }),
    ];
    return () => {
      for (const sub of subs) void sub.then((un) => un());
    };
  }, [queryClient]);
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
