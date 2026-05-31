# Descoberta de dispositivos via UDP multicast

Plano de implementação da descoberta automática de peers na rede local.

> **Foco: mobile (Android) primeiro, desktop depois.** O núcleo (Rust + frontend) é compartilhado entre os alvos; a validação prioriza Android ↔ Android antes do desktop.

## Decisões

- **Identidade:** `device_id` (UUID v4) gerado uma vez no front e persistido no
  `localStorage` (mesmo padrão do nick). É a identidade canônica do peer. O MAC
  vai no payload apenas como informação (real no desktop, vazio/placeholder no
  Android, onde a API retorna MAC falso desde o Android 6+).
- **Transporte:** UDP **multicast** no grupo `239.255.42.99`, porta `7879`
  (separada da porta TCP de transferência, `7878`).

## Visão geral

Dois loops UDP rodando em paralelo no backend Rust: um **anuncia** a presença
periodicamente, outro **escuta** anúncios alheios e mantém uma tabela de peers
com *last-seen*. Mudanças na tabela são emitidas pro front via evento Tauri, que
substitui a lista mockada por uma lista viva.

## Wire format

JSON pequeno (abaixo da MTU), com magic + versão:

```jsonc
{
  "magic": "PGN1",
  "type": "hello",        // "hello" | "bye"
  "id": "uuid-estável",   // identidade canônica
  "nick": "Rafa",
  "ip": "192.168.0.14",   // IP usado pelo outro lado no send_file
  "port": 7878,           // porta TCP de transferência
  "mac": "a4:bb:..",      // informativo (desktop); "" no Android
  "platform": "windows"   // deriva o ícone (kind) do peer
}
```

## Backend Rust

### Dependências (`src-tauri/Cargo.toml`)

- `socket2` — configurar o socket multicast (`reuse_address`, `join_multicast_v4`,
  TTL).
- `mac_address` — MAC no desktop (informativo).
- `[target.'cfg(target_os = "android")'] jni` + `ndk-context` — para o
  MulticastLock.

### Módulo `src-tauri/src/discovery.rs`

- Constantes: `GROUP = 239.255.42.99`, `DISCOVERY_PORT = 7879`,
  `INTERVAL = 3s`, `PEER_TTL = 10s`.
- `DiscoveryState` em `AppState`: `Mutex<HashMap<String, PeerEntry>>` (com
  `last_seen: Instant`), handles das tasks e a identidade própria (`id`, `nick`).
- Socket via `socket2`: bind `0.0.0.0:7879`, `set_reuse_address`,
  `join_multicast_v4` em cada interface não-loopback (enumeradas via
  `local-ip-address`), depois converte para `tokio::net::UdpSocket`.
- Três tasks tokio:
  - **broadcaster** — envia `hello` ao grupo a cada `INTERVAL`.
  - **listener** — `recv_from`, parseia, ignora se `id == self.id` (filtra o
    próprio eco), faz upsert na tabela com `last_seen = now`, emite snapshot.
  - **reaper** — a cada 2s remove peers com `last_seen` acima do `PEER_TTL` e
    emite snapshot.
- `stop` — envia `bye` (best-effort), aborta as tasks, limpa a tabela.

### Comandos (`src-tauri/src/lib.rs`)

- `start_discovery(nick, device_id)`
- `stop_discovery()`
- `set_nick(nick)` — atualiza o que o broadcaster envia.

Registrar no `invoke_handler` e dar `manage(DiscoveryState)` no `setup`.

### Eventos pro front

Modelo **snapshot**: um único evento `peers` com `{ peers: [...] }` a cada
mudança. O front apenas substitui o estado.

> Sockets UDP são nativos no Rust, então não exigem entrada nova em
> `capabilities/default.json`.

## Android

- `AndroidManifest.xml`: adicionar `ACCESS_WIFI_STATE`, `ACCESS_NETWORK_STATE`,
  `CHANGE_WIFI_MULTICAST_STATE`.
