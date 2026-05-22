# LocalSend (Pombo) — Contexto de Design

App desktop **Windows 11** para transferência de arquivos via rede local. Nome de trabalho do conceito: **Pombo** (metáfora do mensageiro). Linguagem da UI: **Português (BR)**.

---

## 1. Premissas do produto

- **Plataforma:** Windows 11 (frame com Mica translúcida, botões min/max/close, cantos arredondados de 10px).
- **Descoberta de peers:** auto-discovery na rede local **+ aprovação manual obrigatória** para receber arquivos (modelo "request-to-connect", mais seguro).
- **Interação primária:** seleção de peer no canvas → escolha de arquivos → envio. Drag-and-drop de arquivos sobre o peer também é suportado.
- **Visualização de peers padrão:** **mapa-canvas** com "você" no centro e dispositivos flutuando como cartões em volta (anéis concêntricos sugerem proximidade na rede).
- **Idioma da copy:** PT-BR coloquial, caloroso ("Procurando outros pombos…", "Solicitar envio a Ana").

## 2. Estilo visual

Direção: **playful & friendly** — quente, arredondado, sem cara de "ferramenta de TI".

### Tokens (`PomboTokens` em `pombo-app.jsx`)

| Token | Valor | Uso |
|---|---|---|
| `cream` | `#FBF6EF` | Fundo do app |
| `creamDeep` | `#F3EADC` | Fundos secundários, tracks de progresso |
| `paper` | `#FFFDF8` | Superfícies de cartões |
| `ink` | `#2A241E` | Texto primário |
| `inkSoft` | `#5B4E40` | Texto secundário |
| `inkMute` | `#8C7D6B` | Texto terciário / meta |
| `line` | `rgba(30,20,10,0.09)` | Bordas sutis |
| `coral` | `#E86A4E` | **Accent principal** |
| `coralSoft` | `#FBDDCF` | Accent tint |
| `mint` | `#8CB995` / `mintSoft` `#DCECDF` | Status online / sucesso |
| `sun` | `#F0B94E` / `sunSoft` `#FBEAC4` | Status idle / em trânsito |
| `sky` | `#6DA4BA` / `skySoft` `#D7E7EE` | Tints de avatar |
| `lilac` | `#B08CC7` / `lilacSoft` `#E8DBF0` | Tints de avatar |

Paletas de accent alternativas no painel Tweaks: coral (padrão), sun, mint, sky, lilac.

### Tipografia

- **UI:** Nunito (400/500/600/700/800)
- **Mono (IDs, IPs, tamanhos, códigos de pareamento):** Geist Mono (400/500/600)
- Tracking levemente apertado (`letter-spacing: -0.4` em títulos grandes, `-0.1`/`-0.2` em rótulos).

### Forma

- Raios de canto generosos: 8–22px em controles, **16–18px em cartões**, 18px em diálogos.
- Avatares: "squircle" (radius ≈ 36% do tamanho) ou círculo no radar.
- Sombras de cartão suaves e duplas: `0 6px 18px rgba(30,20,10,0.08), 0 1px 3px rgba(30,20,10,0.05)`.
- Estado selecionado: borda coral 1.5px + glow `0 10px 28px rgba(232,106,78,0.22)`.

### Iconografia

- SVG inline, stroke-only, `strokeWidth: 1.6`, `strokeLinecap/Join: round`. Sem emoji.
- Glifos de dispositivo: laptop, phone, tablet, desktop (em `DeviceGlyph`).
- Ícones de arquivo desenhados como "etiquetas" coloridas com a extensão impressa em mono (em `FileIcon`).

---

## 3. Sistema de telas

### Telas principais

1. **Canvas/Mapa (padrão)** — peer selecionável, hint flutuante, legenda de status.
2. **Primeira abertura (vazio)** — anéis pulsantes + código de pareamento `A42F-BC8K` para parear manualmente.
3. **Selecionar arquivos** — lista de arquivos selecionados, drop zone para adicionar, campo de mensagem opcional, toggle de criptografia, CTA "Solicitar envio".
4. **Em transferência** — anel de progresso + barra com gradiente coral→sun, stats em mono (velocidade, tempo restante, AES-256), lista de arquivos com mini-barras.
5. **Pedido de conexão (modal)** — avatar grande do remetente, IP, prévia de arquivos, mensagem dele, **fingerprint** do canal (`7F-3A-C1`), botões Recusar/Aceitar.
6. **Ajustes** — identidade, nome do dispositivo, visibilidade, exigir aprovação, pasta de destino, criptografia, dispositivos confiáveis.

