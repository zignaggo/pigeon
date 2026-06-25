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