- **MulticastLock** (ponto de maior risco): sem ele, o power-saving do Wi-Fi
  descarta pacotes multicast. Adquirir via `jni` + `ndk-context` (pegar o
  `Context`, chamar `WifiManager.createMulticastLock().acquire()`) no
  `start_discovery` sob `#[cfg(target_os = "android")]`; liberar no `stop`.
  Validar cedo em device físico.

## Frontend

- `src/lib/device-id.ts` — `getDeviceId()` com `crypto.randomUUID()` persistido.
- `src/lib/api.ts` — `startDiscovery(nick, deviceId)`, `stopDiscovery()`.
- `src/lib/peers-store.ts` — store externo (module-level, com subscribe)
  alimentado pelo evento `peers`. Necessário porque os loaders das rotas
  `send`/`transfer` rodam fora do React e precisam ler o peer (e o IP) de forma
  síncrona.
- `src/hooks/use-peers.ts` — escuta o evento `peers`, sincroniza o store e
  chama `start`/`stopDiscovery` no mount/unmount.
- **Mapper** `discovered → Peer` (tipo da UI): `name` = nick, `kind` derivado de
  `platform`, `status` = "online" (estar na lista já significa online; o reaper
  remove os offline), `tint` = hash determinístico do `id`, `mono` =
  `initialsOf(nick)`, `distance` = "wi-fi".
- Trocar o `PEERS` mockado em `src/routes/_frame.rede.tsx` pela lista viva.
- Fluxo de envio: `_frame.send.$peerId.tsx` e `_frame.transfer.$peerId.tsx`
  passam a ler do `peers-store` e usar `peer.ip` no `send_file`.
- `src/lib/mock.ts` segue só para `MFILES`/`MHISTORY`.

## Ciclo de vida

Rodar a descoberta enquanto o usuário está visível: iniciar em
`src/routes/_frame.tsx` (depois do gate de nick) no mount, parar no unmount.
Mais tarde, o toggle "Visível na rede" dos Ajustes controla isso.

## Riscos e casos de borda

- MulticastLock no Android — testar em device real, não só no emulador.
- AP isolation (Wi-Fi de visitante) bloqueia peer-to-peer.
- Múltiplas interfaces (VPN, adaptadores virtuais) — join em todas.
- Sem autenticação: qualquer um na LAN pode forjar um nick. Consistente com o
  canal sem criptografia desta versão; aprovação de conexão fica para depois.
- Escopo só IPv4 por enquanto.

## Segunda estratégia: varredura (unicast scan)

Implementação alternativa em `src-tauri/src/scan.rs`, selecionável nos Ajustes
(segmento **Multicast | Varredura** + **Limite de IPs**, default 30). Em vez de
multicast/broadcast, faz **varredura ativa**: deriva o range do /24 a partir do
IP local e envia o mesmo payload via **unicast** para os primeiros N hosts
(`.1..=.N`, N = limite). Ao receber um `hello` de um peer novo, responde direto
(unicast) — assim a descoberta é mútua mesmo com limites assimétricos. Mesmo
wire format, mesma porta (UDP 7879), mesmos eventos (`peers` / `discovery-log`).

Trade-offs: não depende de multicast/MulticastLock (mais robusto em Wi-Fi que
filtra multicast), mas só cobre os N primeiros IPs do /24 e assume máscara /24
(detecção de máscara/gateway via crate fica para depois). Comandos: o
`start_discovery(nick, device_id, mode, threshold)` despacha para `discovery` ou
`scan` conforme o `mode`; `stop_discovery` para os dois.

## Ordem de implementação

Mobile primeiro. O núcleo é compartilhado; a diferença é onde validamos.

1. **Núcleo compartilhado (Rust)**: deps Cargo, `discovery.rs` (socket multicast,
   broadcaster, listener, reaper), comandos em `lib.rs`. Igual nos dois alvos.
2. **Frontend**: `device-id`, `api`, `peers-store`, `use-peers`, mapper,
   trocar o mock no `/rede`, ciclo de vida no `_frame`.
3. **Android (alvo principal)**: manifest (permissões), MulticastLock via
   `jni` + `ndk-context`, join multicast por interface. **Validar Android ↔
   Android primeiro** em device físico.
4. **Desktop em seguida**: validar Windows ↔ Android e Windows ↔ Windows.
