import type { DeviceKind, Peer, Tint } from "./mock";
import type { DiscoveredPeer } from "./types";
import { initialsOf } from "./utils";

const TINTS: Tint[] = ["coral", "sun", "mint", "sky", "lilac"];

function tintFor(id: string): Tint {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

function kindFor(platform: string): DeviceKind {
  switch (platform) {
    case "android":
    case "ios":
      return "phone";
    case "macos":
      return "laptop";
    case "windows":
    case "linux":
    default:
      return "desktop";
  }
}

export function toUiPeer(discovered: DiscoveredPeer): Peer {
  return {
    id: discovered.id,
    name: discovered.nick,
    device: discovered.ip,
    kind: kindFor(discovered.platform),
    status: "online",
    distance: "wi-fi",
    tint: tintFor(discovered.id),
    mono: initialsOf(discovered.nick),
  };
}
