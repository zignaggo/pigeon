export type ReceiveStatus = "idle" | "receiving" | "done";

export type ReceiveState = {
  status: ReceiveStatus;
  name: string;
  from: string;
  received: number;
  total: number;
};

let state: ReceiveState = {
  status: "idle",
  name: "",
  from: "",
  received: 0,
  total: 0,
};

const listeners = new Set<() => void>();

function set(patch: Partial<ReceiveState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function getReceive(): ReceiveState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function receiveStarted(name: string, from: string, total: number): void {
  set({ status: "receiving", name, from, total, received: 0 });
}

export function receiveProgress(received: number, total: number): void {
  set({ status: "receiving", received, total });
}

export function receiveDone(): void {
  set({ status: "done" });
}

export function receiveReset(): void {
  set({ status: "idle", name: "", from: "", received: 0, total: 0 });
}
