# Pigeon — Contexto do produto

> **Direção de design:** o bundle de design (desktop Win11 + mobile iPhone,
> paleta cream+coral, tokens `PomboTokens`) está em [`docs/design/`](docs/design/README.md).
> É a referência visual do produto.

## Estilo de código

- **Não inclua comentários no código gerado.** Escreva código autoexplicativo (nomes claros), sem comentários explicativos, de cabeçalho ou inline. Exceção: só mantenha um comentário se for estritamente necessário para o funcionamento (ex.: diretivas exigidas por ferramentas, como `eslint-disable` ou `@ts-expect-error`).
- **Nomes de arquivos do front sempre em kebab-case:** tudo minúsculo, separado por `-` (ex.: `use-algo.ts`, `request-sheet.tsx`, `send-screen.tsx`). Sem PascalCase nem camelCase no nome do arquivo, mesmo quando o componente exportado é PascalCase.
- **Busca de dados assíncronos via TanStack Query (`useQuery`/`useMutation`), não `useState` + `useEffect` manual.** Encapsule cada fonte num hook (ex.: `use-local-ip.ts`, `use-history.ts`) com `queryKey` própria — assim o cache/dedup é compartilhado entre componentes.

## O que é o Pigeon

App de transferência de arquivos na **rede local**, com o **mesmo código** rodando no Windows 11 e no Android via **Tauri 2**. Sem internet, sem servidor central: os dispositivos se acham e trocam arquivos diretamente na LAN.

## Objetivos da primeira versão

> **Foco de implementação: mobile (Android) primeiro, desktop (Windows) em seguida.** Cada feature é construída e validada no Android antes de fechar no desktop.

Esta versão precisa entregar, ponta a ponta:

1. **Descobrir dispositivos na rede** — descoberta automática de peers via UDP multicast. Plano detalhado em [`docs/discovery-multicast.md`](docs/discovery-multicast.md).
2. **Transferir arquivos para os dispositivos descobertos** — envio direto via TCP, **inicialmente sem criptografia** (canal em texto puro).
3. **Garantir integridade da entrega** — o arquivo chega completo, com os **bytes na ordem correta** e a **extensão correta**. Como é garantido:
   - **Ordem e completude:** header com tamanho prefixado (u32 big-endian) + leitura via `read_exact` e laço que só encerra quando os `size` bytes do payload foram escritos. O TCP garante a ordem dos bytes; o laço garante que nada falta.
   - **Extensão:** ao terminar de receber, o backend faz *sniffing* dos magic bytes do arquivo (`detect_extension`) e renomeia para a extensão correta quando necessário (`adjust_extension`).

## Fora do escopo desta versão

Vão existir no futuro, mas **não** nesta primeira versão:

- Criptografia do canal (ponta a ponta / AES) — entra depois; por ora o canal é texto puro
- Resume de transferência interrompida
- Múltiplos arquivos por transferência
- Verificação de integridade por hash explícito (além do framing + sniffing acima)
- Modal de aprovação de conexão / dispositivos confiáveis
- Histórico persistente, favoritos
- Instalador, assinatura digital

## Stack

- **Tauri 2** (versão estável mais recente)
- **Frontend:** React + TypeScript, **TanStack Router** (file-based routing em `src/routes/`), Tailwind v4
- **Backend:** Rust (Tokio)
- **Build targets:** `aarch64-linux-android` (alvo principal) e `x86_64-pc-windows-msvc`

### Bibliotecas Rust

| Necessidade | Crate | Por quê |
|---|---|---|
| TCP/UDP async | `tokio` (`rt-multi-thread`, `net`, `io-util`, `fs`, `sync`, `time`) | Padrão de fato, idêntico nos dois alvos |
| Framing de mensagens | `tokio-util` (`codec`) | `LengthDelimitedCodec` resolve length-prefix |
| IP local | `local-ip-address` | Funciona em Win e Android sem código condicional |
| Serialização | `serde` + `serde_json` | Header e payload de descoberta em JSON |
| Socket multicast | `socket2` | `reuse_address`, `join_multicast_v4`, TTL |
| MAC (informativo) | `mac_address` | MAC real no desktop |

