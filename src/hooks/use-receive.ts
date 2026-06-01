import { useQueryClient } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { useEffect, useSyncExternalStore } from "react";

import { safImportFile } from "@/lib/api";
import { fileNameOf } from "@/lib/format";
import { addHistory } from "@/lib/history-db";
import { addLog } from "@/lib/log-store";
import { getPeerByIp } from "@/lib/peers-store";
import { getSafDir, getSoundEnabled } from "@/lib/receive-config";
import {
  getReceive,
  receiveDone,
  receiveProgress,
  receiveReset,
  receiveStarted,
  subscribe,
} from "@/lib/receive-store";
import type { ReceiveState } from "@/lib/receive-store";
import { playReceiveChime } from "@/lib/sound";

let resetTimer: ReturnType<typeof setTimeout> | null = null;

async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (await isPermissionGranted()) return true;
    return (await requestPermission()) === "granted";
  } catch {
    return false;
  }
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

function peerLabel(from: string): string {
  const ip = from.includes(":") ? from.slice(0, from.lastIndexOf(":")) : from;
  return getPeerByIp(ip)?.nick ?? ip;
}

function extOf(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase();
}

export function useReceive(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    void ensureNotificationPermission();

    const subs = [
      listen<{ name: string; size: number; from: string }>(
        "receive-started",
        (e) => receiveStarted(e.payload.name, peerLabel(e.payload.from), e.payload.size),
      ),
      listen<{ name: string; received: number; total: number }>(
        "receive-progress",
        (e) => receiveProgress(e.payload.received, e.payload.total),
      ),
      listen<{ path: string }>("receive-done", (e) => {
        const snap = getReceive();
        const name = snap.name || fileNameOf(e.payload.path);
        receiveDone();

        if (getSoundEnabled()) playReceiveChime();
        if (document.hidden) {
          void ensureNotificationPermission().then((granted) => {
            if (granted) {
              sendNotification({ title: "Pigeon", body: `Arquivo recebido: ${name}` });
            }
          });
        }

        void addHistory({
          dir: "in",
          name,
          ext: extOf(name),
          peer: snap.from || "rede",
          size: snap.total,
          ts: Date.now(),
          path: e.payload.path,
        }).then(() => {
          void queryClient.invalidateQueries({ queryKey: ["history"] });
          void queryClient.invalidateQueries({ queryKey: ["received"] });
        });

        if (isAndroid()) {
          const saf = getSafDir();
          if (saf) {
            void safImportFile(saf, e.payload.path, name)
              .then(() => addLog("event", "receive", `salvo na pasta: ${name}`))
              .catch((err) =>
                addLog("error", "receive", `mover p/ pasta falhou: ${String(err)}`),
              );
          }
        }

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(receiveReset, 4000);
      }),
    ];

    return () => {
      for (const sub of subs) void sub.then((un) => un());
    };
  }, [queryClient]);
}

export function useReceiveState(): ReceiveState {
  return useSyncExternalStore(subscribe, getReceive, getReceive);
}
