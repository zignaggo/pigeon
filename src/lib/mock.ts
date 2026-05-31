// Mocked sample data for the Pigeon design screens (see docs/design/CONTEXT.md).
// Stand-in until the screens are wired to the real transfer backend.
import { initialsOf } from "./utils";

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

export const PEERS: Peer[] = [
  {
    id: "ana",
    name: "Ana Martins",
    device: "MacBook da Ana",
    kind: "laptop",
    status: "online",
    distance: "mesma sala",
    tint: "coral",
    mono: initialsOf("Ana Martins"),
  },
  {
    id: "bruno",
    name: "Bruno",
    device: "Galaxy S24",
    kind: "phone",
    status: "online",
    distance: "wi-fi · 2 m",
    tint: "sun",
    mono: initialsOf("Bruno"),
  },
  {
    id: "ceci",
    name: "Cecília",
    device: "iPad Pro",
    kind: "tablet",
    status: "online",
    distance: "wi-fi",
    tint: "mint",
    mono: initialsOf("Cecília"),
  },
  {
    id: "diego",
    name: "Diego Fernandes",
    device: "ThinkPad-T14",
    kind: "laptop",
    status: "idle",
    distance: "wi-fi",
    tint: "sky",
    mono: initialsOf("Diego Fernandes"),
  },
  {
    id: "elena",
    name: "Elena",
    device: "PC-do-Escritório",
    kind: "desktop",
    status: "online",
    distance: "ethernet",
    tint: "lilac",
    mono: initialsOf("Elena"),
  },
];

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
