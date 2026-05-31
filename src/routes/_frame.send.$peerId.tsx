import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { PigeonAvatar } from "@/components/pigeon/atoms";
import {
  PushHeader,
  BottomBar,
  PMSectionLabel,
  PMCard,
  PMFileRow,
  PMToggle,
} from "@/components/pigeon/mobile";
import { MFILES, TOTAL_SIZE } from "@/lib/mock";
import { toUiPeer } from "@/lib/peer-map";
import { getPeerById } from "@/lib/peers-store";

export const Route = createFileRoute("/_frame/send/$peerId")({
  loader: ({ params }) => {
    const discovered = getPeerById(params.peerId);
    if (!discovered) throw redirect({ to: "/rede" });
    return toUiPeer(discovered);
  },
  component: SendScreen,
});

function SendScreen() {
  const peer = Route.useLoaderData();
  const navigate = useNavigate();
  const [enc, setEnc] = useState(true);
  const first = peer.name.split(" ")[0];

  return (
    <div
      className="bg-background absolute inset-0 z-20 flex flex-col"
      style={{ animation: "pmSlideIn .28s cubic-bezier(.4,0,.2,1)" }}
    >
      <PushHeader
        onBack={() => navigate({ to: "/rede" })}
        eyebrow="Enviar para"
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
        <PMSectionLabel right={`Total: ${TOTAL_SIZE}`}>
          Arquivos ({MFILES.length})
        </PMSectionLabel>
        <PMCard>
          {MFILES.map((f, i) => (
            <PMFileRow
              key={f.name}
              file={f}
              removable
              isLast={i === MFILES.length - 1}
            />
          ))}
        </PMCard>
        <button
          type="button"
          className="border-border text-muted-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed bg-transparent px-4 py-3.5 text-[13.5px] font-semibold"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3v9M5 7l4-4 4 4M3 14h12" />
          </svg>
          Adicionar arquivos
        </button>

        <div className="mt-[18px]">
          <PMSectionLabel>Mensagem (opcional)</PMSectionLabel>
          <textarea
            defaultValue="Aqui estão os materiais pra reunião de amanhã!"
            className="border-border bg-card text-foreground min-h-16 w-full resize-none rounded-2xl border px-3.5 py-3 text-sm outline-none"
            style={{ fontFamily: "inherit" }}
          />
        </div>

        <div className="mt-4">
          <PMCard>
            <div className="flex items-center gap-3 px-[15px] py-3.5">
              <div
                className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px]"
                style={{
                  background:
                    "color-mix(in oklab, var(--chart-3) 18%, transparent)",
                  color: "var(--chart-3)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 7v-.01M4 6V4.5a3 3 0 016 0V6M3 6h8v6H3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-foreground text-sm font-semibold">
                  Criptografar transferência
                </div>
                <div
                  className="text-muted-foreground mt-px text-[11.5px]"
                  style={{
                    fontFamily: '"Geist Mono", ui-monospace, monospace',
                  }}
                >
                  AES-256 · ponta a ponta
                </div>
              </div>
              <PMToggle
                on={enc}
                onChange={setEnc}
                ariaLabel="Criptografar transferência"
              />
            </div>
          </PMCard>
        </div>
      </div>

      <BottomBar>
        <button
          type="button"
          onClick={() =>
            navigate({ to: "/transfer/$peerId", params: { peerId: peer.id } })
          }
          className="bg-primary flex flex-1 items-center justify-center gap-2.5 rounded-2xl border-none px-4 py-[15px] text-[15.5px] font-bold text-white"
          style={{
            boxShadow:
              "0 8px 20px color-mix(in oklab, var(--primary) 40%, transparent)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 1L5 7M11 1l-4 10-2-4-4-2z" />
          </svg>
          Solicitar envio a {first}
        </button>
      </BottomBar>
    </div>
  );
}
