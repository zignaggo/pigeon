// Pombo — Empty state, Settings, Connection Request dialog, Variations

function EmptyState() {
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="canvas" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <CanvasHeader count={0} />
        <div style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 40,
        }}>
          <CanvasBg />
          {/* Animated rings w/ central you-pin */}
          <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 28 }}>
            {[60, 88, 118].map((r, i) => (
              <div key={i} style={{
                position: 'absolute', left: '50%', top: '50%',
                width: r*2, height: r*2, marginLeft: -r, marginTop: -r,
                borderRadius: '50%', border: `1.5px dashed ${PomboTokens.coral}`,
                opacity: 0.18 + i * 0.08,
              }}/>
            ))}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: 76, height: 76, borderRadius: '50%',
              background: PomboTokens.coral, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(232,106,78,0.4)',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M28 4L14 18M28 4l-10 24-4-10-10-4z"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -0.5, marginBottom: 8 }}>
            Procurando outros pombos…
          </div>
          <div style={{ fontSize: 14, color: PomboTokens.inkSoft, maxWidth: 420, lineHeight: 1.5 }}>
            Nenhum dispositivo por perto ainda. Peça para alguém abrir o Pombo na mesma rede, ou compartilhe seu código abaixo.
          </div>
          {/* Pairing code */}
          <div style={{
            marginTop: 28, display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px 10px 18px', borderRadius: 22,
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
          }}>
            <span style={{ fontSize: 11, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.5 }}>Seu código</span>
            <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 15, fontWeight: 600, color: PomboTokens.ink, letterSpacing: 2 }}>
              A42F-BC8K
            </span>
            <button style={{
              padding: '6px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: PomboTokens.creamDeep, color: PomboTokens.ink, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            }}>Copiar</button>
          </div>
          {/* Secondary */}
          <div style={{ marginTop: 18, display: 'flex', gap: 8, fontSize: 12, color: PomboTokens.inkMute }}>
            <span>Conectado a</span>
            <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', color: PomboTokens.inkSoft }}>Wi-Fi Casa</span>
            <span>·</span>
            <button style={{ border: 'none', background: 'transparent', color: PomboTokens.coral, cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: 0, fontFamily: 'inherit' }}>
              Inserir código manualmente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings screen
function SettingsScreen() {
  const Row = ({ label, desc, control }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '16px 20px', borderBottom: `1px solid ${PomboTokens.line}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: PomboTokens.ink }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
  const Toggle = ({ on = true }) => (
    <div style={{
      width: 36, height: 20, borderRadius: 10,
      background: on ? PomboTokens.coral : PomboTokens.creamDeep,
      position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: PomboTokens.paper,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left .2s',
      }}/>
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%', background: PomboTokens.cream }}>
      <PomboSidebar active="settings" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${PomboTokens.line}`,
          background: PomboTokens.surface,
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4, color: PomboTokens.ink }}>Ajustes</div>
          <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2 }}>
            Como você aparece na rede e onde os arquivos chegam
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Identity card */}
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            marginBottom: 20,
          }}>
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${PomboTokens.line}` }}>
              <Avatar name="GM" bg={PomboTokens.coralSoft} fg={PomboTokens.coral} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -0.2 }}>Gustavo Mendes</div>
                <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
                  Meu Notebook · #pombo-a42f
                </div>
              </div>
              <button style={{
                padding: '8px 14px', borderRadius: 16, border: `1px solid ${PomboTokens.line}`, cursor: 'pointer',
                background: PomboTokens.paper, color: PomboTokens.ink, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
              }}>Editar</button>
            </div>
            <Row label="Nome do dispositivo" desc="Como as outras pessoas te veem na rede"
              control={<input defaultValue="Meu Notebook" style={{
                padding: '8px 12px', borderRadius: 10, border: `1px solid ${PomboTokens.line}`,
                fontSize: 13, fontFamily: 'inherit', width: 200, outline: 'none', background: PomboTokens.cream,
              }}/>}/>
            <Row label="Visível na rede"
              desc="Outros dispositivos podem te encontrar automaticamente"
              control={<Toggle on />} />
            <Row label="Exigir aprovação"
              desc="Confirmar manualmente cada pedido de conexão"
              control={<Toggle on />} />
          </div>
          {/* Receiving */}
          <div style={{ fontSize: 11, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4, fontWeight: 600 }}>Recebimento</div>
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
            marginBottom: 20,
          }}>
            <Row label="Pasta de destino"
              desc="C:\Users\gustavo\Downloads\Pombo"
              control={<button style={{
                padding: '8px 14px', borderRadius: 16, border: `1px solid ${PomboTokens.line}`, cursor: 'pointer',
                background: PomboTokens.paper, color: PomboTokens.ink, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
              }}>Escolher…</button>} />
            <Row label="Abrir pasta após receber" control={<Toggle on={false} />} />
            <Row label="Notificar com som" control={<Toggle on />} />
          </div>
          {/* Security */}
          <div style={{ fontSize: 11, color: PomboTokens.inkMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4, fontWeight: 600 }}>Segurança</div>
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            background: PomboTokens.paper, border: `1px solid ${PomboTokens.line}`,
          }}>
            <Row label="Criptografia ponta a ponta" desc="AES-256 · ativada por padrão"
              control={<Toggle on />} />
            <Row label="Dispositivos confiáveis" desc="5 dispositivos salvos"
              control={<button style={{ border: 'none', background: 'transparent', color: PomboTokens.coral, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Gerenciar</button>} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Connection request (incoming) dialog
function ConnectionRequestDialog() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(30,20,10,0.25)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: 360, background: PomboTokens.paper, borderRadius: 18,
        boxShadow: '0 24px 70px rgba(30,20,10,0.3)',
        overflow: 'hidden', border: `1px solid ${PomboTokens.line}`,
      }}>
        {/* Header with peer */}
        <div style={{ padding: '24px 24px 18px', textAlign: 'center', position: 'relative' }}>
          <div style={{
            fontSize: 10, color: PomboTokens.coral, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PomboTokens.coral }}/>
            Pedido de conexão
          </div>
          <div style={{ margin: '14px auto 12px', position: 'relative', width: 72, height: 72 }}>
            <Avatar name="AM" bg={PomboTokens.coralSoft} fg={PomboTokens.coral} size={72} />
            <div style={{
              position: 'absolute', bottom: -3, right: -3,
              width: 26, height: 26, borderRadius: '50%', background: PomboTokens.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}>
              <DeviceGlyph kind="laptop" size={14} color={PomboTokens.inkSoft} />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: PomboTokens.ink, letterSpacing: -0.3 }}>Ana Martins</div>
          <div style={{ fontSize: 12, color: PomboTokens.inkMute, marginTop: 2, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>
            MacBook da Ana · 192.168.1.42
          </div>
        </div>
        {/* Details */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{
            borderRadius: 12, background: PomboTokens.cream,
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileIcon ext="pdf" size={28} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: PomboTokens.ink }}>Quer enviar 3 arquivos</div>
                <div style={{ fontSize: 11, color: PomboTokens.inkMute, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>48,2 MB no total</div>
              </div>
            </div>
            <div style={{
              padding: '8px 10px', borderRadius: 8, background: PomboTokens.paper,
              fontSize: 12, color: PomboTokens.inkSoft, fontStyle: 'italic', lineHeight: 1.4,
              border: `1px solid ${PomboTokens.line}`,
            }}>
              "Os PDFs do contrato que a gente conversou"
            </div>
          </div>
          {/* Fingerprint */}
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 10,
            background: PomboTokens.mintSoft,
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 11, color: PomboTokens.mode === 'dark' ? PomboTokens.mint : '#3C6A48',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l3 3 5-5"/><circle cx="7" cy="7" r="6"/></svg>
            <span>Canal seguro ·&nbsp;</span>
            <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontWeight: 600 }}>7F-3A-C1</span>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, padding: '12px', borderRadius: 14, border: `1px solid ${PomboTokens.line}`,
            background: PomboTokens.paper, color: PomboTokens.inkSoft, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Recusar</button>
          <button style={{
            flex: 2, padding: '12px', borderRadius: 14, border: 'none',
            background: PomboTokens.coral, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(232,106,78,0.35)',
          }}>Aceitar e receber</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EmptyState, SettingsScreen, ConnectionRequestDialog });
