import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { FileIcon, PigeonAvatar } from "@/components/pigeon/atoms";
import {
  PushHeader,
  BottomBar,
  PMSectionLabel,
  PMCard,
} from "@/components/pigeon/mobile";
import { startSend } from "@/hooks/use-transfer";
import { pickOutgoingFile, type OutgoingFile } from "@/lib/api";
import { toUiPeer } from "@/lib/peer-map";
import { getPeerById } from "@/lib/peers-store";

export const Route = createFileRoute("/_frame/send/$peerId")({
  loader: ({ params }) => {
    const discovered = getPeerById(params.peerId);
    if (!discovered) throw redirect({ to: "/rede" });
    return { peer: toUiPeer(discovered), ip: discovered.ip };
  },
  component: SendScreen,
});

function extOf(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase();
}

function SendScreen() {
  const { peer, ip } = Route.useLoaderData();
  const navigate = useNavigate();
  const [file, setFile] = useState<OutgoingFile | null>(null);
  const first = peer.name.split(" ")[0];

  const pick = async () => {
    const picked = await pickOutgoingFile();
    if (picked) setFile(picked);
  };

  const send = () => {
    if (!file) return;
    void startSend(peer.id, ip, file.path, file.name);
    navigate({ to: "/transfer/$peerId", params: { peerId: peer.id } });
  };

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
        <PMSectionLabel>Arquivo</PMSectionLabel>
        {file ? (
          <PMCard>
            <div className="flex items-center gap-3 px-[15px] py-3.5">
              <FileIcon ext={extOf(file.name)} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate text-sm font-semibold">
                  {file.name}
                </div>
                <div className="text-muted-foreground mt-0.5 truncate text-[11.5px]">
                  Pronto para enviar
                </div>
              </div>
            </div>
          </PMCard>
        ) : (
          <PMCard>
            <div className="text-muted-foreground px-[15px] py-6 text-center text-[13px]">
              Nenhum arquivo selecionado
            </div>
          </PMCard>
        )}

        <button
          type="button"
          onClick={pick}
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
          {file ? "Trocar arquivo" : "Escolher arquivo"}
        </button>

        <div className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-[12px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4.5v3M7 9.5v.01" />
          </svg>
          Envio direto via Wi-Fi · {ip}
        </div>
      </div>

      <BottomBar>
        <button
          type="button"
          onClick={send}
          disabled={!file}
          className="bg-primary flex flex-1 items-center justify-center gap-2.5 rounded-2xl border-none px-4 py-[15px] text-[15.5px] font-bold text-white disabled:opacity-50"
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
          Enviar para {first}
        </button>
      </BottomBar>
    </div>
  );
}
