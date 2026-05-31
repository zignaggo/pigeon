export type LogLevel = "info" | "warn" | "error" | "event";

export type DebugLog = {
  id: number;
  ts: number;
  level: LogLevel;
  source: string;
  message: string;
};

const MAX = 500;
let logs: DebugLog[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function addLog(level: LogLevel, source: string, message: string): void {
  logs = [...logs, { id: nextId++, ts: Date.now(), level, source, message }].slice(
    -MAX,
  );
  emit();
}

export function clearLogs(): void {
  logs = [];
  emit();
}

export function getLogs(): DebugLog[] {
  return logs;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

let consolePatched = false;

export function captureConsole(): void {
  if (consolePatched) return;
  consolePatched = true;
  const methods: [LogLevel, "log" | "info" | "warn" | "error"][] = [
    ["info", "log"],
    ["info", "info"],
    ["warn", "warn"],
    ["error", "error"],
  ];
  for (const [level, method] of methods) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      try {
        addLog(level, "console", args.map(stringify).join(" "));
      } catch {
        void 0;
      }
      original(...args);
    };
  }
}
