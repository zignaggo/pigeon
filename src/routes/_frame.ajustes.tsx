import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";

import { PigeonAvatar } from "@/components/pigeon/atoms";
import {
  PMAppBar,
  PMSectionLabel,
  PMCard,
  PMToggle,
} from "@/components/pigeon/mobile";
import { setNick as setNickBackend } from "@/lib/api";
import { getDeviceId } from "@/lib/device-id";
import { getNick, setNick as persistNick } from "@/lib/nick";
import { cn, initialsOf } from "@/lib/utils";

const MONO = '"Geist Mono", ui-monospace, monospace';

const Chevron = (
  <svg width="8" height="14" viewBox="0 0 8 14">
    <path
      d="M1 1l6 6-6 6"
      stroke="var(--muted-foreground)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
  </svg>
);

export const Route = createFileRoute("/_frame/ajustes")({
  component: SettingsScreen,
});

function Row({
  label,
  desc,
  control,
  isLast,
  disabled,
}: {
  label: string;
  desc?: string;
  control: ReactNode;
  isLast?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-[15px] py-3.5",
        !isLast && "border-border border-b",
        disabled && "opacity-55",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-foreground flex items-center gap-2 text-[14.5px] font-semibold">
          {label}
          {disabled && (
            <span className="border-border text-muted-foreground rounded-full border px-1.5 py-px text-[9.5px] font-bold uppercase tracking-[0.5px]">
              em breve
            </span>
          )}
        </div>
        {desc && (
          <div className="text-muted-foreground mt-0.5 text-xs">{desc}</div>
        )}
      </div>
      {control}
    </div>
  );
}

function SettingsScreen() {
  const [nick, setNickState] = useState(() => getNick() ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nick);

  const deviceTag = `#${getDeviceId().slice(0, 8)}`;
  const me = initialsOf((editing ? draft : nick) || "?");

  const startEdit = () => {
    setDraft(nick);
    setEditing(true);
  };

  const save = () => {
    const next = draft.trim();
    if (!next) return;
    persistNick(next);
    void setNickBackend(next).catch(() => {});
    setNickState(next);
    setEditing(false);
  };

  return (
    <>
      <PMAppBar big title="Ajustes" />
      <div className="pm-screen flex-1 overflow-auto px-4 pb-5 pt-4">
        <PMCard>
          <div className="flex items-center gap-3.5 px-[15px] py-4">
            <PigeonAvatar name={me} size={52} shape="squircle" />
            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  autoFocus
                  value={draft}
                  maxLength={20}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  className="border-border bg-background text-foreground w-full rounded-[12px] border px-3 py-2 text-base font-extrabold outline-none"
                  style={{ fontFamily: "inherit" }}
                />
              ) : (
                <div
                  className="text-foreground text-base font-extrabold"
                  style={{ letterSpacing: -0.3 }}
                >
                  {nick}
                </div>
              )}
              <div
                className="text-muted-foreground mt-0.5 truncate text-xs"
                style={{ fontFamily: MONO }}
              >
                Meu dispositivo · {deviceTag}
              </div>
            </div>
            {editing ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="border-border bg-card text-muted-foreground rounded-[14px] border px-3 py-2 text-[12.5px] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!draft.trim()}
                  className="bg-primary rounded-[14px] border-none px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="border-border bg-card text-foreground shrink-0 rounded-[14px] border px-3.5 py-2 text-[12.5px] font-semibold"
              >
                Editar
              </button>
            )}
          </div>
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Visibilidade</PMSectionLabel>
        <PMCard>
          <Row
            label="Visível na rede"
            desc="Outros podem te encontrar automaticamente"
            control={<PMToggle on disabled ariaLabel="Visível na rede" />}
            disabled
          />
          <Row
            label="Exigir aprovação"
            desc="Confirmar cada pedido de conexão"
            control={<PMToggle on={false} disabled ariaLabel="Exigir aprovação" />}
            disabled
            isLast
          />
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Recebimento</PMSectionLabel>
        <PMCard>
          <Row
            label="Salvar em"
            desc="Downloads · pasta Pigeon"
            control={Chevron}
            disabled
          />
          <Row
            label="Abrir após receber"
            control={<PMToggle on={false} disabled ariaLabel="Abrir após receber" />}
            disabled
          />
          <Row
            label="Notificar com som"
            control={<PMToggle on={false} disabled ariaLabel="Notificar com som" />}
            disabled
            isLast
          />
        </PMCard>

        <div className="mt-[18px]" />
        <PMSectionLabel>Segurança</PMSectionLabel>
        <PMCard>
          <Row
            label="Criptografia ponta a ponta"
            desc="Ainda não disponível nesta versão"
            control={
              <PMToggle on={false} disabled ariaLabel="Criptografia ponta a ponta" />
            }
            disabled
          />
          <Row
            label="Dispositivos confiáveis"
            control={Chevron}
            disabled
            isLast
          />
        </PMCard>

        <div
          className="text-muted-foreground mt-[22px] text-center text-[11.5px]"
          style={{ fontFamily: MONO }}
        >
          Pigeon · v1.0 · {deviceTag}
        </div>
      </div>
    </>
  );
}
