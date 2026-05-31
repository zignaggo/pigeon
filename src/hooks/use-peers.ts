import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { startDiscovery, stopDiscovery } from "@/lib/api";
import { getDeviceId } from "@/lib/device-id";
import { getNick } from "@/lib/nick";
import { getPeers, setPeers, subscribe } from "@/lib/peers-store";
import type { DiscoveredPeer } from "@/lib/types";

export function useDiscovery(): void {
  useEffect(() => {
    const unlisten = listen<{ peers: DiscoveredPeer[] }>("peers", (event) => {
      setPeers(event.payload.peers);
    });

    void startDiscovery(getNick() ?? "", getDeviceId()).catch(() => {});

    return () => {
      void unlisten.then((stop) => stop());
      void stopDiscovery().catch(() => {});
      setPeers([]);
    };
  }, []);
}

export function usePeers(): DiscoveredPeer[] {
  return useSyncExternalStore(subscribe, getPeers, getPeers);
}
