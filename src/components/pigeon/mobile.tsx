// Pigeon mobile primitives — ported from docs/design/pombo-mobile-ui.jsx &
// pombo-mobile-screens.jsx. Colors from shadcn tokens; layout/sizing inline.
import type { ReactNode } from "react";

import type { Peer, MockFile, Tint } from "@/lib/mock";
import { cn } from "@/lib/utils";

import { PigeonAvatar, DeviceGlyph, StatusDot, FileIcon } from "./atoms";

const MONO = '"Geist Mono", ui-monospace, monospace';
const TINT_VAR: Record<Tint, string> = {
  coral: "--chart-1",
  sun: "--chart-2",
  mint: "--chart-3",
  sky: "--chart-4",
  lilac: "--chart-5",
};

// ── App bar (clears the OS status bar) ───────────────────────
export function PMAppBar({
  title,
  subtitle,
  left,
  right,
  big = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  big?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card/80 z-5 flex shrink-0 items-center gap-3 pl-4.5 pr-3.5 backdrop-blur-md",
        big ? "border-none pb-2" : "border-border border-b pb-3",
      )}
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.5rem)" }}
    >
      {left}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-foreground leading-tight font-extrabold",
            big ? "text-[24px]" : "text-[19px]",
          )}
          style={{ letterSpacing: -0.6 }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-muted-foreground mt-0.75 flex items-center gap-1.5 text-[12.5px]">
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

export function PMIconButton({
  children,
  onClick,
  tinted = false,
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tinted?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "border-border flex size-10 shrink-0 items-center justify-center rounded-[13px] border",
        tinted ? "bg-accent text-primary" : "bg-card text-muted-foreground",
        "disabled:opacity-40 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

export function PMSectionLabel({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center px-1.5 pb-2">
      <div className="text-muted-foreground flex-1 text-[11.5px] font-bold uppercase tracking-[0.8px]">
        {children}
      </div>
      {right && (
        <div
          className="text-muted-foreground text-xs"
          style={{ fontFamily: MONO }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

// Grouped inset card (the warm equivalent of an iOS inset list).
export function PMCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border-border overflow-hidden rounded-[18px] border shadow-[0_6px_18px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PMPeerRow({
  peer,
  onTap,
  isLast,
}: {
  peer: Peer;
  onTap?: (p: Peer) => void;
  isLast?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onTap?.(peer)}
      className={cn(
        "flex w-full items-center gap-3 px-[15px] py-[13px] text-left",
        !isLast && "border-border border-b",
      )}
    >
      <div className="relative shrink-0">
        <PigeonAvatar
          name={peer.mono}
          tint={peer.tint}
          size={44}
          shape="squircle"
        />
        <div className="bg-card border-background text-muted-foreground absolute -bottom-[3px] -right-[3px] flex size-[19px] items-center justify-center rounded-full border-[1.5px]">
          <DeviceGlyph kind={peer.kind} size={11} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="text-foreground text-[15px] font-bold"
          style={{ letterSpacing: -0.2 }}
        >
          {peer.name}
        </div>
        <div
          className="text-muted-foreground mt-0.5 truncate text-xs"
          style={{ fontFamily: MONO }}
        >
          {peer.device}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-[5px]">
        <div className="flex items-center gap-1.5">
          <StatusDot status={peer.status} />
          <span className="text-muted-foreground text-[11px]">
            {peer.distance}
          </span>
        </div>
        <svg
          width="7"
          height="12"
          viewBox="0 0 8 14"
          className="text-muted-foreground mr-px opacity-60"
        >
          <path
            d="M1 1l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}

export function PMFileRow({
  file,
  progress,
  state = "queued",
  removable,
  isLast,
}: {
  file: MockFile;
  progress?: number;
  state?: "queued" | "sending" | "done";
  removable?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3.75 py-3",
        !isLast && "border-border border-b",
      )}
    >
      <FileIcon ext={file.ext} size={34} />
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate text-[13.5px] font-semibold">
          {file.name}
        </div>
        <div
          className="text-muted-foreground mt-0.5 flex gap-2 text-[11px]"
          style={{ fontFamily: MONO }}
        >
          <span>{file.size}</span>
          {file.badge && <span>· {file.badge}</span>}
          {state === "sending" && (
            <span className="text-primary">· enviando…</span>
          )}
          {state === "done" && (
            <span style={{ color: "var(--chart-3)" }}>· enviado</span>
          )}
        </div>
        {progress != null && (
          <div className="bg-muted mt-[7px] h-1 overflow-hidden rounded-sm">
            <div
              className="h-full rounded-sm transition-[width] duration-300"
              style={{
                width: `${progress}%`,
                background:
                  state === "done" ? "var(--chart-3)" : "var(--primary)",
              }}
            />
          </div>
        )}
      </div>
      {state === "done" && (
        <div className="shrink-0" style={{ color: "var(--chart-3)" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 9.5l4 4 7-7" />
          </svg>
        </div>
      )}
      {state === "queued" && removable && (
        <div className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center">
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M2 2l7 7M9 2l-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function PMToggle({
  on = true,
  onChange,
  ariaLabel = "Alternar",
  disabled = false,
}: {
  on?: boolean;
  onChange?: (v: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={cn(
        "relative h-7 w-[46px] shrink-0 rounded-[14px] border-none p-0 transition-colors",
        on ? "bg-primary" : "bg-muted",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className="absolute top-[3px] size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[left]"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  );
}

// ── Bottom tab bar (navbar) ──────────────────────────────────
export type Tab = "rede" | "recebidos" | "historico" | "ajustes";

const ICONS: Record<Tab, (active: boolean) => ReactNode> = {
  recebidos: (a) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={a ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v7M5 6.5l3 3 3-3M3 13h10" />
    </svg>
  ),
  rede: (a) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={a ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="5" />
      <circle cx="8" cy="8" r="7" opacity=".4" />
    </svg>
  ),
  historico: (a) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={a ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4.5v3.5l2.4 1.4" />
      <circle cx="8" cy="8" r="6" />
    </svg>
  ),
  ajustes: (a) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={a ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" />
    </svg>
  ),
};

const TABS: { id: Tab; label: string }[] = [
  { id: "rede", label: "Por perto" },
  { id: "recebidos", label: "Recebidos" },
  { id: "historico", label: "Histórico" },
  { id: "ajustes", label: "Ajustes" },
];

export function PMTabBar({
  active = "rede",
  onChange,
}: {
  active?: Tab;
  onChange?: (t: Tab) => void;
}) {
  return (
    <div
      className="bg-card/80 border-border flex shrink-0 border-t pt-[9px] backdrop-blur-lg"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
    >
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1",
              on ? "text-primary" : "text-muted-foreground",
            )}
          >
            {ICONS[t.id](on)}
            <span
              className={cn("text-[10.5px]", on ? "font-bold" : "font-medium")}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Compact radar hero ───────────────────────────────────────
export function PMRadarHero({
  peers = [],
  network = "Wi-Fi Casa",
  me = "EU",
}: {
  peers?: Peer[];
  network?: string;
  me?: string;
}) {
  const slots: { a: number; r: number }[] = [
    { a: -32, r: 0.62 },
    { a: 38, r: 0.86 },
    { a: 108, r: 0.58 },
    { a: 162, r: 0.9 },
    { a: 232, r: 0.7 },
  ];
  const shown = peers.slice(0, slots.length);
  const count = peers.length;
  return (
    <div className="relative h-80 shrink-0 overflow-hidden">
      {/* glow */}
      <div
        className="absolute left-1/2 top-[54%] size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 62%)",
        }}
      />
      {/* static rings */}
      {[58, 92, 128].map((r) => (
        <div
          key={r}
          className="border-border absolute left-1/2 top-[54%] rounded-full border-[1.5px] border-dashed"
          style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r }}
        />
      ))}
      {/* pulse rings */}
      {[0, 1.1].map((d) => (
        <div
          key={d}
          className="absolute left-1/2 top-[54%] size-[256px] rounded-full border-2"
          style={{
            marginLeft: -128,
            marginTop: -128,
            borderColor: "var(--primary)",
            animation: `pmPulse 3.4s ease-out ${d}s infinite`,
          }}
        />
      ))}
      {/* peer dots */}
      {shown.map((peer, i) => {
        const slot = slots[i];
        const rad = (slot.a * Math.PI) / 180;
        const dist = 58 + slot.r * 70;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        return (
          <div
            key={peer.id}
            className="absolute left-1/2 top-[54%]"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <div
              style={{
                animation: `pmDot 2.8s ease-in-out ${i * 0.4}s infinite`,
              }}
            >
              <div
                className="border-card flex size-[30px] items-center justify-center rounded-[9px] border-[1.5px] text-xs font-bold shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
                style={{
                  background: `color-mix(in oklab, var(${TINT_VAR[peer.tint]}) 22%, transparent)`,
                  color: `var(${TINT_VAR[peer.tint]})`,
                }}
              >
                {peer.mono}
              </div>
            </div>
          </div>
        );
      })}
      {/* you */}
      <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="bg-primary flex size-[60px] flex-col items-center justify-center rounded-full font-extrabold text-white"
          style={{
            boxShadow:
              "0 10px 26px color-mix(in oklab, var(--primary) 45%, transparent), 0 0 0 7px var(--accent)",
            animation: "pmFloat 4s ease-in-out infinite",
          }}
        >
          <span className="text-[8px] uppercase tracking-[1px] opacity-85">
            Você
          </span>
          <span className="-mt-px text-sm">{me}</span>
        </div>
      </div>
      {/* network chip */}
      <div className="bg-card border-border text-muted-foreground absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-[7px] whitespace-nowrap rounded-2xl border px-3 py-1.5 text-[11.5px] shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
        <svg
          width="13"
          height="13"
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M2 5c2-2 6-2 8 0M3.5 7c1.3-1.3 3.7-1.3 5 0" />
          <circle cx="6" cy="9" r=".8" fill="var(--primary)" />
        </svg>
        <span className="text-foreground font-bold">{count} por perto</span>
        <span className="opacity-50">·</span>
        <span style={{ fontFamily: MONO }}>{network}</span>
      </div>
    </div>
  );
}

// ── Chrome for pushed screens ────────────────────────────────
export function PushHeader({
  onBack,
  eyebrow,
  title,
}: {
  onBack?: () => void;
  eyebrow?: string;
  title: ReactNode;
}) {
  return (
    <div
      className="bg-card/80 border-border flex shrink-0 items-center gap-2 border-b pl-3 pr-4 pb-3 backdrop-blur-md"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 14px)" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="text-primary flex size-10 shrink-0 items-center justify-center rounded-[13px]"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path
            d="M10 2L2 10l8 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.6px]">
            {eyebrow}
          </div>
        )}
        <div
          className="text-foreground mt-px flex items-center gap-2 text-[18px] font-extrabold"
          style={{ letterSpacing: -0.4 }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-card/80 border-border flex shrink-0 gap-3 border-t px-4 pt-3 backdrop-blur-md"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)" }}
    >
      {children}
    </div>
  );
}

// ── Progress ring ────────────────────────────────────────────
export function RingBig({
  pct,
  done,
  size = 96,
}: {
  pct: number;
  done?: boolean;
  size?: number;
}) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const stroke = done ? "var(--chart-3)" : "var(--primary)";
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="7"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .15s linear, stroke .3s" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: stroke }}
      >
        {done ? (
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: "pmRise .35s ease" }}
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg
            width="30"
            height="30"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: "pmFloat 2.5s ease-in-out infinite" }}
          >
            <path d="M20 2L10 12M20 2l-7 18-3-8-8-3z" />
          </svg>
        )}
      </div>
    </div>
  );
}
