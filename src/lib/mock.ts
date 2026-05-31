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

export type HistoryItem = {
  dir: "out" | "in";
  name: string;
  ext: string;
  peer: string;
  time: string;
  size: string;
};

export const MHISTORY: { day: string; items: HistoryItem[] }[] = [
  {
    day: "Hoje",
    items: [
      {
        dir: "out",
        name: "Proposta-Comercial-2026.pdf",
        ext: "pdf",
        peer: "Ana Martins",
        time: "14:32",
        size: "2,4 MB",
      },
      {
        dir: "in",
        name: "briefing-marca.zip",
        ext: "zip",
        peer: "Bruno",
        time: "11:08",
        size: "64 MB",
      },
    ],
  },
  {
    day: "Ontem",
    items: [
      {
        dir: "out",
        name: "reunião-cliente.mp4",
        ext: "mp4",
        peer: "Cecília",
        time: "19:47",
        size: "124 MB",
      },
      {
        dir: "in",
        name: "fotos-viagem",
        ext: "jpg",
        peer: "Elena",
        time: "16:20",
        size: "208 MB",
      },
      {
        dir: "out",
        name: "contrato-final.pdf",
        ext: "pdf",
        peer: "Diego Fernandes",
        time: "09:15",
        size: "1,1 MB",
      },
    ],
  },
];
