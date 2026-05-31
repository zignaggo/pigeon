import { useCallback, useRef, useState } from "react";

import type { LogEntry } from "../lib/types";

export function useLogs(max = 20) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  const log = useCallback(
    (text: string) => {
      const id = ++idRef.current;
      const ts = new Date().toLocaleTimeString();
      setLogs((prev) => [{ id, ts, text }, ...prev].slice(0, max));
    },
    [max],
  );

  return { logs, log };
}
