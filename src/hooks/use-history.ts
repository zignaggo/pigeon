import { useQuery } from "@tanstack/react-query";

import { formatBytes } from "@/lib/format";
import { getHistory } from "@/lib/history-db";
import type { HistoryGroup } from "@/lib/types";

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dayLabel(ts: number): string {
  const diff = Math.round((startOfDay(new Date()) - startOfDay(new Date(ts))) / 86_400_000);
  if (diff <= 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return new Date(ts).toLocaleDateString();
}

async function fetchHistory(): Promise<HistoryGroup[]> {
  const records = await getHistory();
  const groups: HistoryGroup[] = [];
  for (const r of records) {
    const day = dayLabel(r.ts);
    const item = {
      dir: r.dir,
      name: r.name,
      ext: r.ext,
      peer: r.peer,
      time: new Date(r.ts).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      size: formatBytes(r.size),
    };
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

export function useHistory() {
  return useQuery({ queryKey: ["history"], queryFn: fetchHistory });
}
