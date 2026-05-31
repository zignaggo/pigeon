export function deriveNameFromUri(uri: string): string {
  try {
    const decoded = decodeURIComponent(uri);
    const lastSlash = decoded.lastIndexOf("/");
    const tail = lastSlash >= 0 ? decoded.slice(lastSlash + 1) : decoded;
    const cleaned = tail
      .split("?")[0]
      .split("#")[0]
      .replace(/[^a-zA-Z0-9._\- ()]/g, "_")
      .trim();
    if (!cleaned) return `shared-${Date.now()}.bin`;
    return cleaned.includes(".") ? cleaned : `${cleaned}.bin`;
  } catch {
    return `shared-${Date.now()}.bin`;
  }
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n)) return `${n}`;
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function fileNameOf(p: string): string {
  if (!p) return "";
  const norm = p.replace(/\\/g, "/");
  const tail = norm.slice(norm.lastIndexOf("/") + 1);
  return tail || p;
}
