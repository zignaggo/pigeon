// Pigeon shared atoms — ported from docs/design/pombo-app.jsx &
// pombo-mobile-ui.jsx. Colors come from shadcn tokens (see src/styles.css);
// only sizing/shape stays inline since it is prop-driven.
import { cn } from "../../lib/utils";

// Brand mark — coral rounded square with the paper-plane (dove) glyph.
export function PigeonLogo({ size = 44, radius }: { size?: number; radius?: number }) {
  const r = radius != null ? radius : size * 0.3;
  return (
    <div
      className="bg-primary text-primary-foreground flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        boxShadow: "0 8px 22px color-mix(in oklab, var(--primary) 38%, transparent)",
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M28 4L14 18M28 4l-10 24-4-10-10-4z" />
      </svg>
    </div>
  );
}

// Maps a design tint name to its shadcn chart token.
export type Tint = "coral" | "sun" | "mint" | "sky" | "lilac";
const TINT_VAR: Record<Tint, string> = {
  coral: "--chart-1",
  sun: "--chart-2",
  mint: "--chart-3",
  sky: "--chart-4",
  lilac: "--chart-5",
};

// Geometric monogram avatar. With no `tint` it uses the coral accent; a `tint`
// renders a soft chart-token wash + matching foreground.
export function PigeonAvatar({
  name = "AB",
  size = 44,
  shape = "squircle",
  tint,
  className,
}: {
  name?: string;
  size?: number;
  shape?: "squircle" | "circle";
  tint?: Tint;
  className?: string;
}) {
  const borderRadius = shape === "circle" ? "50%" : size * 0.36;
  const tintStyle = tint
    ? {
        background: `color-mix(in oklab, var(${TINT_VAR[tint]}) 20%, transparent)`,
        color: `var(${TINT_VAR[tint]})`,
      }
    : undefined;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold",
        !tint && "bg-accent text-primary",
        className,
      )}
      style={{ width: size, height: size, borderRadius, fontSize: size * 0.36, letterSpacing: -0.5, ...tintStyle }}
    >
      {name}
    </div>
  );
}

const MONO = '"Geist Mono", ui-monospace, monospace';
const EXT_VAR: Record<string, string> = {
  pdf: "--chart-1",
  zip: "--chart-2",
  key: "--chart-2",
  png: "--chart-3",
  jpg: "--chart-3",
  xlsx: "--chart-3",
  doc: "--chart-4",
  mp4: "--chart-5",
};

// File "tag" icon with the extension printed in mono.
export function FileIcon({ ext = "pdf", size = 34 }: { ext?: string; size?: number }) {
  const v = EXT_VAR[ext] || "--muted-foreground";
  return (
    <div
      className="relative flex shrink-0 items-end justify-center font-bold"
      style={{
        width: size,
        height: size * 1.18,
        borderRadius: 6,
        background: `color-mix(in oklab, var(${v}) 16%, transparent)`,
        color: `var(${v})`,
        padding: 3,
        fontSize: size * 0.28,
        letterSpacing: 0.3,
        fontFamily: MONO,
      }}
    >
      <span
        className="absolute"
        style={{ top: 4, left: 5, width: 8, height: 3, borderRadius: 2, background: "color-mix(in oklab, var(--foreground) 30%, transparent)" }}
      />
      {ext.toUpperCase()}
    </div>
  );
}

type DeviceKind = "laptop" | "phone" | "tablet" | "desktop";

// Stroke uses currentColor — set the color on a parent via a text-* class.
export function DeviceGlyph({ kind = "laptop", size = 18 }: { kind?: DeviceKind; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "laptop")
    return (
      <svg {...common}>
        <rect x="3" y="4" width="14" height="9" rx="1.4" />
        <path d="M1.5 16h17" />
      </svg>
    );
  if (kind === "phone")
    return (
      <svg {...common}>
        <rect x="6" y="2.5" width="8" height="15" rx="1.8" />
        <path d="M8.8 15.2h2.4" />
      </svg>
    );
  if (kind === "tablet")
    return (
      <svg {...common}>
        <rect x="3.5" y="2.5" width="13" height="15" rx="1.6" />
        <path d="M9 15h2" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="2" y="3.5" width="16" height="10" rx="1.4" />
      <path d="M7 17h6M10 13.5V17" />
    </svg>
  );
}

// Live status dot with halo when online. Uses chart tokens for status colors.
export function StatusDot({
  status = "online",
  size = 8,
}: {
  status?: "online" | "idle" | "offline";
  size?: number;
}) {
  const color =
    status === "online"
      ? "var(--chart-3)" // mint
      : status === "idle"
        ? "var(--chart-2)" // sun
        : "var(--muted-foreground)";
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color, opacity: status === "offline" ? 0.4 : 1 }}
      />
      {status === "online" && (
        <span
          className="absolute rounded-full"
          style={{ inset: -3, background: color, opacity: 0.28 }}
        />
      )}
    </span>
  );
}
