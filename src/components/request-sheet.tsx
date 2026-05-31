import { PigeonAvatar, DeviceGlyph, FileIcon } from "./pigeon/atoms";

const MONO = '"Geist Mono", ui-monospace, monospace';

// Incoming connection-request sheet. Overlays the phone frame from the
// bottom; rendered by the network screen when a peer requests to connect.
export function RequestSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-[3px]"
        style={{
          background: "rgba(10,7,5,0.55)",
          animation: "pmScrim .25s ease",
        }}
      />
      <div
        className="bg-card relative px-5 pb-7 pt-2.5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{
          borderRadius: "26px 26px 0 0",
          animation: "pmSheetUp .32s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="bg-border mx-auto mb-3.5 h-[5px] w-10 rounded-[3px]" />
        <div className="text-center">
          <div className="text-primary flex items-center justify-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[1.2px]">
            <span className="bg-primary size-1.5 rounded-full" />
            Pedido de conexão
          </div>
          <div className="relative mx-auto my-2.5 size-[72px]">
            <PigeonAvatar name="AM" size={72} shape="squircle" />
            <div className="bg-card border-background text-muted-foreground absolute -bottom-[3px] -right-[3px] flex size-[26px] items-center justify-center rounded-full border-[1.5px]">
              <DeviceGlyph kind="laptop" size={14} />
            </div>
          </div>
          <div
            className="text-foreground text-[19px] font-extrabold"
            style={{ letterSpacing: -0.4 }}
          >
            Ana Martins
          </div>
          <div
            className="text-muted-foreground mt-0.5 text-xs"
            style={{ fontFamily: MONO }}
          >
            MacBook da Ana · 192.168.1.42
          </div>
        </div>

        <div className="bg-background mt-4 flex flex-col gap-2.5 rounded-[14px] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <FileIcon ext="pdf" size={30} />
            <div className="flex-1">
              <div className="text-foreground text-[13px] font-bold">
                Quer te enviar 3 arquivos
              </div>
              <div
                className="text-muted-foreground text-[11.5px]"
                style={{ fontFamily: MONO }}
              >
                48,2 MB no total
              </div>
            </div>
          </div>
          <div className="border-border bg-card text-muted-foreground rounded-[10px] border px-3 py-2.5 text-[12.5px] italic leading-[1.4]">
            "Os PDFs do contrato que a gente conversou"
          </div>
        </div>

        <div
          className="mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs"
          style={{
            background: "color-mix(in oklab, var(--chart-3) 16%, transparent)",
            color: "var(--chart-3)",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11l3 3 5-5" />
            <circle cx="7" cy="7" r="6" />
          </svg>
          <span>Canal seguro ·&nbsp;</span>
          <span className="font-bold" style={{ fontFamily: MONO }}>
            7F-3A-C1
          </span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border-border bg-card text-muted-foreground flex-1 rounded-2xl border px-4 py-[15px] text-[15px] font-bold"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={onClose}
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
