import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect, useRef, useState } from "react";

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

export function useFileDrop(onDrop: (paths: string[]) => void): boolean {
  const [over, setOver] = useState(false);
  const handler = useRef(onDrop);
  handler.current = onDrop;

  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    void getCurrentWebview()
      .onDragDropEvent((event) => {
        const payload = event.payload;
        if (payload.type === "drop") {
          setOver(false);
          if (payload.paths.length > 0) handler.current(payload.paths);
        } else if (payload.type === "leave") {
          setOver(false);
        } else {
          setOver(true);
        }
      })
      .then((un) => {
        unlisten = un;
      })
      .catch(() => {});
    return () => unlisten?.();
  }, []);

  return over;
}
