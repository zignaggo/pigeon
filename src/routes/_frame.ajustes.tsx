import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getNick } from "@/lib/nick";
import { initialsOf } from "@/lib/utils";
import { PigeonAvatar } from "@/components/pigeon/atoms";
import { PMAppBar, PMSectionLabel, PMCard, PMToggle } from "@/components/pigeon/mobile";

const MONO = '"Geist Mono", ui-monospace, monospace';

const Chevron = (
  <svg width="8" height="14" viewBox="0 0 8 14">
    <path d="M1 1l6 6-6 6" stroke="var(--muted-foreground)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

export const Route = createFileRoute("/_frame/ajustes")({
  component: SettingsScreen,
});

function Row({ label, desc, control, isLast }: { label: string; desc?: string; control: ReactNode; isLast?: boolean }) {
  return (
    <div className={"flex items-center gap-4 px-[15px] py-3.5" + (isLast ? "" : " border-border border-b")}>
      <div className="min-w-0 flex-1">
        <div className="text-foreground text-[14.5px] font-semibold">{label}</div>
        {desc && <div className="text-muted-foreground mt-0.5 text-xs">{desc}</div>}
      </div>
      {control}
    </div>
  );
}

function SettingsScreen() {
  const nick = getNick() ?? "";
  const me = initialsOf(nick);
  return (
    <>
      <PMAppBar big title="Ajustes" />
      <div className="pm-screen flex-1 overflow-auto px-4 pb-5 pt-1">
        {/* identity */}
        <PMCard>
          <div className="flex items-center gap-3.5 px-[15px] py-4">
            <PigeonAvatar name={me} size={52} shape="squircle" />
            <div className="min-w-0 flex-1">
              <div className="text-foreground text-base font-extrabold" style={{ letterSpacing: -0.3 }}>
                {nick}
              </div>
              <div className="text-muted-foreground mt-0.5 truncate text-xs" style={{ fontFamily: MONO }}>
                Meu dispositivo · #pigeon-a42f
              </div>
            </div>
            <button type="button" className="border-border bg-card text-foreground rounded-[14px] border px-3.5 py-2 text-[12.5px] font-semibold">
              Editar
            </button>
          </div>
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Visibilidade</PMSectionLabel>
        <PMCard>
          <Row label="Visível na rede" desc="Outros podem te encontrar automaticamente" control={<PMToggle on ariaLabel="Visível na rede" />} />
          <Row label="Exigir aprovação" desc="Confirmar cada pedido de conexão" control={<PMToggle on ariaLabel="Exigir aprovação" />} isLast />
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Recebimento</PMSectionLabel>
        <PMCard>
          <Row label="Salvar em" desc="Downloads · pasta Pigeon" control={Chevron} />
          <Row label="Abrir após receber" control={<PMToggle on={false} ariaLabel="Abrir após receber" />} />
          <Row label="Notificar com som" control={<PMToggle on ariaLabel="Notificar com som" />} isLast />
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Segurança</PMSectionLabel>
        <PMCard>
          <Row label="Criptografia ponta a ponta" desc="AES-256 · ativada por padrão" control={<PMToggle on ariaLabel="Criptografia ponta a ponta" />} />
          <Row label="Dispositivos confiáveis" desc="5 dispositivos salvos" control={Chevron} isLast />
        </PMCard>

        <div className="text-muted-foreground mt-[22px] text-center text-[11.5px]" style={{ fontFamily: MONO }}>
          Pigeon · v1.0 · #pigeon-a42f
        </div>
      </div>
    </>
  );
}
