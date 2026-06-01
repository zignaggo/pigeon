import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PigeonAvatar } from "@/components/pigeon/atoms";
import {
  PushHeader,
  BottomBar,
  PMSectionLabel,
  PMCard,
  PMFileRow,
  RingBig,
} from "@/components/pigeon/mobile";
import { useTransfer } from "@/hooks/use-transfer";
import { formatBytes } from "@/lib/format";
import { toUiPeer } from "@/lib/peer-map";
import { getPeerById } from "@/lib/peers-store";

const MONO = '"Geist Mono", ui-monospace, monospace';

export const Route = createFileRoute("/_frame/transfer/$peerId")({
  loader: ({ params }) => {
    const discovered = getPeerById(params.peerId);
    if (!discovered) throw redirect({ to: "/rede" });
    return toUiPeer(discovered);
  },
  component: TransferScreen,
});

function extOf(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase();
}

function TransferScreen() {
  const peer = Route.useLoaderData();
  const navigate = useNavigate();
  const t = useTransfer();

  useEffect(() => {
    if (t.status === "idle") navigate({ to: "/rede" });
  }, [t.status, navigate]);

  const done = t.status === "done";
  const failed = t.status === "error";
  const pct =
    t.total > 0 ? Math.min(100, (t.sent / t.total) * 100) : done ? 100 : 0;

  const eyebrow = done ? "Concluído" : failed ? "Falha" : "Enviando para";
  const headline = done
    ? "Enviado!"
    : failed
      ? "Falhou"
      : `${Math.round(pct)}%`;
  const subline = failed
    ? (t.error ?? "erro desconhecido")
    : done
      ? formatBytes(t.total)
      : `${formatBytes(t.sent)} / ${formatBytes(t.total)}`;

  return (
    <div
      className="bg-background absolute inset-0 z-20 flex flex-col"
      style={{ animation: "pmSlideIn .28s cubic-bezier(.4,0,.2,1)" }}
    >
      <PushHeader
        onBack={() => navigate({ to: "/rede" })}
        eyebrow={eyebrow}
        title={
          <>
            <PigeonAvatar
              name={peer.mono}
              tint={peer.tint}
              size={24}
              shape="squircle"
            />{" "}
            {peer.name}
          </>
        }
      />
      <div className="pm-screen flex-1 overflow-auto p-4">
        <PMCard className="px-5 py-[22px] text-center">
          <RingBig pct={failed ? 100 : pct} done={done} />
          <div
            className="text-foreground mt-3.5 text-[30px] font-extrabold"
            style={{ letterSpacing: -1 }}
          >
            {headline}
          </div>
          <div
            className="text-muted-foreground mt-1 text-[13px] break-words"
            style={{ fontFamily: MONO, color: failed ? "#ff7a7a" : undefined }}
          >
            {subline}
          </div>
          <div className="bg-muted mt-4 h-[7px] overflow-hidden rounded">
            <div
              className="h-full rounded"
              style={{
                width: `${failed ? 100 : pct}%`,
                background: failed
                  ? "#ff7a7a"
                  : done
                    ? "var(--chart-3)"
                    : "linear-gradient(90deg, var(--primary), var(--chart-2))",
                transition: "width .15s linear",
              }}
            />
          </div>
        </PMCard>

        {t.name && (
          <div className="mt-[18px]">
            <PMSectionLabel>Arquivo</PMSectionLabel>
            <PMCard>
              <PMFileRow
                file={{
                  name: t.name,
                  ext: extOf(t.name),
                  size: formatBytes(t.total),
                }}
                progress={failed ? undefined : pct}
                state={done ? "done" : "sending"}
                isLast
              />
            </PMCard>
          </div>
        )}
      </div>

      {(done || failed) && (
        <BottomBar>
          <button
            type="button"
            onClick={() =>
              failed
                ? navigate({ to: "/send/$peerId", params: { peerId: peer.id } })
                : navigate({ to: "/rede" })
            }
            className="bg-primary flex-1 rounded-2xl border-none px-4 py-[15px] text-[15.5px] font-bold text-white"
            style={{
              boxShadow:
                "0 8px 20px color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            {failed ? "Tentar de novo" : "Concluir"}
          </button>
        </BottomBar>
      )}
    </div>
  );
}
