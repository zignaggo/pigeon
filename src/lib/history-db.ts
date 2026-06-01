import type { HistoryDirection } from "./types";

export type HistoryRecord = {
  id?: number;
  dir: HistoryDirection;
  name: string;
  ext: string;
  peer: string;
  size: number;
  ts: number;
  path?: string;
};

const DB_NAME = "pigeon";
const STORE = "history";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addHistory(entry: Omit<HistoryRecord, "id">): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function getHistory(): Promise<HistoryRecord[]> {
  const db = await openDb();
  try {
    const all = await new Promise<HistoryRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as HistoryRecord[]);
      req.onerror = () => reject(req.error);
    });
    return all.sort((a, b) => b.ts - a.ts);
  } finally {
    db.close();
  }
}

export async function clearHistory(): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
