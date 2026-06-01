import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";

import type { SafDir } from "./types";

export const getLocalIp = () => invoke<string>("get_local_ip");

export const getDefaultSaveDir = () => invoke<string>("default_save_dir");

export const startServer = (saveDir: string) =>
  invoke<void>("start_server", { saveDir });

export const stopServer = () => invoke<void>("stop_server");

export const sendFile = (targetIp: string, filePath: string) =>
  invoke<void>("send_file", { targetIp, filePath });

export const openPath = (path: string) => invoke<void>("open_path", { path });

export const revealPath = (path: string) =>
  invoke<void>("reveal_path", { path });

export const startDiscovery = (
  nick: string,
  deviceId: string,
  mode: string,
  threshold: number,
) => invoke<void>("start_discovery", { nick, deviceId, mode, threshold });

export const stopDiscovery = () => invoke<void>("stop_discovery");

export const setNick = (nick: string) => invoke<void>("set_nick", { nick });

async function pickPath(directory: boolean): Promise<string | null> {
  const selected = await openDialog({ directory, multiple: false });
  if (typeof selected === "string") return selected;
  if (selected && typeof selected === "object" && "path" in selected) {
    return (selected as { path: string }).path;
  }
  return null;
}

export const pickDirectory = () => pickPath(true);
export const pickFile = () => pickPath(false);

// SAF (Android): picker de árvore de diretório + import do arquivo recebido.
export const safPickDir = () => invoke<SafDir | null>("saf_pick_dir");

export const safImportFile = (dir: SafDir, srcPath: string, name: string) =>
  invoke<void>("saf_import_file", { dir, srcPath, name });

export const safPickFile = () =>
  invoke<{ path: string; name: string } | null>("saf_pick_file");

export type OutgoingFile = { path: string; name: string };

export async function pickOutgoingFile(): Promise<OutgoingFile | null> {
  if (/android/i.test(navigator.userAgent)) {
    return (await safPickFile()) ?? null;
  }
  const path = await pickFile();
  if (!path) return null;
  const name = path.split(/[\\/]/).pop() || path;
  return { path, name };
}
