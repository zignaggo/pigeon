import { useQuery } from "@tanstack/react-query";

import type { HistoryGroup } from "@/lib/types";

async function fetchHistory(): Promise<HistoryGroup[]> {
  return [];
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });
}
