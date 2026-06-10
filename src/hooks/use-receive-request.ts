import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { respondToRequest } from "@/lib/api";
import { addLog } from "@/lib/log-store";
import {
  clearRequest,
  getRequest,
  setRequest,
  subscribe,
} from "@/lib/request-store";
import type { IncomingRequest } from "@/lib/request-store";
import type { ReceiveRequestPayload } from "@/lib/types";

export function useReceiveRequest(): void {
  useEffect(() => {
    const sub = listen<ReceiveRequestPayload>("receive-request", (e) => {
      const current = getRequest();
      if (current) {
        void respondToRequest(e.payload.id, false);
        return;
      }
      setRequest({
        id: e.payload.id,
        name: e.payload.name,
        size: e.payload.size,
        from: e.payload.from,
      });
    });
    return () => {
      void sub.then((un) => un());
    };
  }, []);
}

export function useIncomingRequest(): IncomingRequest | null {
  return useSyncExternalStore(subscribe, getRequest, getRequest);
}

export async function acceptRequest(id: number): Promise<void> {
  await respondToRequest(id, true);
  addLog("event", "receive", "solicitação aceita");
  clearRequest();
}

export async function declineRequest(id: number): Promise<void> {
  await respondToRequest(id, false);
  addLog("event", "receive", "solicitação recusada");
  clearRequest();
}
