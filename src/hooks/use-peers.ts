import { listen } from "@tauri-apps/api/event";
import { useEffect, useSyncExternalStore } from "react";

import { startDiscovery, stopDiscovery } from "@/lib/api";
import { getDeviceId } from "@/lib/device-id";
import { getDiscoveryMode, getThreshold } from "@/lib/discovery-config";
import { addLog } from "@/lib/log-store";
import { getNick } from "@/lib/nick";
import { getPeers, setPeers, subscribe } from "@/lib/peers-store";
import type { DiscoveredPeer } from "@/lib/types";

export function useDiscovery(): void {
  useEffect(() => {
    const nick = getNick() ?? "";
    const deviceId = getDeviceId();
    const mode = getDiscoveryMode();
    addLog("info", "discovery", `start modo=${mode} nick=${nick}`);

    const unlisten = listen<{ peers: DiscoveredPeer[] }>("peers", (event) => {
      setPeers(event.payload.peers);
      addLog("event", "discovery", `peers: ${event.payload.peers.length}`);
    });

    void startDiscovery(nick, deviceId, mode, getThreshold()).catch((e) =>
      addLog("error", "discovery", `start falhou: ${String(e)}`),
    );

    return () => {
      void unlisten.then((stop) => stop());
    };
  }, []);
}

export async function restartDiscovery(): Promise<void> {
  const mode = getDiscoveryMode();
  addLog("info", "discovery", `restart modo=${mode}`);
  setPeers([]);
  try {
    await stopDiscovery();
  } catch (e) {
    addLog("warn", "discovery", `stop: ${String(e)}`);
  }
  try {
    await startDiscovery(getNick() ?? "", getDeviceId(), mode, getThreshold());
  } catch (e) {
    addLog("error", "discovery", `restart falhou: ${String(e)}`);
  }
}

export function usePeers(): DiscoveredPeer[] {
  return useSyncExternalStore(subscribe, getPeers, getPeers);
}
