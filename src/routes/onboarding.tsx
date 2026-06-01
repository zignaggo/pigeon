import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import {
  PigeonLogo,
  PigeonAvatar,
  DeviceGlyph,
  StatusDot,
} from "@/components/pigeon/atoms";
import { getNick, setNick } from "@/lib/nick";
import { initialsOf } from "@/lib/utils";

const MONO = '"Geist Mono", ui-monospace, monospace';

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    if (getNick()) throw redirect({ to: "/rede" });
  },
  component: OnboardingScreen,
});

function OnboardingScreen() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);

  const ok = draft.trim().length >= 1;
  const ini = ok ? initialsOf(draft) : "·";
  const go = () => {
    if (!ok) return;
    setNick(draft.trim());
    navigate({ to: "/rede" });
  };

  return (
    <div
      className="bg-background text-foreground relative flex h-full flex-col items-center overflow-hidden"
      style={{
        fontFamily: "Nunito, system-ui, sans-serif",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* soft glow top */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%)",
        }}
      />

      {/* centered column */}
      <div className="relative z-[1] flex w-full max-w-[420px] flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center px-7 pt-10">
          {/* brand */}
          <div className="mb-[34px] flex flex-col items-center gap-3.5">
            <div style={{ animation: "pmFloat 4s ease-in-out infinite" }}>
              <PigeonLogo size={62} />
            </div>
            <div className="text-center">
              <div className="text-foreground text-[30px] font-extrabold tracking-[-0.8px]">
                Pigeon
              </div>
              <div className="text-muted-foreground mt-1 max-w-[240px] text-sm leading-[1.4]">
                Envie arquivos para quem está perto de você, sem internet.
              </div>
            </div>
          </div>

          {/* live avatar preview */}
          <div className="mb-[18px] flex justify-center">
            <div className="relative">
              <PigeonAvatar name={ini} size={76} shape="squircle" />
              <div
                className="bg-card border-background text-muted-foreground absolute flex items-center justify-center rounded-full border-[1.5px]"
                style={{ bottom: -4, right: -4, width: 26, height: 26 }}
              >
                <DeviceGlyph kind="phone" size={13} />
              </div>
            </div>
          </div>

          {/* input */}
          <label
            htmlFor="nick"
            className="text-muted-foreground pl-1 text-xs font-bold uppercase tracking-[0.6px]"
          >
            Como quer ser chamado?
          </label>
          <div
            className="bg-card mt-2 flex items-center gap-2.5 rounded-2xl border-[1.5px] pl-4 pr-1.5 transition-colors"
            style={{
              paddingTop: 4,
              paddingBottom: 4,
              borderColor: draft ? "var(--primary)" : "var(--border)",
            }}
          >
            <input
              ref={ref}
              id="nick"
              value={draft}
              maxLength={20}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go();
              }}
              placeholder="Seu apelido"
              className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-none bg-transparent text-[17px] font-semibold outline-none"
              style={{ fontFamily: "inherit" }}
            />
            <span
              className="text-muted-foreground pr-1.5 text-xs"
              style={{ fontFamily: MONO }}
            >
              {draft.length}/20
            </span>
          </div>
          <div className="text-muted-foreground mt-2.5 flex items-center gap-[7px] pl-1 text-xs">
            <StatusDot status="online" size={7} />
            <span>
              Neste dispositivo · visível na{" "}
              <span className="text-foreground" style={{ fontFamily: MONO }}>
                Wi-Fi Casa
              </span>
            </span>
          </div>
        </div>

        {/* bottom CTA */}
        <div className="flex flex-col gap-3.5 px-7 pb-[30px] pt-3.5">
          <button
            type="button"
            onClick={go}
            disabled={!ok}
            className={
              "flex w-full items-center justify-center gap-2 rounded-[18px] border-none p-4 text-base font-bold tracking-[-0.2px] transition-all " +
              (ok
                ? "bg-primary text-primary-foreground cursor-pointer"
                : "bg-muted text-muted-foreground cursor-default")
            }
            style={
              ok
                ? {
                    boxShadow:
                      "0 10px 24px color-mix(in oklab, var(--primary) 40%, transparent)",
                  }
                : undefined
            }
          >
            Entrar
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h9M8 4l4 4-4 4" />
            </svg>
          </button>
          <button
            type="button"
            className="text-muted-foreground flex cursor-pointer items-center justify-center gap-[7px] border-none bg-transparent text-[13px] font-semibold"
          >
            <svg
              width="15"
              height="15"
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
            Parear com código QR
          </button>
        </div>
      </div>
    </div>
  );
}
