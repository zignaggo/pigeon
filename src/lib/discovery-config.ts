export type DiscoveryMode = "multicast" | "scan";

const MODE_KEY = "pigeon:discovery-mode";
const THRESHOLD_KEY = "pigeon:discovery-threshold";

export const DEFAULT_THRESHOLD = 30;

export function getDiscoveryMode(): DiscoveryMode {
  return localStorage.getItem(MODE_KEY) === "scan" ? "scan" : "multicast";
}

export function setDiscoveryMode(mode: DiscoveryMode): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function getThreshold(): number {
  const value = Number(localStorage.getItem(THRESHOLD_KEY));
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_THRESHOLD;
}

export function setThreshold(value: number): void {
  localStorage.setItem(THRESHOLD_KEY, String(value));
}
