# Design — Pombo (direção do produto)

Bundle de design para o app de transferência de arquivos na rede local, em **PT-BR**.
Cobre **desktop (Windows 11)** e **mobile (iPhone)** com a mesma linguagem visual.

> ⚠️ **Escopo.** Este material é a direção do **produto**, não da POC. O `CLAUDE.md`
> na raiz trata "design system" como fora do escopo da POC (validar viabilidade
> Tauri desktop+Android). Use estes arquivos como referência ao evoluir a UI para o
> produto — não como bloqueio para a POC.

## Por onde começar

Leia [`CONTEXT.md`](./CONTEXT.md) — é o documento-fonte: premissas, tokens, telas,
copy, arquitetura e próximos passos.

## Conteúdo

| Arquivo | O que é |
|---|---|
| `CONTEXT.md` | Documento de contexto completo do design (ler primeiro) |
| `Pombo.html` | Protótipo desktop — shell + App + DesignCanvas (6 seções) |
| `Pombo Mobile.html` | Protótipo mobile navegável (iPhone) |
| `design-canvas.jsx` | Starter do canvas (pan/zoom, artboards, focus mode) |
| `win11-frame.jsx` | Chrome da janela Windows 11 |
| `ios-frame.jsx` | Bezel iOS (status bar, dynamic island, home indicator) |
| `pombo-app.jsx` | **Tokens (`PomboTokens` light/dark)**, `Avatar`, `DeviceGlyph`, `FileIcon`, `Sidebar`, `CanvasHeader` |
| `pombo-canvas.jsx` | `PEERS`, `PeerCard`, `YouPin`, `CanvasScreen` |
| `pombo-send.jsx` | `SendScreenPicker`, `SendScreenTransfer`, `TransferRing`, `SAMPLE_FILES` |
| `pombo-states.jsx` | `EmptyState`, `SettingsScreen`, `ConnectionRequestDialog` |
| `pombo-variations.jsx` | Variações: grade, lista, radar, voo do pombo, progresso segmentado, toast |
| `pombo-mobile-ui.jsx` | Primitivos mobile (`PM*`): logo, app bar, tab bar, radar, peer row, card, file row, toggle |
| `pombo-mobile-screens.jsx` | Telas mobile + controlador de navegação |

Os protótipos são React 18 + Babel standalone via CDN; abra os `.html` no navegador.

## Tokens visuais (resumo)

- **Paleta:** cream (`#FBF6EF`) / paper (`#FFFDF8`) / ink (`#2A241E`); accent **coral `#E86A4E`**;
  status mint/sun/sky/lilac. Variantes light e dark em `pombo-app.jsx`.
- **Tipografia:** UI **Nunito**; mono (IPs, tamanhos, IDs) **Geist Mono**.
- **Forma:** cantos 16–18px em cartões; avatares "squircle"; sombras suaves duplas;
  selecionado = borda coral 1.5px + glow.

## Divergência com a implementação atual (`src/`)

O frontend atual usa **outra direção visual** — não confundir:

| | Atual (`src/styles.css`) | Pombo (este bundle) |
|---|---|---|
| Paleta | teal/verde (`--lagoon`, `--palm`, `--sea-ink`) | cream + coral |
| Fontes | Fraunces + Manrope | Nunito + Geist Mono |
| Tokens | shadcn (oklch) | `PomboTokens` (hex) |

Ao migrar a UI para esta direção, a tarefa inclui reconciliar os tokens em
`src/styles.css` e os componentes em `src/components/`.