### Layout fixo

- **Sidebar (220px)** — identidade no topo (avatar + nome + status de visibilidade), tabs `Na rede / Histórico / Favoritos / Ajustes`, rodapé com SSID + ID do peer.
- **Header da tela principal** — título + contador "5 online — escutando na rede local", busca, CTA "Enviar arquivos".

---

## 4. Variações exploradas

| Eixo | Opções no canvas |
|---|---|
| **Layout de peers** | A: Mapa (padrão) / B: Radar com varredura / C: Grade de cartões 3 colunas / D: Lista compacta |
| **Visualização de progresso** | A: Anel + barra (padrão) / B: Voo do pombo (trajetória curva entre remetente e destinatário) / C: Blocos segmentados estilo pacote (60 blocos em grid) |
| **Pedido de conexão** | A: Modal centrado com backdrop blur / B: Toast no canto inferior direito |
| **Estilo visual** | 5 accents trocáveis no painel Tweaks |

---

## 5. Dados de exemplo

### Peers fictícios (`PEERS` em `pombo-canvas.jsx`)

| ID | Nome | Dispositivo | Tipo | Status | Distância |
|---|---|---|---|---|---|
| ana | Ana Martins | MacBook da Ana | laptop | online | mesma sala |
| bruno | Bruno | Galaxy S24 | phone | online | wi-fi · 2 metros |
| ceci | Cecília | iPad Pro | tablet | online | wi-fi |
| diego | Diego Fernandes | ThinkPad-T14 | laptop | idle | wi-fi |
| elena | Elena | PC-do-Escritório | desktop | online | ethernet |

### Arquivos de exemplo

- `Proposta-Comercial-2026.pdf` (2,4 MB)
- `Protótipo-App-v3.fig` (18,7 MB, mostrado como zip)
- `reunião-cliente.mp4` (124 MB)
- `fotos-evento` (340 MB, 47 itens)
- Total: 485 MB

### Identidade do usuário

- Nome: Gustavo Mendes (avatar "GM")
- Dispositivo: "Meu Notebook"
- IP: 192.168.1.12
- ID: `#pombo-a42f`
- Código de pareamento: `A42F-BC8K`

---

## 6. Princípios de copy

- **Verbos no infinitivo curto:** "Enviar arquivos", "Solicitar envio", "Aceitar e receber".
- **Metáforas leves** ao redor do nome (pombo, voo, mensageiro) — sem exagerar.
- **Segurança visível mas calma:** "Canal seguro · 7F-3A-C1", "Criptografia ponta a ponta · AES-256".
- **Números em mono** para sensação técnica (tamanhos, velocidades, IPs, IDs).
- **Status humanos:** "mesma sala", "wi-fi · 2 metros", em vez de só "online".

---

## 7. Arquitetura de arquivos

```
# Desktop (Windows 11)
Pombo.html               ← shell + App() + Tweaks + DesignCanvas com 6 seções
design-canvas.jsx        ← starter (pan/zoom + artboards reordenáveis + focus mode)
win11-frame.jsx          ← chrome da janela Windows 11
pombo-app.jsx            ← tokens, Avatar, DeviceGlyph, FileIcon, Sidebar, CanvasHeader
pombo-canvas.jsx         ← PEERS, PeerCard, YouPin, CanvasBg, CanvasScreen
pombo-send.jsx           ← SendHeader, FileRow, SendScreenPicker, SendScreenTransfer, TransferRing, SAMPLE_FILES
pombo-states.jsx         ← EmptyState, SettingsScreen, ConnectionRequestDialog
pombo-variations.jsx     ← PeerGridScreen, PeerListScreen, RadarScreen, DoveFlightProgress, SegmentedProgress, ConnectionRequestToast

# Mobile (iPhone) — protótipo navegável
Pombo Mobile.html        ← shell + App() + Tweaks + PomboMobileApp (escala p/ caber no viewport)
ios-frame.jsx            ← bezel iOS (status bar, dynamic island, home indicator)
pombo-mobile-ui.jsx      ← primitivos: PMLogo, PMAppBar, PMTabBar, PMRadarHero, PMPeerRow, PMCard, PMFileRow, PMToggle, helpers
pombo-mobile-screens.jsx ← NickScreen, MainScreen, SendScreen, TransferScreen, RequestSheet, SettingsScreen, HistoryScreen + controlador de navegação
```

