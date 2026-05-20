import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import {
  readFile,
  writeFile,
  mkdir,
  BaseDirectory,
} from '@tauri-apps/plugin-fs'
import { appCacheDir, join } from '@tauri-apps/api/path'

export default function Home() {
  return <App />
}

type LogEntry = { id: number; ts: string; text: string }

function deriveNameFromUri(uri: string): string {
  try {
    const decoded = decodeURIComponent(uri)
    const lastSlash = decoded.lastIndexOf('/')
    const tail = lastSlash >= 0 ? decoded.slice(lastSlash + 1) : decoded
    const cleaned = tail
      .split('?')[0]
      .split('#')[0]
      .replace(/[^a-zA-Z0-9._\- ()]/g, '_')
      .trim()
    if (!cleaned) return `shared-${Date.now()}.bin`
    return cleaned.includes('.') ? cleaned : `${cleaned}.bin`
  } catch {
    return `shared-${Date.now()}.bin`
  }
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n)) return `${n}`
  const units = ['B', 'KB', 'MB', 'GB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function App() {
  const [localIp, setLocalIp] = useState<string>('—')
  const [saveDir, setSaveDir] = useState<string>('')
  const [serverRunning, setServerRunning] = useState(false)
  const [targetIp, setTargetIp] = useState('')
  const [filePath, setFilePath] = useState('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logId = useRef(0)

  const log = (text: string) => {
    const id = ++logId.current
    const ts = new Date().toLocaleTimeString()
    setLogs((prev) => [{ id, ts, text }, ...prev].slice(0, 20))
  }

  useEffect(() => {
    let unlisteners: UnlistenFn[] = []
    let cancelled = false

    const bootstrap = async () => {
      try {
        const ip = await invoke<string>('get_local_ip')
        if (!cancelled) setLocalIp(ip)
      } catch (e) {
        log(`erro ao obter IP: ${String(e)}`)
      }
      try {
        const dir = await invoke<string>('default_save_dir')
        if (!cancelled) setSaveDir(dir)
      } catch (e) {
        log(`erro ao obter pasta padrão: ${String(e)}`)
      }

      const subs = await Promise.all([
        listen<{ name: string; size: number; from: string }>('receive-started', (e) => {
          log(`📥 recebendo "${e.payload.name}" (${formatBytes(e.payload.size)}) de ${e.payload.from}`)
        }),
        listen<{ path: string }>('receive-done', (e) => {
          log(`✅ recebido em ${e.payload.path}`)
        }),
        listen<{ bytes_sent: number; total: number }>('send-progress', (e) => {
          setProgress({ sent: e.payload.bytes_sent, total: e.payload.total })
        }),
        listen<{ name: string; target: string }>('send-done', (e) => {
          log(`📤 "${e.payload.name}" enviado para ${e.payload.target}`)
        }),
        listen<{ message: string }>('error', (e) => {
          log(`⚠️ ${e.payload.message}`)
        }),
      ])
      unlisteners = subs
    }

    bootstrap()
    return () => {
      cancelled = true
      unlisteners.forEach((fn) => fn())
    }
  }, [])

  const handleStartServer = async () => {
    try {
      await invoke('start_server', { saveDir })
      setServerRunning(true)
      log(`🟢 servidor escutando na porta 7878 (salvando em ${saveDir})`)
    } catch (e) {
      log(`erro ao iniciar servidor: ${String(e)}`)
    }
  }

  const handlePickFile = async () => {
    try {
      const selected = await openDialog({ multiple: false, directory: false })
      if (typeof selected === 'string') {
        setFilePath(selected)
      } else if (selected && typeof selected === 'object' && 'path' in selected) {
        setFilePath((selected as { path: string }).path)
      }
    } catch (e) {
      log(`erro ao selecionar arquivo: ${String(e)}`)
    }
  }

  const handleSend = async () => {
    if (!targetIp.trim() || !filePath.trim()) {
      log('preencha IP e arquivo antes de enviar')
      return
    }
    setSending(true)
    setProgress(null)
    try {
      let pathToSend = filePath
      if (filePath.startsWith('content://') || filePath.startsWith('file://')) {
        log('📖 lendo URI...')
        const bytes = await readFile(filePath)
        const name = deriveNameFromUri(filePath)
        log(`📦 ${formatBytes(bytes.byteLength)} → cache (${name})`)
        try {
          await mkdir('', { baseDir: BaseDirectory.AppCache, recursive: true })
        } catch {}
        await writeFile(name, bytes, { baseDir: BaseDirectory.AppCache })
        const cacheDir = await appCacheDir()
        pathToSend = await join(cacheDir, name)
      }
      await invoke('send_file', { targetIp: targetIp.trim(), filePath: pathToSend })
    } catch (e) {
      log(`erro ao enviar: ${String(e)}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pombo POC</h1>
        <p style={styles.subtitle}>Transferência local (TCP 7878)</p>

        <section style={styles.section}>
          <div style={styles.kv}>
            <span style={styles.k}>Meu IP</span>
            <code style={styles.v}>{localIp}</code>
          </div>
          <div style={styles.kv}>
            <span style={styles.k}>Pasta destino</span>
            <input
              style={styles.input}
              value={saveDir}
              onChange={(e) => setSaveDir(e.target.value)}
              disabled={serverRunning}
              spellCheck={false}
            />
          </div>
          <button
            style={{ ...styles.btn, ...(serverRunning ? styles.btnDisabled : styles.btnPrimary) }}
            onClick={handleStartServer}
            disabled={serverRunning}
          >
            {serverRunning ? 'Servidor rodando' : 'Iniciar servidor'}
          </button>
        </section>

        <hr style={styles.hr} />

        <section style={styles.section}>
          <label style={styles.label}>IP do destinatário</label>
          <input
            style={styles.input}
            placeholder="192.168.1.x"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            inputMode="decimal"
            spellCheck={false}
          />

          <label style={styles.label}>Arquivo</label>
          <div style={styles.row}>
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="/caminho/do/arquivo"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              spellCheck={false}
            />
            <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={handlePickFile}>
              Escolher…
            </button>
          </div>

          <button
            style={{ ...styles.btn, ...(sending ? styles.btnDisabled : styles.btnPrimary) }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>

          {progress && (
            <div style={styles.progress}>
              <div
                style={{
                  ...styles.progressFill,
                  width: progress.total
                    ? `${Math.min(100, Math.round((progress.sent / progress.total) * 100))}%`
                    : '0%',
                }}
              />
              <span style={styles.progressLabel}>
                {formatBytes(progress.sent)} / {formatBytes(progress.total)}
              </span>
            </div>
          )}
        </section>

        <hr style={styles.hr} />

        <section>
          <p style={styles.label}>Status</p>
          <div style={styles.logBox}>
            {logs.length === 0 ? (
              <p style={styles.logEmpty}>nenhum evento ainda</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} style={styles.logLine}>
                  <span style={styles.logTs}>{l.ts}</span>
                  <span>{l.text}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '16px',
    background: '#0e1116',
    color: '#e6edf3',
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif",
  },
  card: {
    maxWidth: 560,
    margin: '0 auto',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    padding: 20,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 600 },
  subtitle: { marginTop: 4, marginBottom: 16, color: '#8b949e', fontSize: 13 },
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  kv: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  k: { color: '#8b949e', fontSize: 13 },
  v: { fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#79c0ff' },
  label: { color: '#8b949e', fontSize: 12, marginTop: 4, marginBottom: 4 },
  input: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 8,
    color: '#e6edf3',
    padding: '8px 10px',
    fontSize: 14,
    fontFamily: 'ui-monospace, monospace',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: 8, alignItems: 'center' },
  btn: {
    appearance: 'none',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnPrimary: { background: '#238636', color: 'white', borderColor: '#2ea043' },
  btnGhost: { background: 'transparent', color: '#e6edf3' },
  btnDisabled: { background: '#30363d', color: '#8b949e', cursor: 'not-allowed' },
  hr: { border: 'none', borderTop: '1px solid #21262d', margin: '16px 0' },
  progress: {
    position: 'relative',
    height: 22,
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    inset: 0,
    right: 'auto',
    background: '#1f6feb',
    transition: 'width 80ms linear',
  },
  progressLabel: {
    position: 'relative',
    display: 'block',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: '22px',
    color: '#e6edf3',
  },
  logBox: {
    maxHeight: 200,
    overflowY: 'auto',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    fontFamily: 'ui-monospace, monospace',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  logEmpty: { color: '#6e7681', margin: 0 },
  logLine: { display: 'flex', gap: 8 },
  logTs: { color: '#6e7681' },
} satisfies Record<string, React.CSSProperties>
