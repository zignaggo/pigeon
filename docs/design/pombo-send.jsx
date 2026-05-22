// Pombo — Send flow: peer selected → file picker → transfer + progress

function SendHeader({ peer, onBack }) {
  const tintBg = PomboTokens[peer.tint + 'Soft'];
  const tintFg = PomboTokens[peer.tint];
  return (
    <div style={{
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: `1px solid ${PomboTokens.line}`,
      background: PomboTokens.surface,
    }}>
      <button onClick={onBack} style={{
        width: 32, height: 32, borderRadius: 8, border: `1px solid ${PomboTokens.line}`,
        background: PomboTokens.paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: PomboTokens.inkSoft,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7.5 2L3.5 6l4 4"/></svg>
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Enviar para</div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4, color: PomboTokens.ink, display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
          <Avatar name={peer.mono} bg={tintBg} fg={tintFg} size={26} />
          {peer.name}
          <span style={{ fontSize: 12, color: PomboTokens.inkMute, fontWeight: 400, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>· {peer.device}</span>
        </div>
      </div>
    </div>
  );
}

// File picker card state
const SAMPLE_FILES = [
  { name: 'Proposta-Comercial-2026.pdf', ext: 'pdf', size: '2,4 MB' },
  { name: 'Protótipo-App-v3.fig', ext: 'zip', size: '18,7 MB' },
  { name: 'reunião-cliente.mp4', ext: 'mp4', size: '124 MB' },
  { name: 'fotos-evento', ext: 'zip', size: '340 MB', badge: '47 itens' },
];

function FileRow({ file, progress, state = 'queued' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 12,
      background: PomboTokens.paper,
      border: `1px solid ${PomboTokens.line}`,
    }}>
      <FileIcon ext={file.ext} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: PomboTokens.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
        <div style={{ fontSize: 11, color: PomboTokens.inkMute, marginTop: 2, display: 'flex', gap: 8, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
          <span>{file.size}</span>
          {file.badge && <span>· {file.badge}</span>}
          {state === 'sending' && <span style={{ color: PomboTokens.coral }}>· enviando…</span>}
          {state === 'done' && <span style={{ color: PomboTokens.mint }}>· enviado</span>}
        </div>
        {progress != null && (
          <div style={{ marginTop: 6, height: 4, background: PomboTokens.creamDeep, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: state === 'done' ? PomboTokens.mint : PomboTokens.coral, borderRadius: 2 }} />
          </div>
        )}
      </div>
      {state === 'done' && (
        <div style={{ color: PomboTokens.mint }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 9.5l4 4 7-7"/></svg>
        </div>
      )}
      {state === 'queued' && (
        <button style={{
          width: 26, height: 26, borderRadius: 13, border: 'none',
          background: 'transparent', color: PomboTokens.inkMute, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l7 7M9 2l-7 7"/></svg>
        </button>
      )}
    </div>
  );
}

function DropZone({ hasFiles }) {
  if (hasFiles) return null;
  return (
    <div style={{
      border: `2px dashed ${PomboTokens.lineHard}`,
      borderRadius: 16, padding: '40px 24px',
      background: PomboTokens.surfaceSoft,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      color: PomboTokens.inkSoft,
    }}>
      <div style={{ display: 'flex', gap: -6 }}>
        <FileIcon ext="pdf" size={36} />
        <FileIcon ext="png" size={36} />
        <FileIcon ext="mp4" size={36} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: PomboTokens.ink, marginTop: 6 }}>Solte arquivos aqui</div>
      <div style={{ fontSize: 12, color: PomboTokens.inkMute }}>ou clique para escolher do seu computador</div>
    </div>
  );
}

// Send screen — pre-transfer (picking files)
function SendScreenPicker({ peer }) {
  const totalSize = '485 MB';
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SendHeader peer={peer} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* File list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink }}>Arquivos selecionados ({SAMPLE_FILES.length})</div>
              <div style={{ fontSize: 12, color: PomboTokens.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>Total: {totalSize}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SAMPLE_FILES.map((f, i) => <FileRow key={i} file={f} />)}
            </div>
          </div>
          {/* Drop zone */}
          <div style={{
            border: `1.5px dashed ${PomboTokens.lineHard}`,
            borderRadius: 14, padding: '18px', textAlign: 'center',
            background: PomboTokens.surfaceFaint,
            color: PomboTokens.inkMute, fontSize: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ verticalAlign: 'middle', marginRight: 6 }}><path d="M9 3v9M5 7l4-4 4 4M3 14h12"/></svg>
            Adicionar mais arquivos
          </div>
          {/* Message */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink, marginBottom: 6 }}>Mensagem (opcional)</div>
            <textarea defaultValue="Aqui estão os materiais pra reunião de amanhã! 📎"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: `1px solid ${PomboTokens.line}`, background: PomboTokens.paper,
                fontSize: 13, color: PomboTokens.ink, fontFamily: 'inherit',
                resize: 'none', outline: 'none', minHeight: 60,
              }}/>
          </div>
        </div>
        {/* Footer actions */}
        <div style={{
          padding: '14px 28px', borderTop: `1px solid ${PomboTokens.line}`,
          background: PomboTokens.surface,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: PomboTokens.inkSoft }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4, background: PomboTokens.coral,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>
            </span>
            Criptografar transferência
          </label>
          <div style={{ flex: 1 }} />
          <button style={{
            padding: '10px 16px', borderRadius: 20, border: `1px solid ${PomboTokens.line}`, cursor: 'pointer',
            background: PomboTokens.paper, color: PomboTokens.inkSoft, fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
          }}>Cancelar</button>
          <button style={{
            padding: '10px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: PomboTokens.coral, color: '#fff',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'inherit', boxShadow: '0 4px 10px rgba(232,106,78,0.35)',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1L5 7M11 1l-4 10-2-4-4-2z"/></svg>
            Solicitar envio a {peer.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}

// Send screen — in transit, showing progress.
function SendScreenTransfer({ peer }) {
  const files = [
    { ...SAMPLE_FILES[0], progress: 100, state: 'done' },
    { ...SAMPLE_FILES[1], progress: 100, state: 'done' },
    { ...SAMPLE_FILES[2], progress: 62, state: 'sending' },
    { ...SAMPLE_FILES[3], progress: 0, state: 'queued' },
  ];
  const totalPct = 42;
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SendHeader peer={peer} />
        <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Progress hero */}
          <div style={{
            borderRadius: 18, padding: '22px 24px',
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <TransferRing pct={totalPct} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Enviando agora</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -0.5, marginTop: 2 }}>
                  {totalPct}% <span style={{ fontSize: 14, color: PomboTokens.inkMute, fontWeight: 500, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>204 MB / 485 MB</span>
                </div>
                <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 4, display: 'flex', gap: 14, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
                  <span>↑ 24,6 MB/s</span>
                  <span>~12 s restantes</span>
                  <span style={{ color: PomboTokens.mint, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5V2.5M5 5v2.5M3 5h4"/><circle cx="5" cy="5" r="4"/></svg>
                    AES-256
                  </span>
                </div>
              </div>
              <button style={{
                padding: '9px 14px', borderRadius: 16, border: `1px solid ${PomboTokens.line}`,
                background: PomboTokens.paper, color: PomboTokens.inkSoft, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>Pausar</button>
            </div>
            {/* Bar */}
            <div style={{ height: 6, background: PomboTokens.creamDeep, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${totalPct}%`, height: '100%', background: `linear-gradient(90deg, ${PomboTokens.coral}, ${PomboTokens.sun})`, borderRadius: 3 }} />
            </div>
          </div>
          {/* Files */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink, marginBottom: 10 }}>Arquivos ({files.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((f, i) => <FileRow key={i} file={f} progress={f.progress} state={f.state} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransferRing({ pct = 42, size = 68 }) {
  const r = size/2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={PomboTokens.creamDeep} strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={PomboTokens.coral} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)} strokeLinecap="round"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: PomboTokens.coral,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 2L10 12M20 2l-7 18-3-8-8-3z"/></svg>
      </div>
    </div>
  );
}

Object.assign(window, { SendHeader, FileRow, DropZone, SendScreenPicker, SendScreenTransfer, TransferRing, SAMPLE_FILES });
