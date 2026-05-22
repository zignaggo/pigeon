// Pombo Mobile — screens + navigation controller.
// Uses window primitives: PM* (pombo-mobile-ui.jsx), Avatar/DeviceGlyph/FileIcon
// (pombo-app.jsx), PEERS (pombo-canvas.jsx), IOSDevice (ios-frame.jsx).

const { useState: mUseState, useEffect: mUseEffect, useRef: mUseRef } = React;

const MFILES = [
  { name: 'Proposta-Comercial-2026.pdf', ext: 'pdf', size: '2,4 MB' },
  { name: 'Protótipo-App-v3.fig', ext: 'zip', size: '18,7 MB' },
  { name: 'reunião-cliente.mp4', ext: 'mp4', size: '124 MB' },
  { name: 'fotos-evento', ext: 'zip', size: '340 MB', badge: '47 itens' },
];

const MHISTORY = [
  { day: 'Hoje', items: [
    { dir: 'out', name: 'Proposta-Comercial-2026.pdf', ext: 'pdf', peer: 'Ana Martins', time: '14:32', size: '2,4 MB' },
    { dir: 'in',  name: 'briefing-marca.zip', ext: 'zip', peer: 'Bruno', time: '11:08', size: '64 MB' },
  ]},
  { day: 'Ontem', items: [
    { dir: 'out', name: 'reunião-cliente.mp4', ext: 'mp4', peer: 'Cecília', time: '19:47', size: '124 MB' },
    { dir: 'in',  name: 'fotos-viagem', ext: 'jpg', peer: 'Elena', time: '16:20', size: '208 MB' },
    { dir: 'out', name: 'contrato-final.pdf', ext: 'pdf', peer: 'Diego Fernandes', time: '09:15', size: '1,1 MB' },
  ]},
];