## Protocolo de fio (transferência)

```
[4 bytes: tamanho do header em u32 big-endian]
[N bytes: header JSON { "name": "arquivo.pdf", "size": 12345 }]
[size bytes: conteúdo do arquivo]
```

Servidor escuta em **porta fixa 7878** (TCP). A descoberta usa um canal separado (UDP multicast, porta 7879) — ver [`docs/discovery-multicast.md`](docs/discovery-multicast.md).

## Estrutura do projeto

```
pigeon-app/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # entrypoint -> app_lib::run()
│   │   ├── lib.rs          # setup Tauri + comandos
│   │   ├── server.rs       # TCP listener 7878 + escrita + sniffing de extensão
│   │   ├── client.rs       # TCP client (send_file / send_data)
│   │   └── discovery.rs    # (planejado) UDP multicast: broadcaster + listener
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── routes/             # TanStack Router (file-based)
│   │   ├── __root.tsx
│   │   ├── index.tsx       # redirect -> /rede
│   │   ├── onboarding.tsx  # tela de apelido (gate)
│   │   ├── _frame.tsx      # moldura + tab bar + gate de nick
│   │   ├── _frame.rede.tsx
│   │   ├── _frame.historico.tsx
│   │   ├── _frame.ajustes.tsx
│   │   ├── _frame.send.$peerId.tsx
│   │   └── _frame.transfer.$peerId.tsx
│   ├── components/         # ui/, pigeon/ (primitivas), telas auxiliares
│   ├── context/ · hooks/ · lib/
│   └── main.tsx
└── docs/
    ├── design/             # bundle de design (referência visual)
    └── discovery-multicast.md
```

## Comandos Tauri (`#[tauri::command]`)

Atuais: `get_local_ip`, `start_server(save_dir)`, `stop_server`, `send_file(target_ip, file_path)`, `send_data(target_ip, name, data)`, `default_save_dir`, e no Android `saf_pick_dir` / `saf_import_file`.

Planejados (descoberta): `start_discovery(nick, device_id)`, `stop_discovery`, `set_nick(nick)`.

## Eventos emitidos pro frontend (`app.emit`)

- `receive-started` — `{ name, size, from }`
- `receive-done` — `{ path }`
- `error` — `{ message }`
- `peers` — `{ peers: [...] }` (snapshot da descoberta; planejado)

## Cuidados específicos pra Android (críticos)

### 1. Permissões no `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE" />
```

`CHANGE_WIFI_MULTICAST_STATE` é necessária agora porque usamos UDP multicast (junto com o `MulticastLock` — ver o doc da descoberta).

### 2. Cleartext traffic

Android 9+ bloqueia TCP/UDP sem TLS por padrão. O `AndroidManifest.xml` precisa de:

```xml
<application android:usesCleartextTraffic="true" ...>
```

Sem isso, as conexões falham silenciosamente.

### 3. MulticastLock

Sem o `MulticastLock`, o power-saving do Wi-Fi descarta pacotes multicast. Adquirir no `start_discovery` e liberar no `stop_discovery` (via `jni` + `ndk-context`). É o ponto de maior risco da descoberta no Android — validar cedo em device físico.

### 4. Pasta de destino no Android

Os arquivos chegam primeiro no cache do app (gravável via `tokio::fs`) e depois são movidos para a árvore SAF escolhida pelo usuário via `saf_import_file`.

### 5. Firewall do Windows

Na primeira execução o firewall pede permissão para a porta 7878. Aceite "Redes privadas". **A descoberta precisa também do UDP 7879 de entrada** — o firewall costuma bloqueá-lo silenciosamente (o dispositivo recebe os próprios pacotes via loopback, mas não os dos outros). Libere as duas portas, como admin:

```
netsh advfirewall firewall add rule name="Pigeon TCP" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="Pigeon UDP" dir=in action=allow protocol=UDP localport=7879
```

### 6. Mesma sub-rede

PC e celular precisam estar no **mesmo SSID** e **mesma sub-rede**. Wi-Fi de visitante normalmente isola clientes (AP isolation) e o app vai parecer quebrado quando o problema é de rede. Teste numa rede doméstica primeiro.
