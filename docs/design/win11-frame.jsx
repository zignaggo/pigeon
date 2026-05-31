// Win11Frame — Windows 11 styled app window chrome
// Rounded corners, Mica-ish translucent titlebar, min/max/close glyph buttons.

function Win11Frame({ title = 'Pombo', icon, width = 1100, height = 720, children }) {
  const T = (window.PomboTokens) || { cream: '#FBF6EF', surface: 'rgba(255,253,248,0.72)', line: 'rgba(30,20,10,0.06)', ink: '#2A241E', inkSoft: '#4A3E33', coral: '#E86A4E' };
  return (
    <div style={{
      width, height, borderRadius: 10, overflow: 'hidden',
      background: T.cream,
      boxShadow: '0 28px 80px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08), 0 0 0 1px ' + T.line,
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
      color: T.ink,
    }}>
      {/* Title bar */}
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: T.surface,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${T.line}`,
        position: 'relative',
      }}>
        {/* Left: app icon + title (draggable region) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flex: 1, fontSize: 12, color: T.inkSoft }}>
          {icon ?? (
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: T.coral,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 10,
            }}>P</div>
          )}
          <span style={{ fontWeight: 500, letterSpacing: -0.1 }}>{title}</span>
        </div>
        {/* Right: window controls (Win11 glyphs) */}
        <div style={{ display: 'flex', alignSelf: 'stretch' }}>
          {[
            { svg: <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" /> },
            { svg: <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" /> },
            { svg: <><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" /><line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1" /></> },
          ].map((b, i) => (
            <div key={i} style={{
              width: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.inkSoft,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10">{b.svg}</svg>
            </div>
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { Win11Frame });
