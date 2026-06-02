import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { PigeonAvatar, StatusDot } from "@/components/pigeon/atoms";
import { IpAddress } from "@/components/pigeon/ip-address";
import {
  PMAppBar,
  PMIconButton,
  PMRadarHero,
  PMSectionLabel,
  PMCard,
  PMPeerRow,
} from "@/components/pigeon/mobile";
import { RequestSheet } from "@/components/request-sheet";
import { restartDiscovery, usePeers } from "@/hooks/use-peers";
import { getNick } from "@/lib/nick";
import { toUiPeer } from "@/lib/peer-map";
import { initialsOf } from "@/lib/utils";

const QrIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 15 15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="8.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="1.5" y="8.5" width="5" height="5" rx="1" />
    <path d="M8.5 8.5h2M13.5 8.5v5M8.5 13.5h2" />
  </svg>
);

export const Route = createFileRoute("/_frame/rede")({
  component: NetworkScreen,
});

function NetworkScreen() {
  const navigate = useNavigate();
  const me = initialsOf(getNick() ?? "");
  const [sheet, setSheet] = useState(false);
  const peers = usePeers().map(toUiPeer);

  return (
    <>
      <PMAppBar
        big
        left={<PigeonAvatar name={me} size={40} shape="squircle" />}
        title="Por perto"
        subtitle={
          <>
            <StatusDot status="online" size={7} /> Você está visível na rede
          </>
        }
        right={
          <PMIconButton
            onClick={() => setSheet(true)}
            ariaLabel="Parear com código QR"
            disabled
          >
            {QrIcon}
          </PMIconButton>
        }
      />
      <IpAddress />
      <div className="pm-screen flex-1 overflow-auto px-4 pb-5">
        <PMRadarHero
          peers={peers}
          me={me}
          onTap={() => void restartDiscovery()}
        />
        <div className="mt-1.5">
          <PMSectionLabel right={`${peers.length} online`}>
            Dispositivos
          </PMSectionLabel>
          {peers.length === 0 ? (
            <PMCard>
              <div className="text-muted-foreground px-[15px] py-6 text-center text-[13px]">
                Procurando dispositivos na rede…
              </div>
            </PMCard>
          ) : (
            <PMCard>
              {peers.map((p, i) => (
                <PMPeerRow
                  key={p.id}
                  peer={p}
                  onTap={(peer) =>
                    navigate({
                      to: "/send/$peerId",
                      params: { peerId: peer.id },
                    })
                  }
                  isLast={i === peers.length - 1}
                />
              ))}
            </PMCard>
          )}
        </div>
        {peers.length > 0 && (
          <div className="text-muted-foreground mt-3.5 flex items-center justify-center gap-2 text-[12.5px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 14 14"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M2 7l3 3 7-7" />
            </svg>
            Toque num dispositivo para enviar arquivos
          </div>
        )}
      </div>

      {sheet && <RequestSheet onClose={() => setSheet(false)} />}
    </>
  );
}
