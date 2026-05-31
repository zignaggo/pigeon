import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PigeonAvatar } from "@/components/pigeon/atoms";
import {
  PushHeader,
  BottomBar,
  PMSectionLabel,
  PMCard,
  PMFileRow,
  RingBig,
} from "@/components/pigeon/mobile";
import { MFILES, TOTAL_SIZE } from "@/lib/mock";
import { toUiPeer } from "@/lib/peer-map";
import { getPeerById } from "@/lib/peers-store";

const MONO = '"Geist Mono", ui-monospace, monospace';
const THRESHOLDS = [8, 18, 70, 100];

export const Route = createFileRoute("/_frame/transfer/$peerId")({
  loader: ({ params }) => {
    const discovered = getPeerById(params.peerId);
    if (!discovered) throw redirect({ to: "/rede" });
    return toUiPeer(discovered);
  },
  component: TransferScreen,
});

function TransferScreen() {
  const peer = Route.useLoaderData();
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || pct >= 100) return;
    const id = setTimeout(
      () => setPct((p) => Math.min(100, p + (p > 80 ? 2.5 : 4.5))),
      110,
    );
    return () => clearTimeout(id);
  }, [pct, paused]);

  const done = pct >= 100;
  const mbSent = Math.round((pct / 100) * 485);

  const fileState = (
    i: number,
  ): { state: "queued" | "sending" | "done"; progress: number } => {
    if (pct >= THRESHOLDS[i]) return { state: "done", progress: 100 };
    const prev = i === 0 ? 0 : THRESHOLDS[i - 1];
    if (pct > prev)
      return {
        state: "sending",
        progress: Math.round(((pct - prev) / (THRESHOLDS[i] - prev)) * 100),
      };
    return { state: "queued", progress: 0 };
  };

  return (
    <div
      className="bg-background absolute inset-0 z-20 flex flex-col"
      style={{ animation: "pmSlideIn .28s cubic-bezier(.4,0,.2,1)" }}
    >
      <PushHeader
        onBack={() => navigate({ to: "/rede" })}
        eyebrow={done ? "Concluído" : "Enviando para"}
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
          <RingBig pct={pct} done={done} />
          <div
            className="text-foreground mt-3.5 text-[30px] font-extrabold"
            style={{ letterSpacing: -1 }}
          >
            {done ? "Enviado!" : `${Math.round(pct)}%`}
          </div>
          <div
            className="text-muted-foreground mt-0.5 text-[13px]"
            style={{ fontFamily: MONO }}
          >
            {done
              ? `${TOTAL_SIZE} · 4 arquivos entregues`
              : `${mbSent} MB / ${TOTAL_SIZE}`}
          </div>
          {!done && (
            <div
              className="text-muted-foreground mt-3 flex flex-wrap justify-center gap-4 text-xs"
              style={{ fontFamily: MONO }}
            >
              <span>↑ 24,6 MB/s</span>
              <span>~{Math.max(1, Math.round((100 - pct) / 8))} s</span>
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--chart-3)" }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 7v-.01M4 6V4.5a3 3 0 016 0V6M3 6h8v6H3z" />
                </svg>
                AES-256
              </span>
            </div>
          )}
          <div className="bg-muted mt-4 h-[7px] overflow-hidden rounded">
            <div
              className="h-full rounded"
              style={{
                width: `${pct}%`,
                background: done
                  ? "var(--chart-3)"
                  : "linear-gradient(90deg, var(--primary), var(--chart-2))",
                transition: "width .15s linear",
              }}
            />
          </div>
          {!done && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="border-border bg-card text-muted-foreground mt-4 rounded-[14px] border px-[22px] py-2.5 text-[13px] font-semibold"
            >
              {paused ? "Retomar" : "Pausar"}
            </button>
          )}
        </PMCard>

        <div className="mt-[18px]">
          <PMSectionLabel>Arquivos ({MFILES.length})</PMSectionLabel>
          <PMCard>
            {MFILES.map((f, i) => {
              const fs = fileState(i);
              return (
                <PMFileRow
                  key={f.name}
                  file={f}
                  progress={fs.progress}
                  state={fs.state}
                  isLast={i === MFILES.length - 1}
                />
              );
            })}
          </PMCard>
        </div>
      </div>

      {done && (
        <BottomBar>
          <button
            type="button"
            onClick={() => navigate({ to: "/historico" })}
            className="bg-primary flex-1 rounded-2xl border-none px-4 py-[15px] text-[15.5px] font-bold text-white"
            style={{
              boxShadow:
                "0 8px 20px color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            Concluir
          </button>
        </BottomBar>
      )}
    </div>
  );
}
