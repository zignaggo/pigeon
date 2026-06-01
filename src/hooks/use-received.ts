import { useQuery } from "@tanstack/react-query";

import { getHistory } from "@/lib/history-db";
import type { HistoryRecord } from "@/lib/history-db";

export function useReceivedFiles() {
  return useQuery({
    queryKey: ["received"],
    queryFn: async (): Promise<HistoryRecord[]> =>
      (await getHistory()).filter((r) => r.dir === "in"),
  });
}
