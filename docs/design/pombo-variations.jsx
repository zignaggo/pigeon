// Pombo — layout variations (grid, list, radar) for peer discovery,
// alt progress visualizations, alt connection request.

// ── GRID LAYOUT ──────────────────────────────────────────────
function PeerGridScreen() {
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <CanvasHeader count={5} />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PEERS.map((p) => {
              const tintBg = PomboTokens[p.tint + 'Soft'];
              const tintFg = PomboTokens[p.tint];
              return (
                <div key={p.id} style={{
                  background: PomboTokens.paper, borderRadius: 16, padding: 18,
                  border: `1px solid ${PomboTokens.line}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(30,20,10,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={p.mono} bg={tintBg} fg={tintFg} size={44} />
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 18, height: 18, borderRadius: '50%', background: PomboTokens.paper,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <DeviceGlyph kind={p.kind} size={11} color={PomboTokens.inkSoft} />
                      </div>
                    </div>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'idle' ? PomboTokens.sun : PomboTokens.mint, marginTop: 4 }}/>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -0.2, marginTop: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: PomboTokens.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>{p.device}</div>
                  <div style={{
                    marginTop: 'auto', paddingTop: 10, borderTop: `1px dashed ${PomboTokens.line}`, width: '100%',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 11, color: PomboTokens.inkMute,
                  }}>
                    <span>{p.distance}</span>
                    <button style={{
                      padding: '5px 10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: PomboTokens.coral, color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                    }}>Enviar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIST LAYOUT ──────────────────────────────────────────────
function PeerListScreen() {
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <CanvasHeader count={5} />
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          <div style={{ background: PomboTokens.paper, borderRadius: 16, border: `1px solid ${PomboTokens.line}`, overflow: 'hidden' }}>
            {PEERS.map((p, i) => {
              const tintBg = PomboTokens[p.tint + 'Soft'];
              const tintFg = PomboTokens[p.tint];
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < PEERS.length - 1 ? `1px solid ${PomboTokens.line}` : 'none',
                  cursor: 'pointer',
                }}>
                  <Avatar name={p.mono} bg={tintBg} fg={tintFg} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.name}
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.status === 'idle' ? PomboTokens.sun : PomboTokens.mint }}/>
                    </div>
                    <div style={{ fontSize: 11, color: PomboTokens.inkMute, marginTop: 2, display: 'flex', gap: 10, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
                      <DeviceGlyph kind={p.kind} size={12} color={PomboTokens.inkMute} />
                      <span>{p.device}</span>
                      <span>· {p.distance}</span>
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 14px', borderRadius: 16, border: `1px solid ${PomboTokens.line}`,
                    background: PomboTokens.paper, color: PomboTokens.ink, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1L5 6M10 1l-4 9-1.5-4L0 5z"/></svg>
                    Enviar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RADAR LAYOUT ─────────────────────────────────────────────
function RadarScreen() {
  const placements = [
    { r: 0.28, a: -70 },   // ana
    { r: 0.42, a: -30 },   // bruno
    { r: 0.32, a: 28 },    // ceci
    { r: 0.46, a: 160 },   // diego
    { r: 0.38, a: 98 },    // elena
  ];
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <CanvasHeader count={5} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* concentric rings */}
          <svg width="100%" height="100%" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id="rgrad">
                <stop offset="0%" stopColor="#FBDDCF" stopOpacity="0.5"/>
                <stop offset="70%" stopColor="#FBF6EF" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="50" fill="url(#rgrad)"/>
            {[10, 20, 30, 40].map((r) => (
              <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="rgba(30,20,10,0.08)" strokeWidth="0.2" />
            ))}
            <line x1="-50" y1="0" x2="50" y2="0" stroke="rgba(30,20,10,0.06)" strokeWidth="0.15"/>
            <line x1="0" y1="-50" x2="0" y2="50" stroke="rgba(30,20,10,0.06)" strokeWidth="0.15"/>
            {/* sweeping wedge */}
            <path d="M0,0 L45,0 A45,45 0 0,0 22,-39 Z" fill={PomboTokens.coral} opacity="0.08"/>
          </svg>
          {/* you */}
          <YouPin size={60} />
          {/* peers */}
          {PEERS.map((p, i) => {
            const { r, a } = placements[i];
            const rad = a * Math.PI / 180;
            const x = 50 + Math.cos(rad) * r * 48;
            const y = 50 + Math.sin(rad) * r * 48;
            const tintBg = PomboTokens[p.tint + 'Soft'];
            const tintFg = PomboTokens[p.tint];
            return (
              <div key={p.id} style={{
                position: 'absolute',
                left: `${x}%`, top: `${y}%`,
                transform: 'translate(-50%,-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={p.mono} bg={tintBg} fg={tintFg} size={40} shape="circle" />
                  <div style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    border: `1.5px solid ${tintFg}`, opacity: 0.25,
                  }}/>
                </div>
                <div style={{
                  padding: '3px 8px', borderRadius: 10, background: PomboTokens.paper,
                  border: `1px solid ${PomboTokens.line}`,
                  fontSize: 10.5, fontWeight: 600, color: PomboTokens.ink, whiteSpace: 'nowrap',
                }}>
                  {p.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ALT PROGRESS: dove-flight visualization ──────────────────
function DoveFlightProgress({ peer }) {
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SendHeader peer={peer} />
        <div style={{ flex: 1, overflow: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Flight track */}
          <div style={{
            position: 'relative', height: 160, background: PomboTokens.paper,
            borderRadius: 18, border: `1px solid ${PomboTokens.line}`,
            padding: 24, overflow: 'hidden',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 600 112" preserveAspectRatio="none" style={{ position: 'absolute', inset: 24, left: 24, right: 24 }}>
              <path d="M20,90 Q150,10 300,60 T580,35" fill="none" stroke={PomboTokens.lineHard} strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round"/>
              <path d="M20,90 Q150,10 300,60" fill="none" stroke={PomboTokens.coral} strokeWidth="3" strokeLinecap="round"/>
            </svg>
            {/* Sender */}
            <div style={{ position: 'absolute', left: 24, bottom: 20, textAlign: 'center' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: PomboTokens.coral, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                boxShadow: '0 6px 14px rgba(232,106,78,0.35)',
              }}>GM</div>
              <div style={{ fontSize: 10, color: PomboTokens.inkMute, marginTop: 6 }}>Você</div>
            </div>
            {/* Dove mid-flight */}
            <div style={{ position: 'absolute', left: '50%', top: '45%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{
                padding: '6px 12px', borderRadius: 14, background: PomboTokens.paper,
                border: `1.5px solid ${PomboTokens.coral}`,
                fontSize: 11, fontWeight: 600, color: PomboTokens.ink, whiteSpace: 'nowrap',
                boxShadow: '0 8px 20px rgba(30,20,10,0.12)',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: '"Geist Mono", ui-monospace, monospace',
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill={PomboTokens.coral}><path d="M6.5 1.5c2 0 3.8 1 4.5 3-1 .5-2.5.5-3.5 0 1 1.5 2 2.5 3.5 2.5-.5 2.5-3 4-5.5 3.5C3 10 1.5 7 2 4.5c1 0 2 .5 2.5 1-.5-1.5 0-3 2-4z"/></svg>
                62% · 204 MB
              </div>
            </div>
            {/* Receiver */}
            <div style={{ position: 'absolute', right: 24, top: 24, textAlign: 'center' }}>
              <Avatar name={peer.mono} bg={PomboTokens[peer.tint + 'Soft']} fg={PomboTokens[peer.tint]} size={38} />
              <div style={{ fontSize: 10, color: PomboTokens.inkMute, marginTop: 6 }}>{peer.name.split(' ')[0]}</div>
            </div>
          </div>
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Progresso', val: '62%', accent: PomboTokens.coral },
              { label: 'Velocidade', val: '24,6 MB/s' },
              { label: 'Restante', val: '~12 s' },
              { label: 'Criptografia', val: 'AES-256', accent: PomboTokens.mint },
            ].map((s) => (
              <div key={s.label} style={{
                background: PomboTokens.paper, borderRadius: 14, padding: '12px 14px',
                border: `1px solid ${PomboTokens.line}`,
              }}>
                <div style={{ fontSize: 10, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.accent || PomboTokens.ink, marginTop: 3, fontFamily: '"Geist Mono", ui-monospace, monospace', letterSpacing: -0.3 }}>{s.val}</div>
              </div>
            ))}
          </div>
          {/* Files mini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { ...SAMPLE_FILES[0], progress: 100, state: 'done' },
              { ...SAMPLE_FILES[1], progress: 100, state: 'done' },
              { ...SAMPLE_FILES[2], progress: 62, state: 'sending' },
              { ...SAMPLE_FILES[3], progress: 0, state: 'queued' },
            ].map((f, i) => <FileRow key={i} file={f} progress={f.progress} state={f.state} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ALT PROGRESS: segmented packet viz ──────────────────────
function SegmentedProgress({ peer }) {
  const blocks = 60, done = 38;
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SendHeader peer={peer} />
        <div style={{ flex: 1, overflow: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{
            background: PomboTokens.paper, borderRadius: 18, border: `1px solid ${PomboTokens.line}`,
            padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -1, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
                {Math.round(done/blocks*100)}<span style={{ fontSize: 18, color: PomboTokens.inkMute }}>%</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: PomboTokens.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>38 / 60 blocos · 204 MB / 485 MB</div>
                <div style={{ fontSize: 11, color: PomboTokens.inkMute, marginTop: 3 }}>~12 s restantes · 24,6 MB/s</div>
              </div>
              <button style={{
                padding: '8px 14px', borderRadius: 14, border: `1px solid ${PomboTokens.line}`,
                background: PomboTokens.paper, color: PomboTokens.inkSoft, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>Pausar</button>
            </div>
            {/* Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${blocks}, 1fr)`, gap: 3 }}>
              {Array.from({ length: blocks }).map((_, i) => (
                <div key={i} style={{
                  height: 22, borderRadius: 3,
                  background: i < done ? PomboTokens.coral
                    : i === done ? PomboTokens.sun
                    : PomboTokens.creamDeep,
                  opacity: i < done ? (0.5 + (i / done) * 0.5) : 1,
                }}/>
              ))}
            </div>
            <div style={{
              marginTop: 14, display: 'flex', gap: 20, fontSize: 11, color: PomboTokens.inkMute,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: PomboTokens.coral }}/>Confirmados</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: PomboTokens.sun }}/>Em trânsito</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: PomboTokens.creamDeep }}/>Pendentes</span>
            </div>
          </div>
          {/* Files */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { ...SAMPLE_FILES[0], progress: 100, state: 'done' },
              { ...SAMPLE_FILES[1], progress: 100, state: 'done' },
              { ...SAMPLE_FILES[2], progress: 62, state: 'sending' },
              { ...SAMPLE_FILES[3], progress: 0, state: 'queued' },
            ].map((f, i) => <FileRow key={i} file={f} progress={f.progress} state={f.state} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ALT CONNECTION REQUEST: compact toast ────────────────────
function ConnectionRequestToast() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 24, pointerEvents: 'none' }}>
      <div style={{
        width: 340, background: PomboTokens.paper, borderRadius: 16,
        boxShadow: '0 12px 40px rgba(30,20,10,0.18)',
        border: `1px solid ${PomboTokens.line}`,
        overflow: 'hidden', pointerEvents: 'auto',
      }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${PomboTokens.coral}, ${PomboTokens.sun})` }}/>
        <div style={{ padding: '14px 16px', display: 'flex', gap: 12 }}>
          <Avatar name="AM" bg={PomboTokens.coralSoft} fg={PomboTokens.coral} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: PomboTokens.inkSoft }}>
              <strong style={{ color: PomboTokens.ink }}>Ana Martins</strong> quer te enviar
            </div>
            <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
              <FileIcon ext="pdf" size={14}/> 3 arquivos · 48,2 MB
            </div>
            <div style={{ fontSize: 11, color: PomboTokens.inkMute, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={PomboTokens.mint} strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M3 5.5l2 2 3.5-4"/></svg>
              Canal seguro · <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontWeight: 600 }}>7F-3A-C1</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: `1px solid ${PomboTokens.line}` }}>
          <button style={{
            flex: 1, padding: '11px', border: 'none', background: 'transparent',
            color: PomboTokens.inkSoft, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            borderRight: `1px solid ${PomboTokens.line}`,
          }}>Recusar</button>
          <button style={{
            flex: 1, padding: '11px', border: 'none', background: 'transparent',
            color: PomboTokens.coral, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PeerGridScreen, PeerListScreen, RadarScreen, DoveFlightProgress, SegmentedProgress, ConnectionRequestToast });