> A versão mobile **reaproveita** os mesmos tokens (`PomboTokens`) e átomos (`Avatar`, `DeviceGlyph`, `FileIcon`) e os dados `PEERS` do desktop — carregando `pombo-app.jsx` e `pombo-canvas.jsx` antes dos arquivos mobile.

Cada artboard envolve a tela num `<Win11Frame width={1100} height={720}>`. O canvas hospedeiro é o starter `design_canvas.jsx` (Figma-ish: pan/zoom, drag-reorder, rename inline, focus mode com ←/→).

### Convenções de código

- React 18 + Babel standalone via CDN com hashes de integridade fixados.
- **Sem `const styles = …`** no escopo de módulo — usar inline styles ou prefixo único (ex: `terminalStyles`). Cada `<script type="text/babel">` tem escopo próprio; componentes compartilhados são publicados em `window` no final do arquivo via `Object.assign(window, { … })`.
- Tweaks usam o protocolo padrão `__edit_mode_*` com bloco `/*EDITMODE-BEGIN*/…/*EDITMODE-END*/` em JSON para persistência.

---

## 8. Versão mobile (iPhone)

Protótipo **navegável** em `Pombo Mobile.html`, mesma linguagem visual (escuro + lilás por padrão, Tweaks ativos). Frame iOS via `ios-frame.jsx`.

### Fluxo

1. **Apelido (onboarding)** — logo Pombo, avatar que reflete as iniciais digitadas em tempo real, campo de nick (máx. 20), status "visível na Wi-Fi Casa", CTA **Entrar** + link "Parear com código QR". O apelido vira as iniciais do avatar em todas as telas.
2. **Por perto (principal)** — app bar grande com avatar + "Você está visível na rede"; **radar compacto** (você no centro, peers orbitando, anéis pulsantes, chip "5 por perto · Wi-Fi Casa"); lista de dispositivos em cartão agrupado (toque → envio); aba inferior.
3. **Selecionar arquivos** — push screen: lista de arquivos (removíveis) + total, "Adicionar arquivos", mensagem opcional, toggle de criptografia, CTA fixo "Solicitar envio a {nome}".
4. **Transferência** — anel + barra com **progresso animado** (0→100%), stats em mono (velocidade, tempo, AES-256), lista de arquivos com mini-barras; ao concluir vira estado "Enviado!" verde + "Concluir".
5. **Pedido de conexão** — **bottom sheet** (não modal centrado como no desktop): handle, remetente, prévia de arquivos, mensagem, fingerprint `7F-3A-C1`, Recusar / Aceitar e receber. Disparado pelo Tweak "Simular pedido de conexão".
6. **Histórico** — aba dedicada: enviados (seta coral) / recebidos (seta menta), agrupados por dia.
7. **Ajustes** — identidade, visibilidade, exigir aprovação, pasta de destino (Fotos · álbum Pombo), criptografia, dispositivos confiáveis.

### Navegação

Controlador `PomboMobileApp`: `entered` (onboarding feito), `tab` (`rede`/`historico`/`ajustes`), `route` (push: `send`/`transfer`), `sheet` (pedido de conexão). Telas de tab têm tab bar; telas em push entram por cima com slide e têm botão voltar + CTA inferior.

### Adaptações em relação ao desktop

- Sidebar de 220px → **tab bar inferior** (Por perto / Histórico / Ajustes).
- Mapa-canvas (você no centro, peers flutuando) → **radar compacto no topo + lista** (o mapa fica apertado no celular).
- Modal centrado de pedido de conexão → **bottom sheet**.
- Janela Win11 → **bezel iOS** com escala automática para caber no viewport.

## 9. Próximos passos sugeridos

- Favoritos / dispositivos confiáveis (tela dedicada).
- Estado de erro: conexão recusada, transferência cancelada pelo destinatário.
- Pareamento via QR code (tela real, hoje é só um link).
- Estado de **recebimento** no mobile (espelho do envio, ao aceitar um pedido).
- Variante Android (`android_frame`) derivada dos mesmos tokens.
- Onboarding com teclado iOS nativo e validação de apelido duplicado na rede.
