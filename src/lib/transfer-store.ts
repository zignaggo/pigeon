export type TransferStatus = "idle" | "sending" | "done" | "error";

export type TransferState = {
  status: TransferStatus;
  peerId: string;
  ip: string;
  path: string;
  name: string;
  sent: number;
  total: number;
  error: string | null;
};

let state: TransferState = {
  status: "idle",
  peerId: "",
  ip: "",
  path: "",
  name: "",
  sent: 0,
  total: 0,
  error: null,
};

const listeners = new Set<() => void>();

function set(patch: Partial<TransferState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function getTransfer(): TransferState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function transferBegin(intent: {
  peerId: string;
  ip: string;
  path: string;
  name: string;
}): void {
  set({ ...intent, status: "sending", sent: 0, total: 0, error: null });
}

export function transferProgress(sent: number, total: number): void {
  set({ status: "sending", sent, total });
}

export function transferDone(): void {
  set({ status: "done" });
}

export function transferError(error: string): void {
  set({ status: "error", error });
}
