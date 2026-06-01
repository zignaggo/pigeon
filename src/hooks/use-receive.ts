import { listen } from "@tauri-apps/api/event";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { useEffect } from "react";

import { safImportFile } from "@/lib/api";
import { fileNameOf } from "@/lib/format";
import { addLog } from "@/lib/log-store";
import { getSafDir, getSoundEnabled } from "@/lib/receive-config";
import { playReceiveChime } from "@/lib/sound";

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

export function useReceive(): void {
  useEffect(() => {
    void ensureNotificationPermission();

    const unlisten = listen<{ path: string }>("receive-done", (event) => {
      const name = fileNameOf(event.payload.path);

      if (getSoundEnabled()) playReceiveChime();

      if (document.hidden) {
        void ensureNotificationPermission().then((granted) => {
          if (granted) {
            sendNotification({
              title: "Pigeon",
              body: `Arquivo recebido: ${name}`,
            });
          }
        });
      }

      if (isAndroid()) {
        const saf = getSafDir();
        if (saf) {
          void safImportFile(saf, event.payload.path, name)
            .then(() => addLog("event", "receive", `salvo na pasta: ${name}`))
            .catch((e) =>
              addLog("error", "receive", `mover p/ pasta falhou: ${String(e)}`),
            );
        }
      }
    });

    return () => {
      void unlisten.then((stop) => stop());
    };
  }, []);
}
