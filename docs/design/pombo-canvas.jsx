// Pombo screens — Canvas (map), Send flow, Empty state, Settings + variations.

// ─────────────────────────────────────────────────────────────
// MAP CANVAS — peers float as cards at varied positions.
// Draw subtle concentric rings behind to evoke "near/far on network".
// ─────────────────────────────────────────────────────────────
const PEERS = [
  { id: 'ana',    name: 'Ana Martins',   device: 'MacBook da Ana',        kind: 'laptop',  tint: 'coral',  mono: 'AM', x: 0.28, y: 0.30, status: 'online',  distance: 'mesma sala' },
  { id: 'bruno',  name: 'Bruno',          device: 'Galaxy S24',            kind: 'phone',   tint: 'sun',    mono: 'B',  x: 0.52, y: 0.22, status: 'online',  distance: 'wi-fi · 2 metros' },
  { id: 'ceci',   name: 'Cecília',        device: 'iPad Pro',              kind: 'tablet',  tint: 'mint',   mono: 'C',  x: 0.76, y: 0.38, status: 'online',  distance: 'wi-fi' },
  { id: 'diego',  name: 'Diego Fernandes', device: 'ThinkPad-T14',         kind: 'laptop',  tint: 'sky',    mono: 'DF', x: 0.22, y: 0.62, status: 'idle',    distance: 'wi-fi' },
  { id: 'elena',  name: 'Elena',           device: 'PC-do-Escritório',     kind: 'desktop', tint: 'lilac',  mono: 'E',  x: 0.58, y: 0.68, status: 'online',  distance: 'ethernet' },
];

function PeerCard({ peer, selected, onSelect, style, compact }) {
  const tintBg = PomboTokens[peer.tint + 'Soft'];
  const tintFg = PomboTokens[peer.tint];
  const pad = compact ? 10 : 12;
  return (
    <button onClick={() => onSelect && onSelect(peer)} style={{
      position: 'absolute',
      left: `calc(${peer.x * 100}% - ${compact ? 66 : 82}px)`,
      top: `calc(${peer.y * 100}% - ${compact ? 42 : 46}px)`,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: `${pad}px ${pad + 4}px`, paddingRight: pad + 6,
      borderRadius: 18,
      background: PomboTokens.paper,
      border: `1.5px solid ${selected ? PomboTokens.coral : PomboTokens.line}`,
      boxShadow: selected
        ? `0 10px 28px rgba(232,106,78,0.22), 0 2px 6px rgba(0,0,0,0.06)`
        : '0 6px 18px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.05)',
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      transition: 'transform .15s, box-shadow .15s',
      ...style,
    }}>
      <div style={{ position: 'relative' }}>
        <Avatar name={peer.mono} bg={tintBg} fg={tintFg} size={compact ? 32 : 40} shape="squircle" />
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 16, height: 16, borderRadius: '50%', background: PomboTokens.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: PomboTokens.inkSoft,
        }}>
          <DeviceGlyph kind={peer.kind} size={10} color={PomboTokens.inkSoft} />
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: PomboTokens.ink, letterSpacing: -0.1, lineHeight: 1.2 }}>
          {peer.name}
        </div>
        <div style={{ fontSize: 10.5, color: PomboTokens.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
          {peer.device}
        </div>
      </div>
    </button>
  );
}

// Central "you" marker
function YouPin({ size = 68 }) {
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%,-50%)',
      width: size, height: size, borderRadius: '50%',
      background: PomboTokens.coral, color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 24px rgba(232,106,78,0.38), 0 0 0 8px ${PomboTokens.coralSoft}`,
      fontWeight: 700,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.85, textTransform: 'uppercase' }}>Você</div>
      <div style={{ fontSize: 16, marginTop: -2 }}>GM</div>
    </div>
  );
}

// Concentric rings + grid-noise background
function CanvasBg() {
  const T = window.PomboTokens;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="pgrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={T.bgGlow} stopOpacity={T.mode === 'dark' ? 0.55 : 0.5}/>
          <stop offset="60%" stopColor={T.cream} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#pgrad)"/>
      {[14, 24, 34, 44].map((r) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={T.mode === 'dark' ? 'rgba(244,236,224,0.06)' : 'rgba(30,20,10,0.06)'} strokeWidth="0.15" strokeDasharray="0.6 0.6"/>
      ))}
    </svg>
  );
}

// Main canvas screen (map)
function CanvasScreen({ selectedId = 'ana', onSelect = () => {} }) {
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <CanvasHeader count={5} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <CanvasBg />
          <YouPin />
          {PEERS.map((p) => (
            <PeerCard key={p.id} peer={p}
              selected={p.id === selectedId}
              onSelect={onSelect} />
          ))}
          {/* Hint badge */}
          <div style={{
            position: 'absolute', bottom: 20, left: 24,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 20,
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            fontSize: 12, color: PomboTokens.inkSoft,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={PomboTokens.coral} strokeWidth="1.8" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>
            Dica: arraste arquivos para um dispositivo ou clique para enviar
          </div>
          {/* Legend */}
          <div style={{
            position: 'absolute', top: 20, right: 24,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '7px 14px', borderRadius: 20,
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            fontSize: 11, color: PomboTokens.inkMute,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: PomboTokens.mint }}/>Online</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: PomboTokens.sun }}/>Inativo</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: PomboTokens.inkMute, opacity: 0.4 }}/>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PEERS, PeerCard, YouPin, CanvasBg, CanvasScreen });
