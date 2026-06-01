import { useEffect } from "react";

import { getDefaultSaveDir, startServer, stopServer } from "@/lib/api";
import { addLog } from "@/lib/log-store";
import { getSaveDir } from "@/lib/receive-config";

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

async function resolveSaveDir(): Promise<string> {
  if (!isAndroid()) {
    const custom = getSaveDir();
    if (custom) return custom;
  }
  return getDefaultSaveDir();
}

export function useServer(): void {
  useEffect(() => {
    void (async () => {
      try {
        const dir = await resolveSaveDir();
        await startServer(dir);
        addLog("info", "server", `escutando 7878 · salvando em ${dir}`);
      } catch (e) {
        addLog("error", "server", `start falhou: ${String(e)}`);
      }
    })();
  }, []);
}

export async function restartServer(): Promise<void> {
  try {
    await stopServer();
    const dir = await resolveSaveDir();
    await startServer(dir);
    addLog("info", "server", `pasta atualizada · salvando em ${dir}`);
  } catch (e) {
    addLog("error", "server", `restart falhou: ${String(e)}`);
  }
}
