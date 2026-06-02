import { useQuery } from "@tanstack/react-query";

import { getNetworkInfo } from "@/lib/api";

export function useNetworkInfo() {
  return useQuery({
    queryKey: ["network-info"],
    queryFn: getNetworkInfo,
    staleTime: 30_000,
  });
}
