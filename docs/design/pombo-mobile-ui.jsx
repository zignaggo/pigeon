// Pombo Mobile — shared primitives. Reads window.PomboTokens (swapped per render
// by App) and window.PMCFG = { compact, dark }. Publishes components to window.

// Brand mark — coral rounded square with the paper-plane (dove) glyph.
function PMLogo({ size = 44, radius }) {
  const T = window.PomboTokens;
  const r = radius != null ? radius : size * 0.3;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: T.coral, color: '#fff', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 22px ${hexA(T.coral, 0.38)}`,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 4L14 18M28 4l-10 24-4-10-10-4z"/>
      </svg>
    </div>
  );
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function pmTint(tint) {
  const T = window.PomboTokens;
  return [T[tint + 'Soft'] || T.coralSoft, T[tint] || T.coral];
}

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Top app bar — clears the status bar / dynamic island.
function PMAppBar({ title, subtitle, left, right, big = false }) {
  const T = window.PomboTokens;
  return (
    <div style={{
      paddingTop: 54, paddingLeft: 18, paddingRight: 14, paddingBottom: big ? 6 : 12,
      background: T.surface, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderBottom: big ? 'none' : `1px solid ${T.line}`,
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, zIndex: 5,
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: big ? 28 : 19, fontWeight: 800, letterSpacing: -0.6, color: T.ink, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: T.inkMute, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// Circular icon button used in app bars.
function PMIconButton({ onClick, children, tinted = false }) {
  const T = window.PomboTokens;
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 13, flexShrink: 0,
      background: tinted ? T.coralSoft : T.paper, border: `1px solid ${T.line}`,
      color: tinted ? T.coral : T.inkSoft, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

// Live status dot.
function PMStatusDot({ status = 'online', size = 8 }) {
  const T = window.PomboTokens;
  const c = status === 'online' ? T.mint : status === 'idle' ? T.sun : T.inkMute;
  return (
    <span style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c, opacity: status === 'offline' ? 0.4 : 1 }} />
      {status === 'online' && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: c, opacity: 0.28 }} />}
    </span>
  );
}

// Compact radar hero — "you" in the center, peers orbiting, pulsing rings.
function PMRadarHero({ count = 5, network = 'Wi-Fi Casa', me = 'EU' }) {
  const T = window.PomboTokens;
  const compact = (window.PMCFG || {}).compact;
  const H = compact ? 188 : 214;
  const dots = [
    { a: -32, r: 0.62, tint: 'coral' },
    { a: 38,  r: 0.86, tint: 'sun' },
    { a: 108, r: 0.58, tint: 'mint' },
    { a: 162, r: 0.9,  tint: 'sky' },
    { a: 232, r: 0.7,  tint: 'lilac' },
  ];
  return (
    <div style={{ position: 'relative', height: H, overflow: 'hidden', flexShrink: 0 }}>
      {/* glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${hexA(T.coral, T.mode === 'dark' ? 0.22 : 0.16)}, transparent 62%)`,
      }} />
      {/* static rings */}
      {[58, 92, 128].map((r, i) => (
        <div key={r} style={{
          position: 'absolute', left: '50%', top: '54%',
          width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r,
          borderRadius: '50%', border: `1.5px dashed ${T.mode === 'dark' ? 'rgba(244,236,224,0.10)' : 'rgba(30,20,10,0.10)'}`,
        }} />
      ))}
      {/* pulse rings */}
      {[0, 1.1].map((d) => (
        <div key={d} style={{
          position: 'absolute', left: '50%', top: '54%', width: 256, height: 256, marginLeft: -128, marginTop: -128,
          borderRadius: '50%', border: `2px solid ${T.coral}`,
          animation: `pmPulse 3.4s ease-out ${d}s infinite`,
        }} />
      ))}
      {/* peer dots */}
      {dots.slice(0, count).map((d, i) => {
        const [bg, fg] = pmTint(d.tint);
        const rad = (d.a * Math.PI) / 180;
        const dist = 58 + d.r * 70;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '54%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          }}>
            <div style={{ animation: `pmDot 2.8s ease-in-out ${i * 0.4}s infinite` }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, border: `1.5px solid ${T.paper}`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
              }}>{['A', 'B', 'C', 'D', 'E'][i]}</div>
            </div>
          </div>
        );
      })}
      {/* you */}
      <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: T.coral, color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 10px 26px ${hexA(T.coral, 0.45)}, 0 0 0 7px ${T.coralSoft}`,
          animation: 'pmFloat 4s ease-in-out infinite', fontWeight: 800,
        }}>
          <span style={{ fontSize: 8, letterSpacing: 1, opacity: 0.85, textTransform: 'uppercase' }}>Você</span>
          <span style={{ fontSize: 14, marginTop: -1 }}>{me}</span>
        </div>
      </div>
      {/* network chip */}
      <div style={{
        position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
        padding: '6px 13px', borderRadius: 16, background: T.paper, border: `1px solid ${T.line}`,
        fontSize: 11.5, color: T.inkSoft, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      }}>
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke={T.coral} strokeWidth="1.5" strokeLinecap="round"><path d="M2 5c2-2 6-2 8 0M3.5 7c1.3-1.3 3.7-1.3 5 0"/><circle cx="6" cy="9" r=".8" fill={T.coral}/></svg>
        <span style={{ fontWeight: 700, color: T.ink }}>{count} por perto</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace' }}>{network}</span>
      </div>
    </div>
  );
}

function PMSectionLabel({ children, right }) {
  const T = window.PomboTokens;
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 8px' }}>
      <div style={{ fontSize: 11.5, color: T.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, flex: 1 }}>{children}</div>
      {right && <div style={{ fontSize: 12, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>{right}</div>}
    </div>
  );
}

// A tappable peer row (used inside a grouped card).
function PMPeerRow({ peer, onTap, isLast }) {
  const T = window.PomboTokens;
  const [bg, fg] = pmTint(peer.tint);
  return (
    <button onClick={() => onTap && onTap(peer)} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      padding: '13px 15px', background: 'transparent', cursor: 'pointer',
      border: 'none', borderBottom: isLast ? 'none' : `1px solid ${T.line}`,
      textAlign: 'left', fontFamily: 'inherit',
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={peer.mono} bg={bg} fg={fg} size={44} shape="squircle" />
        <div style={{
          position: 'absolute', bottom: -3, right: -3, width: 19, height: 19, borderRadius: '50%',
          background: T.paper, border: `1.5px solid ${T.cream}`, color: T.inkSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DeviceGlyph kind={peer.kind} size={11} color={T.inkSoft} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>{peer.name}</div>
        <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peer.device}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PMStatusDot status={peer.status} />
          <span style={{ fontSize: 11, color: T.inkMute }}>{peer.distance}</span>
        </div>
        <svg width="7" height="12" viewBox="0 0 8 14" style={{ marginRight: 1 }}><path d="M1 1l6 6-6 6" stroke={T.inkMute} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></svg>
      </div>
    </button>
  );
}

// Grouped card wrapper (the warm equivalent of an iOS inset list).
function PMCard({ children, style }) {
  const T = window.PomboTokens;
  return (
    <div style={{
      background: T.paper, borderRadius: 18, border: `1px solid ${T.line}`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

function PMFileRow({ file, progress, state = 'queued', removable, isLast }) {
  const T = window.PomboTokens;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px',
      borderBottom: isLast ? 'none' : `1px solid ${T.line}`,
    }}>
      <FileIcon ext={file.ext} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
        <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2, display: 'flex', gap: 8, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
          <span>{file.size}</span>
          {file.badge && <span>· {file.badge}</span>}
          {state === 'sending' && <span style={{ color: T.coral }}>· enviando…</span>}
          {state === 'done' && <span style={{ color: T.mint }}>· enviado</span>}
        </div>
        {progress != null && (
          <div style={{ marginTop: 7, height: 4, background: T.creamDeep, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: state === 'done' ? T.mint : T.coral, borderRadius: 2, transition: 'width .3s' }} />
          </div>
        )}
      </div>
      {state === 'done' && (
        <div style={{ color: T.mint, flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 9.5l4 4 7-7"/></svg>
        </div>
      )}
      {state === 'queued' && removable && (
        <div style={{ width: 24, height: 24, borderRadius: 12, color: T.inkMute, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l7 7M9 2l-7 7"/></svg>
        </div>
      )}
    </div>
  );
}

function PMToggle({ on = true, onChange }) {
  const T = window.PomboTokens;
  return (
    <button onClick={() => onChange && onChange(!on)} style={{
      width: 46, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', padding: 0,
      background: on ? T.coral : T.creamDeep, position: 'relative', transition: 'background .2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left .2s',
      }} />
    </button>
  );
}

// Bottom tab bar — sits above the home indicator.
function PMTabBar({ active = 'rede', onChange }) {
  const T = window.PomboTokens;
  const tabs = [
    { id: 'rede', label: 'Por perto', icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={a ? 1.9 : 1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="7" opacity=".4"/></svg>
    ) },
    { id: 'historico', label: 'Histórico', icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={a ? 1.9 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M8 4.5v3.5l2.4 1.4"/><circle cx="8" cy="8" r="6"/></svg>
    ) },
    { id: 'ajustes', label: 'Ajustes', icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={a ? 1.9 : 1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4"/></svg>
    ) },
  ];
  return (
    <div style={{
      flexShrink: 0, paddingBottom: 26, paddingTop: 9,
      background: T.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: `1px solid ${T.line}`, display: 'flex',
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? T.coral : T.inkMute,
          }}>
            {t.icon(on)}
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  PMLogo, hexA, pmTint, initialsOf, PMAppBar, PMIconButton, PMStatusDot,
  PMRadarHero, PMSectionLabel, PMPeerRow, PMCard, PMFileRow, PMToggle, PMTabBar,
});