// ── Onboarding / nickname ────────────────────────────────────
function NickScreen({ onEnter }) {
  const T = window.PomboTokens;
  const [draft, setDraft] = mUseState('');
  const ref = mUseRef(null);
  mUseEffect(() => { const id = setTimeout(() => ref.current && ref.current.focus(), 350); return () => clearTimeout(id); }, []);
  const ok = draft.trim().length >= 1;
  const ini = ok ? initialsOf(draft) : '·';
  const go = () => { if (ok) onEnter(draft.trim()); };

  return (
    <div className="pm-screen" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.cream, position: 'relative', overflow: 'hidden' }}>
      {/* soft glow top */}
      <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(T.coral, T.mode === 'dark' ? 0.2 : 0.14)}, transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 28px 0', position: 'relative', zIndex: 1 }}>
        {/* brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 34 }}>
          <div style={{ animation: 'pmFloat 4s ease-in-out infinite' }}><PMLogo size={62} /></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, color: T.ink }}>Pombo</div>
            <div style={{ fontSize: 14, color: T.inkMute, marginTop: 4, lineHeight: 1.4, maxWidth: 240 }}>Envie arquivos para quem está perto de você, sem internet.</div>
          </div>
        </div>

        {/* live avatar preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={ini} bg={T.coralSoft} fg={T.coral} size={76} shape="squircle" />
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: T.paper, border: `1.5px solid ${T.cream}`, color: T.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeviceGlyph kind="phone" size={13} color={T.inkSoft} />
            </div>
          </div>
        </div>

        {/* input */}
        <label style={{ fontSize: 12, color: T.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, paddingLeft: 4 }}>Como quer ser chamado?</label>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 4px 16px', background: T.paper, border: `1.5px solid ${draft ? T.coral : T.line}`, borderRadius: 16, transition: 'border-color .2s' }}>
          <input ref={ref} value={draft} maxLength={20}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
            placeholder="Seu apelido"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 17, fontWeight: 600, color: T.ink, fontFamily: 'inherit' }} />
          <span style={{ fontSize: 12, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace', paddingRight: 6 }}>{draft.length}/20</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 4, fontSize: 12, color: T.inkMute }}>
          <PMStatusDot status="online" size={7} />
          <span>Neste iPhone · visível na <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', color: T.inkSoft }}>Wi-Fi Casa</span></span>
        </div>
      </div>

      {/* bottom CTA */}
      <div style={{ padding: '14px 28px 30px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
        <button onClick={go} disabled={!ok} style={{
          width: '100%', padding: '16px', borderRadius: 18, border: 'none', cursor: ok ? 'pointer' : 'default',
          background: ok ? T.coral : T.creamDeep, color: ok ? '#fff' : T.inkMute,
          fontSize: 16, fontWeight: 700, fontFamily: 'inherit', letterSpacing: -0.2,
          boxShadow: ok ? `0 10px 24px ${hexA(T.coral, 0.4)}` : 'none', transition: 'all .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Entrar
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h9M8 4l4 4-4 4"/></svg>
        </button>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.inkMute, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="8.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="8.5" width="5" height="5" rx="1"/><path d="M8.5 8.5h2M13.5 8.5v5M8.5 13.5h2"/></svg>
          Parear com código QR
        </button>
      </div>
    </div>
  );
}

// ── Main (Por perto) ─────────────────────────────────────────
function MainScreen({ me, onPeer }) {
  const T = window.PomboTokens;
  return (
    <>
      <PMAppBar big
        left={<Avatar name={me} bg={T.coralSoft} fg={T.coral} size={40} shape="squircle" />}
        title="Por perto"
        subtitle={<><PMStatusDot status="online" size={7} /> Você está visível na rede</>}
        right={<PMIconButton><svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="8.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="8.5" width="5" height="5" rx="1"/><path d="M8.5 8.5h2M13.5 8.5v5M8.5 13.5h2"/></svg></PMIconButton>}
      />
      <div className="pm-screen" style={{ flex: 1, overflow: 'auto', padding: '4px 16px 20px' }}>
        <PMRadarHero count={PEERS.length} me={me} />
        <div style={{ marginTop: 6 }}>
          <PMSectionLabel right={`${PEERS.filter((p) => p.status === 'online').length} online`}>Dispositivos</PMSectionLabel>
          <PMCard>
            {PEERS.map((p, i) => (
              <PMPeerRow key={p.id} peer={p} onTap={onPeer} isLast={i === PEERS.length - 1} />
            ))}
          </PMCard>
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12.5, color: T.inkMute }}>
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke={T.coral} strokeWidth="1.8" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>
          Toque num dispositivo para enviar arquivos
        </div>
      </div>
    </>
  );
}

// ── Send: file picker ────────────────────────────────────────
function SendScreen({ peer, onBack, onSend }) {
  const T = window.PomboTokens;
  const [enc, setEnc] = mUseState(true);
  const [bg, fg] = pmTint(peer.tint);
  const first = peer.name.split(' ')[0];
  return (
    <div className="pm-screen" style={{ position: 'absolute', inset: 0, zIndex: 20, background: T.cream, display: 'flex', flexDirection: 'column', animation: 'pmSlideIn .28s cubic-bezier(.4,0,.2,1)' }}>
      <PushHeader onBack={onBack} eyebrow="Enviar para"
        title={<><Avatar name={peer.mono} bg={bg} fg={fg} size={24} shape="squircle" /> {peer.name}</>} />
      <div className="pm-screen" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 16px' }}>
        <PMSectionLabel right="Total: 485 MB">Arquivos ({MFILES.length})</PMSectionLabel>
        <PMCard>
          {MFILES.map((f, i) => <PMFileRow key={i} file={f} removable isLast={i === MFILES.length - 1} />)}
        </PMCard>
        <button style={{ width: '100%', marginTop: 12, padding: '14px', borderRadius: 14, border: `1.5px dashed ${T.lineHard}`, background: T.surfaceFaint, color: T.inkSoft, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9M5 7l4-4 4 4M3 14h12"/></svg>
          Adicionar arquivos
        </button>

        <div style={{ marginTop: 18 }}>
          <PMSectionLabel>Mensagem (opcional)</PMSectionLabel>
          <textarea defaultValue="Aqui estão os materiais pra reunião de amanhã!"
            style={{ width: '100%', padding: '13px 15px', borderRadius: 16, border: `1px solid ${T.line}`, background: T.paper, fontSize: 14, color: T.ink, fontFamily: 'inherit', resize: 'none', outline: 'none', minHeight: 64 }} />
        </div>

        <div style={{ marginTop: 16 }}>
          <PMCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T.mintSoft, color: T.mode === 'dark' ? T.mint : '#3C6A48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7v-.01M4 6V4.5a3 3 0 016 0V6M3 6h8v6H3z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>Criptografar transferência</div>
                <div style={{ fontSize: 11.5, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace', marginTop: 1 }}>AES-256 · ponta a ponta</div>
              </div>
              <PMToggle on={enc} onChange={setEnc} />
            </div>
          </PMCard>
        </div>
      </div>

      <BottomBar>
        <button onClick={onSend} style={{ flex: 1, padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', background: T.coral, color: '#fff', fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: `0 8px 20px ${hexA(T.coral, 0.4)}` }}>
          <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1L5 7M11 1l-4 10-2-4-4-2z"/></svg>
          Solicitar envio a {first}
        </button>
      </BottomBar>
    </div>
  );
}

// ── Transfer (animated) ──────────────────────────────────────
function TransferScreen({ peer, onBack, onDone }) {
  const T = window.PomboTokens;
  const [bg, fg] = pmTint(peer.tint);
  const [pct, setPct] = mUseState(0);
  const [paused, setPaused] = mUseState(false);
  mUseEffect(() => {
    if (paused || pct >= 100) return;
    const id = setTimeout(() => setPct((p) => Math.min(100, p + (p > 80 ? 2.5 : 4.5))), 110);
    return () => clearTimeout(id);
  }, [pct, paused]);
  const done = pct >= 100;

  // per-file derived states from overall pct
  const cum = [2.4, 18.7, 124, 340]; // MB cumulative-ish weighting
  const fileState = (i) => {
    const thresholds = [8, 18, 70, 100];
    if (pct >= thresholds[i]) return { state: 'done', progress: 100 };
    const prev = i === 0 ? 0 : thresholds[i - 1];
    if (pct > prev) return { state: 'sending', progress: Math.round(((pct - prev) / (thresholds[i] - prev)) * 100) };
    return { state: 'queued', progress: 0 };
  };
  const mbSent = Math.round((pct / 100) * 485);

  return (
    <div className="pm-screen" style={{ position: 'absolute', inset: 0, zIndex: 20, background: T.cream, display: 'flex', flexDirection: 'column', animation: 'pmSlideIn .28s cubic-bezier(.4,0,.2,1)' }}>
      <PushHeader onBack={onBack} eyebrow={done ? 'Concluído' : 'Enviando para'}
        title={<><Avatar name={peer.mono} bg={bg} fg={fg} size={24} shape="squircle" /> {peer.name}</>} />
      <div className="pm-screen" style={{ flex: 1, overflow: 'auto', padding: '18px 16px' }}>
        {/* progress hero */}
        <PMCard style={{ padding: '22px 20px', textAlign: 'center' }}>
          <RingBig pct={pct} done={done} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, color: T.ink, marginTop: 14 }}>
            {done ? 'Enviado!' : `${Math.round(pct)}%`}
          </div>
          <div style={{ fontSize: 13, color: T.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
            {done ? '485 MB · 4 arquivos entregues' : `${mbSent} MB / 485 MB`}
          </div>
          {!done && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 12, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace', flexWrap: 'wrap' }}>
              <span>↑ 24,6 MB/s</span>
              <span>~{Math.max(1, Math.round((100 - pct) / 8))} s</span>
              <span style={{ color: T.mint, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7v-.01M4 6V4.5a3 3 0 016 0V6M3 6h8v6H3z"/></svg>
                AES-256
              </span>
            </div>
          )}
          {/* bar */}
          <div style={{ marginTop: 16, height: 7, background: T.creamDeep, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: done ? T.mint : `linear-gradient(90deg, ${T.coral}, ${T.sun})`, transition: 'width .15s linear' }} />
          </div>
          {!done && (
            <button onClick={() => setPaused((p) => !p)} style={{ marginTop: 16, padding: '10px 22px', borderRadius: 14, border: `1px solid ${T.line}`, background: T.paper, color: T.inkSoft, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              {paused ? 'Retomar' : 'Pausar'}
            </button>
          )}
        </PMCard>

        <div style={{ marginTop: 18 }}>
          <PMSectionLabel>Arquivos ({MFILES.length})</PMSectionLabel>
          <PMCard>
            {MFILES.map((f, i) => {
              const fs = fileState(i);
              return <PMFileRow key={i} file={f} progress={fs.progress} state={fs.state} isLast={i === MFILES.length - 1} />;
            })}
          </PMCard>
        </div>
      </div>

      {done && (
        <BottomBar>
          <button onClick={onDone} style={{ flex: 1, padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', background: T.coral, color: '#fff', fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', boxShadow: `0 8px 20px ${hexA(T.coral, 0.4)}` }}>
            Concluir
          </button>
        </BottomBar>
      )}
    </div>
  );
}

function RingBig({ pct, done, size = 96 }) {
  const T = window.PomboTokens;
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.creamDeep} strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={done ? T.mint : T.coral} strokeWidth="7"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .15s linear, stroke .3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? T.mint : T.coral }}>
        {done ? (
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pmRise .35s ease' }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pmFloat 2.5s ease-in-out infinite' }}><path d="M20 2L10 12M20 2l-7 18-3-8-8-3z" /></svg>
        )}
      </div>
    </div>
  );
}

// ── Incoming connection request (bottom sheet) ───────────────
function RequestSheet({ onClose }) {
  const T = window.PomboTokens;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,12,6,0.45)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', animation: 'pmScrim .25s ease' }} />
      <div style={{ position: 'relative', background: T.paper, borderRadius: '26px 26px 0 0', padding: '10px 20px 30px', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)', animation: 'pmSheetUp .32s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: T.lineHard, margin: '0 auto 14px' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, color: T.coral, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.coral }} />
            Pedido de conexão
          </div>
          <div style={{ position: 'relative', width: 72, height: 72, margin: '14px auto 10px' }}>
            <Avatar name="AM" bg={T.coralSoft} fg={T.coral} size={72} shape="squircle" />
            <div style={{ position: 'absolute', bottom: -3, right: -3, width: 26, height: 26, borderRadius: '50%', background: T.paper, border: `1.5px solid ${T.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.inkSoft }}>
              <DeviceGlyph kind="laptop" size={14} color={T.inkSoft} />
            </div>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>Ana Martins</div>
          <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>MacBook da Ana · 192.168.1.42</div>
        </div>

        <div style={{ marginTop: 16, borderRadius: 14, background: T.cream, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <FileIcon ext="pdf" size={30} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Quer te enviar 3 arquivos</div>
              <div style={{ fontSize: 11.5, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>48,2 MB no total</div>
            </div>
          </div>
          <div style={{ padding: '9px 12px', borderRadius: 10, background: T.paper, border: `1px solid ${T.line}`, fontSize: 12.5, color: T.inkSoft, fontStyle: 'italic', lineHeight: 1.4 }}>
            "Os PDFs do contrato que a gente conversou"
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '11px 13px', borderRadius: 12, background: T.mintSoft, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T.mode === 'dark' ? T.mint : '#3C6A48' }}>
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l3 3 5-5" /><circle cx="7" cy="7" r="6" /></svg>
          <span>Canal seguro ·&nbsp;</span>
          <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontWeight: 700 }}>7F-3A-C1</span>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 11 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '15px', borderRadius: 16, border: `1px solid ${T.line}`, background: T.paper, color: T.inkSoft, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Recusar</button>
          <button onClick={onClose} style={{ flex: 1.7, padding: '15px', borderRadius: 16, border: 'none', background: T.coral, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 20px ${hexA(T.coral, 0.4)}` }}>Aceitar e receber</button>
        </div>
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────
function SettingsScreen({ me, nick }) {
  const T = window.PomboTokens;
  const Row = ({ label, desc, control, isLast }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 15px', borderBottom: isLast ? 'none' : `1px solid ${T.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
  return (
    <>
      <PMAppBar big title="Ajustes" />
      <div className="pm-screen" style={{ flex: 1, overflow: 'auto', padding: '4px 16px 20px' }}>
        {/* identity */}
        <PMCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 15px' }}>
            <Avatar name={me} bg={T.coralSoft} fg={T.coral} size={52} shape="squircle" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>{nick}</div>
              <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>iPhone · #pombo-a42f</div>
            </div>
            <button style={{ padding: '8px 15px', borderRadius: 14, border: `1px solid ${T.line}`, background: T.paper, color: T.ink, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Editar</button>
          </div>
        </PMCard>

        <div style={{ marginTop: 18 }} />
        <PMSectionLabel>Visibilidade</PMSectionLabel>
        <PMCard>
          <Row label="Visível na rede" desc="Outros podem te encontrar automaticamente" control={<PMToggle on />} />
          <Row label="Exigir aprovação" desc="Confirmar cada pedido de conexão" control={<PMToggle on />} isLast />
        </PMCard>

        <div style={{ marginTop: 18 }} />
        <PMSectionLabel>Recebimento</PMSectionLabel>
        <PMCard>
          <Row label="Salvar em" desc="Fotos · álbum Pombo" control={<svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" stroke={T.inkMute} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" /></svg>} />
          <Row label="Abrir após receber" control={<PMToggle on={false} />} />
          <Row label="Notificar com som" control={<PMToggle on />} isLast />
        </PMCard>

        <div style={{ marginTop: 18 }} />
        <PMSectionLabel>Segurança</PMSectionLabel>
        <PMCard>
          <Row label="Criptografia ponta a ponta" desc="AES-256 · ativada por padrão" control={<PMToggle on />} />
          <Row label="Dispositivos confiáveis" desc="5 dispositivos salvos" control={<svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" stroke={T.inkMute} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" /></svg>} isLast />
        </PMCard>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 11.5, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>Pombo · v1.0 · #pombo-a42f</div>
      </div>
    </>
  );
}

// ── History ──────────────────────────────────────────────────
function HistoryScreen() {
  const T = window.PomboTokens;
  const Item = ({ it, isLast }) => {
    const out = it.dir === 'out';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderBottom: isLast ? 'none' : `1px solid ${T.line}` }}>
        <FileIcon ext={it.ext} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
          <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            <span style={{ color: out ? T.coral : T.mint, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{out ? <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" /> : <path d="M6 2v8M2.5 6.5L6 10l3.5-3.5" />}</svg>
              {out ? 'Enviado para' : 'Recebido de'}
            </span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.peer}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>{it.time}</div>
          <div style={{ fontSize: 11, color: T.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace', marginTop: 2 }}>{it.size}</div>
        </div>
      </div>
    );
  };
  return (
    <>
      <PMAppBar big title="Histórico" />
      <div className="pm-screen" style={{ flex: 1, overflow: 'auto', padding: '4px 16px 20px' }}>
        {MHISTORY.map((grp, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 6 : 18 }}>
            <PMSectionLabel>{grp.day}</PMSectionLabel>
            <PMCard>
              {grp.items.map((it, i) => <Item key={i} it={it} isLast={i === grp.items.length - 1} />)}
            </PMCard>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Shared chrome for pushed screens ─────────────────────────
function PushHeader({ onBack, eyebrow, title }) {
  const T = window.PomboTokens;
  return (
    <div style={{ paddingTop: 54, paddingLeft: 12, paddingRight: 16, paddingBottom: 12, background: T.surface, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 13, border: 'none', background: 'transparent', color: T.coral, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: T.inkMute, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>{eyebrow}</div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, color: T.ink, display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>{title}</div>
      </div>
    </div>
  );
}

function BottomBar({ children }) {
  const T = window.PomboTokens;
  return (
    <div style={{ flexShrink: 0, padding: '12px 16px 28px', background: T.surface, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderTop: `1px solid ${T.line}`, display: 'flex', gap: 11 }}>
      {children}
    </div>
  );
}

// ── Controller ───────────────────────────────────────────────
function PomboMobileApp({ dark, simulateRequest }) {
  const T = window.PomboTokens;
  const [nick, setNick] = mUseState('');
  const [entered, setEntered] = mUseState(false);
  const [tab, setTab] = mUseState('rede');
  const [route, setRoute] = mUseState(null);
  const [sheet, setSheet] = mUseState(false);
  const [scale, setScale] = mUseState(1);
  const me = entered ? initialsOf(nick) : 'EU';

  mUseEffect(() => {
    const fit = () => {
      const vh = window.innerHeight, vw = window.innerWidth;
      const s = Math.min(1, (vh - 36) / (874 + 64), (vw - 24) / 402);
      setScale(s > 0.3 ? s : 0.5);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Simulate an incoming request shortly after entering.
  mUseEffect(() => {
    if (!entered || !simulateRequest) { setSheet(false); return; }
    if (route) return;
    const id = setTimeout(() => setSheet(true), 1600);
    return () => clearTimeout(id);
  }, [entered, simulateRequest]);

  const captionColor = dark ? 'rgba(255,255,255,0.42)' : 'rgba(40,30,20,0.45)';

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <IOSDevice dark={dark} width={402} height={874}>
        <div style={{ height: '100%', position: 'relative', background: T.cream, overflow: 'hidden' }}>
          {!entered ? (
            <NickScreen onEnter={(n) => { setNick(n); setEntered(true); setTab('rede'); }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'pmFadeIn .3s ease' }}>
              <div key={tab} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'pmFadeIn .25s ease' }}>
                {tab === 'rede' && <MainScreen me={me} onPeer={(p) => setRoute({ name: 'send', peer: p })} />}
                {tab === 'historico' && <HistoryScreen />}
                {tab === 'ajustes' && <SettingsScreen me={me} nick={nick} />}
              </div>
              <PMTabBar active={tab} onChange={(t) => { setRoute(null); setTab(t); }} />
            </div>
          )}

          {route && route.name === 'send' && (
            <SendScreen peer={route.peer} onBack={() => setRoute(null)} onSend={() => setRoute({ name: 'transfer', peer: route.peer })} />
          )}
          {route && route.name === 'transfer' && (
            <TransferScreen peer={route.peer} onBack={() => setRoute(null)} onDone={() => { setRoute(null); setTab('historico'); }} />
          )}

          {sheet && <RequestSheet onClose={() => setSheet(false)} />}
        </div>
      </IOSDevice>

      <div style={{ fontSize: 13, color: captionColor, fontFamily: 'Nunito, system-ui, sans-serif', textAlign: 'center', maxWidth: 360 }}>
        {entered ? 'Toque num dispositivo para enviar · navegue pelas abas' : 'Digite um apelido e toque em Entrar'}
      </div>
    </div>
  );
}

Object.assign(window, { PomboMobileApp });
