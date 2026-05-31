import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { addLog, captureConsole, getLogs, subscribe } from "@/lib/log-store";
import type { DebugLog } from "@/lib/log-store";

export function useDebugSetup(): void {
  useEffect(() => {
    captureConsole();
    const subs = [
      listen<{ name: string; size: number; from: string }>(
        "receive-started",
        (e) =>
          addLog(
            "event",
            "transfer",
            `recebendo ${e.payload.name} (${e.payload.size} B) de ${e.payload.from}`,
          ),
      ),
      listen<{ path: string }>("receive-done", (e) =>
        addLog("event", "transfer", `recebido → ${e.payload.path}`),
      ),
      listen<{ message: string }>("error", (e) =>
        addLog("error", "backend", e.payload.message),
      ),
      listen<{ message: string }>("discovery-log", (e) =>
        addLog("event", "net", e.payload.message),
      ),
    ];
    return () => {
      for (const sub of subs) void sub.then((un) => un());
    };
  }, []);
}

export function useDebugLogs(): DebugLog[] {
  return useSyncExternalStore(subscribe, getLogs, getLogs);
}
