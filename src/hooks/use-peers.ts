import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { startDiscovery, stopDiscovery } from "@/lib/api";
import { getDeviceId } from "@/lib/device-id";
import { addLog } from "@/lib/log-store";
import { getNick } from "@/lib/nick";
import { getPeers, setPeers, subscribe } from "@/lib/peers-store";
import type { DiscoveredPeer } from "@/lib/types";

export function useDiscovery(): void {
  useEffect(() => {
    const unlisten = listen<{ peers: DiscoveredPeer[] }>("peers", (event) => {
      setPeers(event.payload.peers);
      addLog("event", "discovery", `peers: ${event.payload.peers.length}`);
    });

    const nick = getNick() ?? "";
    const deviceId = getDeviceId();
    addLog("info", "discovery", `start nick=${nick} id=${deviceId.slice(0, 8)}`);
    void startDiscovery(nick, deviceId).catch((e) =>
      addLog("error", "discovery", `start falhou: ${String(e)}`),
    );

    return () => {
      void unlisten.then((stop) => stop());
      void stopDiscovery().catch(() => {});
      setPeers([]);
      addLog("info", "discovery", "stop");
    };
  }, []);
}

export function usePeers(): DiscoveredPeer[] {
  return useSyncExternalStore(subscribe, getPeers, getPeers);
}
