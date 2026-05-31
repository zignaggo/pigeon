import { useLocalIp } from "@/hooks/use-local-ip";
import { getDeviceId } from "@/lib/device-id";

const MONO = '"Geist Mono", ui-monospace, monospace';

export function IpAddress() {
  const { data: ip } = useLocalIp();
  return (
    <div className="border-border text-muted-foreground border-t px-4 py-3 text-[11px]">
      <div className="flex items-center gap-1.5">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <path d="M2 5c2-2 6-2 8 0M3.5 7c1.3-1.3 3.7-1.3 5 0" />
          <circle cx="6" cy="9" r=".8" fill="var(--primary)" />
        </svg>
        <span className="truncate">{ip ?? "rede local"}</span>
      </div>
      <div className="mt-1 opacity-70" style={{ fontFamily: MONO }}>
        #{getDeviceId().slice(0, 8)}
      </div>
    </div>
  );
}
