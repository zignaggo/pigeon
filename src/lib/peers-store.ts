import type { DiscoveredPeer } from "./types";

let peers: DiscoveredPeer[] = [];
const listeners = new Set<() => void>();

export function setPeers(next: DiscoveredPeer[]): void {
  peers = next;
  for (const listener of listeners) listener();
}

export function getPeers(): DiscoveredPeer[] {
  return peers;
}

export function getPeerById(id: string): DiscoveredPeer | undefined {
  return peers.find((peer) => peer.id === id);
}

export function getPeerByIp(ip: string): DiscoveredPeer | undefined {
  return peers.find((peer) => peer.ip === ip);
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
