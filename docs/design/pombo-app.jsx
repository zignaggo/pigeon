// Pombo — main app screen components.
// Map-like canvas with peer cards that float around. Select a peer to open
// the send flow. Warm, playful, rounded.

const POMBO_LIGHT = {
  mode: 'light',
  cream: '#FBF6EF',
  creamDeep: '#F3EADC',
  paper: '#FFFDF8',
  surface: 'rgba(255,253,248,0.72)',
  surfaceSoft: 'rgba(255,253,248,0.5)',
  surfaceFaint: 'rgba(255,253,248,0.4)',
  ink: '#2A241E',
  inkSoft: '#5B4E40',
  inkMute: '#8C7D6B',
  line: 'rgba(30,20,10,0.09)',
  lineHard: 'rgba(30,20,10,0.14)',
  coral: '#E86A4E',
  coralSoft: '#FBDDCF',
  mint: '#8CB995',
  mintSoft: '#DCECDF',
  sun: '#F0B94E',
  sunSoft: '#FBEAC4',
  sky: '#6DA4BA',
  skySoft: '#D7E7EE',
  lilac: '#B08CC7',
  lilacSoft: '#E8DBF0',
  // backdrop-on-canvas radial gradient stop
  bgGlow: '#FBDDCF',
};

const POMBO_DARK = {
  mode: 'dark',
  cream: '#1A1612',              // app background
  creamDeep: '#0F0C09',          // progress track / deepest
  paper: '#241F1A',              // cards
  surface: 'rgba(36,31,26,0.72)',
  surfaceSoft: 'rgba(36,31,26,0.5)',
  surfaceFaint: 'rgba(36,31,26,0.35)',
  ink: '#F4ECE0',
  inkSoft: '#C3B5A2',
  inkMute: '#8B7F6E',
  line: 'rgba(244,236,224,0.08)',
  lineHard: 'rgba(244,236,224,0.18)',
  coral: '#F4836A',
  coralSoft: '#3E2018',
  mint: '#A8CDB0',
  mintSoft: '#1E2D22',
  sun: '#F0BE5E',
  sunSoft: '#3A2C12',
  sky: '#8FBED1',
  skySoft: '#1A2A30',
  lilac: '#C2A4D5',
  lilacSoft: '#2A2034',
  bgGlow: '#3E2018',
};

// Mutable runtime — App() copies LIGHT/DARK into it on mode switch.
const PomboTokens = { ...POMBO_LIGHT };

// Simple avatar — geometric monogram with warm tint.
function Avatar({ name = 'AB', bg = PomboTokens.coralSoft, fg = PomboTokens.coral, size = 44, shape = 'squircle' }) {
  const borderRadius = shape === 'circle' ? '50%' : size * 0.36;
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: -0.5,
      flexShrink: 0,
    }}>{name}</div>
  );
}

function DeviceGlyph({ kind = 'laptop', size = 18, color = 'currentColor' }) {
  const s = size;
  if (kind === 'laptop') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="9" rx="1.4"/><path d="M1.5 16h17"/>
    </svg>
  );
  if (kind === 'phone') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2.5" width="8" height="15" rx="1.8"/><path d="M8.8 15.2h2.4"/>
    </svg>
  );
  if (kind === 'tablet') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="2.5" width="13" height="15" rx="1.6"/><path d="M9 15h2"/>
    </svg>
  );
  if (kind === 'desktop') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.5" width="16" height="10" rx="1.4"/><path d="M7 17h6M10 13.5V17"/>
    </svg>
  );
  return null;
}

