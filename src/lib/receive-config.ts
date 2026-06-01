import type { SafDir } from "./types";

const SAVE_DIR_KEY = "pigeon:save-dir";
const SAF_DIR_KEY = "pigeon:saf-dir";
const SOUND_KEY = "pigeon:receive-sound";

export function getSaveDir(): string | null {
  return localStorage.getItem(SAVE_DIR_KEY);
}

export function setSaveDir(path: string): void {
  localStorage.setItem(SAVE_DIR_KEY, path);
}

export function getSafDir(): SafDir | null {
  const raw = localStorage.getItem(SAF_DIR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafDir;
  } catch {
    return null;
  }
}

export function setSafDir(dir: SafDir): void {
  localStorage.setItem(SAF_DIR_KEY, JSON.stringify(dir));
}

export function getSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== "0";
}

export function setSoundEnabled(value: boolean): void {
  localStorage.setItem(SOUND_KEY, value ? "1" : "0");
}
