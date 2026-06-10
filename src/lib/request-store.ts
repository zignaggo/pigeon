export type IncomingRequest = {
  id: number;
  name: string;
  size: number;
  from: string;
};

let state: IncomingRequest | null = null;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getRequest(): IncomingRequest | null {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setRequest(request: IncomingRequest): void {
  state = request;
  emit();
}

export function clearRequest(): void {
  state = null;
  emit();
}
