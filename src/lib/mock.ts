export type DeviceKind = "laptop" | "phone" | "tablet" | "desktop";
export type PeerStatus = "online" | "idle" | "offline";
export type Tint = "coral" | "sun" | "mint" | "sky" | "lilac";

export type Peer = {
  id: string;
  name: string;
  device: string;
  kind: DeviceKind;
  status: PeerStatus;
  distance: string;
  tint: Tint;
  mono: string;
};

export type MockFile = {
  name: string;
  ext: string;
  size: string;
  badge?: string;
};

export const MFILES: MockFile[] = [
  { name: "Proposta-Comercial-2026.pdf", ext: "pdf", size: "2,4 MB" },
  { name: "Protótipo-App-v3.fig", ext: "zip", size: "18,7 MB" },
  { name: "reunião-cliente.mp4", ext: "mp4", size: "124 MB" },
  { name: "fotos-evento", ext: "zip", size: "340 MB", badge: "47 itens" },
];

export const TOTAL_SIZE = "485 MB";
