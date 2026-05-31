# 🕊️ Pigeon

Transferência de arquivos na **rede local**, sem internet e sem servidor central. O mesmo código roda no **Windows 11** e no **Android** via **Tauri 2** — os dispositivos se descobrem na LAN e trocam arquivos diretamente.

## Funcionalidades (primeira versão)

- **Descoberta automática** de dispositivos na rede (UDP multicast).
- **Transferência direta** de arquivos para os dispositivos descobertos (TCP). Nesta versão o canal é em **texto puro**, sem criptografia.
- **Integridade da entrega**: o arquivo chega completo, com os bytes na ordem correta (header com tamanho prefixado + leitura exata) e a extensão correta (detecção por *magic bytes*).

Fora do escopo desta versão: criptografia, resume, múltiplos arquivos por transferência, aprovação de conexão. Veja [`CLAUDE.md`](CLAUDE.md) para o escopo completo.

## Stack

- **Tauri 2** — backend em Rust (Tokio).
- **Frontend** — React + TypeScript, [TanStack Router](https://tanstack.com/router) (file-based routing, SPA), Tailwind CSS v4.
- **Targets** — `x86_64-pc-windows-msvc` e `aarch64-linux-android`.
- **Lint/format** — oxlint + oxfmt (configs em `oxlint.config.ts` / `oxfmt.config.ts`).

## Pré-requisitos

- [Bun](https://bun.sh)
- Toolchain Rust + [pré-requisitos do Tauri 2](https://tauri.app/start/prerequisites/)
- Para Android: Android SDK + NDK configurados

## Desenvolvimento

```bash
bun install

bun run dev          # só o frontend no navegador (Vite, porta 3000)
bun run dev:desktop  # app desktop (Tauri) — Windows
bun run dev:android  # app no emulador/device Android
```

`dev:expose` sobe o Vite acessível na rede (`--host`), útil para o Tauri mobile.

## Build

```bash
bun run build:desktop   # binário Windows
bun run build:android   # APK/AAB Android
bun run build           # só os assets do frontend
```

## Testes e qualidade

```bash
bun run test     # Vitest
bun run doctor   # react-doctor (lint/a11y/bundle/arquitetura)
```

## Como funciona

**Descoberta** — cada dispositivo anuncia presença periodicamente via UDP multicast (grupo `239.255.42.99`, porta `7879`) e escuta os anúncios dos outros, montando uma lista viva de peers. Plano detalhado em [`docs/discovery-multicast.md`](docs/discovery-multicast.md).

**Transferência** — conexão TCP direta na porta fixa `7878`:

```
[4 bytes: tamanho do header em u32 big-endian]
[N bytes: header JSON { "name": "arquivo.pdf", "size": 12345 }]
[size bytes: conteúdo do arquivo]
```

## Estrutura

```
src/            # frontend (rotas em src/routes/, componentes, hooks, lib)
src-tauri/      # backend Rust (server.rs, client.rs, discovery.rs)
docs/           # design system + plano de descoberta
```

## Documentação

- [`CLAUDE.md`](CLAUDE.md) — contexto do produto, stack, protocolo e cuidados de Android.
- [`docs/discovery-multicast.md`](docs/discovery-multicast.md) — plano da descoberta via multicast.
- [`docs/design/`](docs/design/README.md) — bundle de design (referência visual).