function FileIcon({ ext = 'pdf', tint = PomboTokens.coral, size = 34 }) {
  const bg = {
    pdf: PomboTokens.coralSoft, zip: PomboTokens.sunSoft, png: PomboTokens.mintSoft,
    jpg: PomboTokens.mintSoft, mp4: PomboTokens.lilacSoft, doc: PomboTokens.skySoft,
    xlsx: PomboTokens.mintSoft, key: PomboTokens.sunSoft,
  }[ext] || PomboTokens.creamDeep;
  const fg = {
    pdf: PomboTokens.coral, zip: PomboTokens.sun, png: PomboTokens.mint,
    jpg: PomboTokens.mint, mp4: PomboTokens.lilac, doc: PomboTokens.sky,
    xlsx: PomboTokens.mint, key: PomboTokens.sun,
  }[ext] || PomboTokens.inkSoft;
  return (
    <div style={{
      width: size, height: size * 1.18, borderRadius: 6,
      background: bg, color: fg,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: 3,
      fontSize: size * 0.28, fontWeight: 700, letterSpacing: 0.3,
      fontFamily: '"Geist Mono", ui-monospace, monospace',
      position: 'relative',
      flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 4, left: 5, width: 8, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.7)' }} />
      {ext.toUpperCase()}
    </div>
  );
}

// Sidebar — device identity, tabs, status
function PomboSidebar({ active = 'canvas', deviceName = 'Meu Notebook', visible = true, compact = false }) {
  const tabs = [
    { id: 'canvas', label: 'Na rede', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="7" opacity=".4"/></svg>
    ) },
    { id: 'history', label: 'Histórico', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4v4l2.5 1.5"/><circle cx="8" cy="8" r="6"/></svg>
    ) },
    { id: 'favorites', label: 'Favoritos', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.8l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 11l-3.2 1.7.6-3.6L2.8 6.6l3.6-.5z"/></svg>
    ) },
    { id: 'settings', label: 'Ajustes', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4"/></svg>
    ) },
  ];
  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: `1px solid ${PomboTokens.line}`,
      display: 'flex', flexDirection: 'column',
      background: PomboTokens.surfaceSoft,
    }}>
      {/* Identity */}
      <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${PomboTokens.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="GM" bg={PomboTokens.coralSoft} fg={PomboTokens.coral} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink, letterSpacing: -0.1 }}>{deviceName}</div>
            <div style={{ fontSize: 11, color: PomboTokens.inkMute, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: visible ? PomboTokens.mint : PomboTokens.inkMute }} />
              {visible ? 'Visível na rede' : 'Oculto'}
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ padding: 8, flex: 1 }}>
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: on ? 600 : 500,
              color: on ? PomboTokens.ink : PomboTokens.inkSoft,
              background: on ? PomboTokens.paper : 'transparent',
              boxShadow: on ? `0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px ${PomboTokens.line}` : 'none',
              marginBottom: 2, cursor: 'pointer',
            }}>
              {t.icon}
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.id === 'canvas' && !compact && <span style={{ fontSize: 11, color: PomboTokens.inkMute, fontVariantNumeric: 'tabular-nums' }}>5</span>}
            </div>
          );
        })}
      </div>
      {/* Network footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${PomboTokens.line}`, fontSize: 11, color: PomboTokens.inkMute }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 5c2-2 6-2 8 0M3.5 7c1.3-1.3 3.7-1.3 5 0"/><circle cx="6" cy="9" r=".8" fill="currentColor"/></svg>
          Casa · 192.168.1.12
        </div>
        <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, opacity: 0.7 }}>#pombo-a42f</div>
      </div>
    </div>
  );
}

// Canvas header with search + status
function CanvasHeader({ count = 5, onCompose }) {
  return (
    <div style={{
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: `1px solid ${PomboTokens.line}`,
      background: PomboTokens.surface,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4, color: PomboTokens.ink }}>
          Dispositivos por perto
        </div>
        <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: PomboTokens.mint }} />
            <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: PomboTokens.mint, opacity: 0.3 }} />
          </span>
          {count} online — escutando na rede local
        </div>
      </div>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderRadius: 18,
        background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
        width: 220, fontSize: 13, color: PomboTokens.inkMute,
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="3.5"/><path d="M8.5 8.5L11 11"/></svg>
        Buscar dispositivo…
      </div>
      {/* Compose */}
      <button onClick={onCompose} style={{
        padding: '9px 16px', borderRadius: 18, border: 'none', cursor: 'pointer',
        background: PomboTokens.ink, color: PomboTokens.cream,
        fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'inherit',
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 2v9M2 6.5h9"/></svg>
        Enviar arquivos
      </button>
    </div>
  );
}

Object.assign(window, {
  PomboTokens, POMBO_LIGHT, POMBO_DARK,
  Avatar, DeviceGlyph, FileIcon, PomboSidebar, CanvasHeader,
});
