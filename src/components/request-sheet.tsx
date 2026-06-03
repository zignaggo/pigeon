import { formatBytes } from "@/lib/format";
import { toUiPeer } from "@/lib/peer-map";
import { getPeerByIp } from "@/lib/peers-store";
import type { IncomingRequest } from "@/lib/request-store";
import { initialsOf } from "@/lib/utils";

import { PigeonAvatar, DeviceGlyph, FileIcon } from "./pigeon/atoms";

const MONO = '"Geist Mono", ui-monospace, monospace';

function extOf(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase();
}

export function RequestSheet({
  request,
  onAccept,
  onDecline,
}: {
  request: IncomingRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const ip = request.from.includes(":")
    ? request.from.slice(0, request.from.lastIndexOf(":"))
    : request.from;
  const discovered = getPeerByIp(ip);
  const peer = discovered ? toUiPeer(discovered) : null;
  const name = peer?.name || ip;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div
        onClick={onDecline}
        className="absolute inset-0 backdrop-blur-[3px]"
        style={{
          background: "rgba(10,7,5,0.55)",
          animation: "pmScrim .25s ease",
        }}
      />
      <div
        className="bg-card relative px-5 pt-2.5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{
          borderRadius: "26px 26px 0 0",
          animation: "pmSheetUp .32s cubic-bezier(.4,0,.2,1)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <div className="bg-border mx-auto mb-3.5 h-[5px] w-10 rounded-[3px]" />
        <div className="text-center">
          <div className="text-primary flex items-center justify-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[1.2px]">
            <span className="bg-primary size-1.5 rounded-full" />
            Pedido de conexão
          </div>
          <div className="relative mx-auto my-2.5 size-[72px]">
            <PigeonAvatar
              name={initialsOf(name)}
              tint={peer?.tint}
              size={72}
              shape="squircle"
            />
            <div className="bg-card border-background text-muted-foreground absolute -bottom-[3px] -right-[3px] flex size-[26px] items-center justify-center rounded-full border-[1.5px]">
              <DeviceGlyph kind={peer?.kind ?? "laptop"} size={14} />
            </div>
          </div>
          <div
            className="text-foreground text-[19px] font-extrabold"
            style={{ letterSpacing: -0.4 }}
          >
            {name}
          </div>
          <div
            className="text-muted-foreground mt-0.5 text-xs"
            style={{ fontFamily: MONO }}
          >
            {ip}
          </div>
        </div>

        <div className="bg-background mt-4 flex flex-col gap-2.5 rounded-[14px] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <FileIcon ext={extOf(request.name)} size={30} />
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-[13px] font-bold">
                {request.name}
              </div>
              <div
                className="text-muted-foreground text-[11.5px]"
                style={{ fontFamily: MONO }}
              >
                {formatBytes(request.size)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="border-border bg-card text-muted-foreground flex-1 rounded-2xl border px-4 py-[15px] text-[15px] font-bold"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-primary rounded-2xl border-none px-4 py-[15px] text-[15px] font-bold text-white"
            style={{
              flex: 1.7,
              boxShadow:
                "0 8px 20px color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            Aceitar e receber
          </button>
        </div>
      </div>
    </div>
  );
}
