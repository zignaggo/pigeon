# POC Pombo — Contexto para retomada

## Objetivo único da POC

**Validar que é possível usar Tauri 2 para construir um app de transferência de arquivos na rede local que rode no Windows 11 e no Android com o mesmo código.**

A POC é descartável. Não estamos construindo o produto. Estamos respondendo uma pergunta binária: **dá ou não dá**.

---

## O que está fora do escopo da POC

Estas coisas vão existir no produto real, mas **não na POC**:

- Criptografia (canal é em texto puro)
- Descoberta automática de peers (mDNS, broadcast)
- Múltiplos arquivos por transferência
- Resume de transferência
- Verificação de integridade (hash)
- UI polida (design system do Pombo entra só no produto)
- Modal de aprovação de conexão
- Histórico, favoritos, ajustes
- Instalador, assinatura digital
- Testes automatizados

Se algo não responde à pergunta "dá pra fazer desktop + Android no Tauri?", está fora.

---

## Cenário mínimo a validar

Dois dispositivos na mesma rede Wi-Fi. Pelo menos um é Android, pelo menos um é Windows 11.

1. App abre nos dois
2. Usuário no dispositivo A vê o próprio IP local mostrado na tela
3. Usuário no dispositivo B digita esse IP num campo
4. B seleciona 1 arquivo
5. B clica "Enviar"
6. A recebe o arquivo e salva em pasta padrão
7. UI nos dois lados mostra "ok"

Pronto. Se isso funciona Windows→Android, Android→Windows e Android→Android, **a viabilidade está provada**.

---

## Stack confirmada

- **Tauri 2** (versão estável mais recente)
- **Frontend:** React + TypeScript (ou framework de preferência — irrelevante pra POC)
- **Backend:** Rust
- **Build targets:** `x86_64-pc-windows-msvc` e `aarch64-linux-android`

### Bibliotecas Rust

| Necessidade | Crate | Por quê |
|---|---|---|
| TCP async | `tokio` (features: `rt-multi-thread`, `net`, `io-util`, `fs`) | Padrão de fato, funciona idêntico nos dois alvos |
| Framing de mensagens | `tokio-util` (feature: `codec`) | `LengthDelimitedCodec` resolve length-prefix |
| Descobrir IP local | `local-ip-address` | Funciona em Win e Android sem código condicional |
| Serialização de header | `serde` + `serde_json` | Header tipo `{name, size}` em JSON antes do payload |

Sem mais nada. Se a POC precisar de mais uma crate, é sinal de que está fugindo do escopo.

---

## Protocolo de fio (wire) mínimo

Não é "protocolo" — é o mínimo pra mover bytes.

```
[4 bytes: tamanho do header em u32 big-endian]
[N bytes: header JSON { "name": "arquivo.pdf", "size": 12345 }]
[size bytes: conteúdo do arquivo]
```

Servidor escuta em **porta fixa 7878** (TCP). Sem handshake. Sem ack. Sem nada além disso.

---

## Estrutura sugerida do projeto

```
pombo-poc/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # Setup Tauri + comandos
│   │   ├── server.rs            # tokio TCP listener na 7878
│   │   └── client.rs            # tokio TCP client conecta e envia
│   ├── Cargo.toml
│   └── tauri.conf.json          # mobile target habilitado
├── src/
│   ├── App.tsx                  # UI mínima (3 telas em uma só)
│   └── main.tsx
└── package.json
```

---

## Comandos Tauri (`#[tauri::command]`)

Apenas 4. Tudo o que a UI precisa:

| Comando | Retorno | O que faz |
|---|---|---|
| `get_local_ip()` | `String` | Retorna IP da interface Wi-Fi ativa |
| `start_server(save_dir: String)` | `Result<(), String>` | Sobe TCP listener na 7878 |
| `send_file(target_ip: String, file_path: String)` | `Result<(), String>` | Conecta e envia o arquivo |
| `pick_file()` | `Option<String>` | Abre file picker nativo, retorna path |

