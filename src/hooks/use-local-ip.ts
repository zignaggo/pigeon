import { useQuery } from "@tanstack/react-query";

import { getLocalIp } from "@/lib/api";

export function useLocalIp() {
  return useQuery({
    queryKey: ["local-ip"],
    queryFn: getLocalIp,
    staleTime: 60_000,
  });
}