Eventos emitidos pro frontend (via `app_handle.emit`):

- `receive-started` — payload `{ name, size }`
- `receive-done` — payload `{ path }`
- `send-progress` — payload `{ bytes_sent, total }` (opcional, pode pular se complicar)
- `error` — payload `{ message }`

---

## UI mínima (uma única tela)

Layout vertical simples, sem design system:

1. Texto: "Meu IP: `192.168.1.12`" (do `get_local_ip`)
2. Botão "Iniciar servidor" → chama `start_server`
3. Separador
4. Input: "IP do destinatário"
5. Botão "Selecionar arquivo" → chama `pick_file`, mostra nome do arquivo
6. Botão "Enviar" → chama `send_file`
7. Área de status: últimas 5 mensagens de evento

CSS: o mínimo pra não ficar ilegível. **Não copie o design system do Pombo na POC** — é distração.

---

## Cuidados específicos pra Android (críticos)

Essas são as armadilhas reais. Sem isso, a POC não funciona no Android e você vai perder tempo debugando.

### 1. Permissões no `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Não precisa de `CHANGE_WIFI_MULTICAST_STATE` porque não estamos usando mDNS.

### 2. Cleartext traffic

Android 9+ bloqueia HTTP/TCP sem TLS por padrão. Adicione ao `AndroidManifest.xml`:

```xml
<application android:usesCleartextTraffic="true" ...>
```

Sem isso, suas conexões TCP falham silenciosamente.

### 3. Seleção de arquivo

`tauri-plugin-dialog` cobre desktop. No Android, file picker usa Storage Access Framework — o plugin do Tauri 2 já abstrai isso, mas teste cedo. Se der problema, **hardcode um path pra POC** (`/sdcard/Download/teste.pdf`) e siga a vida.

### 4. Pasta de destino no Android

`/storage/emulated/0/Download/` é o caminho mais confiável pra escrever. Evite `getExternalFilesDir` na POC porque some quando o app é desinstalado — você quer ver o arquivo persistir no celular.

### 5. Firewall do Windows

Na primeira execução no Windows, o firewall vai pedir permissão pra porta 7878. Aceite "Redes privadas". Se der problema, rode `netsh advfirewall firewall add rule name="Pombo POC" dir=in action=allow protocol=TCP localport=7878` como admin.

### 6. Mesma sub-rede

Garanta que celular e PC estão no **mesmo SSID** e na **mesma sub-rede**. Wi-Fi de visitante tipicamente isola clientes (AP isolation) e a POC vai parecer quebrada quando o problema é de rede. Teste numa rede doméstica primeiro.

---

## Critérios de "POC bem-sucedida"

Marque como sucesso quando:

- [ ] App builda pra Windows (`cargo tauri build`)
- [ ] App builda pra Android (`cargo tauri android build`)
- [ ] App roda em emulador Android e em device físico Android
- [ ] Transferência Windows → Android funciona com arquivo de pelo menos 10 MB
- [ ] Transferência Android → Windows funciona com arquivo de pelo menos 10 MB
- [ ] Transferência Android → Android funciona

Falhou em algum? Documente **por quê** — esse é o resultado da POC, mesmo que negativo.

---

## Timebox

**5 dias úteis.** Se em 5 dias não está rodando ponta a ponta, pare e reavalie a abordagem (talvez Tauri Mobile não esteja maduro o suficiente, talvez precise voltar pra Electron desktop + nativo Android, etc).

---

## Como retomar em outro chat

Cole este documento inteiro no início da conversa e diga uma de duas coisas:

- **"Me ajuda a implementar essa POC do zero, começando pelo `src-tauri/src/server.rs`"** — pra ir construindo
- **"Travei em [problema específico]. Aqui está o código atual: [cola código]"** — pra debugar

Evite perguntas amplas tipo "como faço transferência de arquivos?". O documento já delimita escopo — perguntas específicas dão respostas melhores.
