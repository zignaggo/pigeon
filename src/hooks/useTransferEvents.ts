import { useEffect } from 'react'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { formatBytes } from '../lib/format'
import type {
  ErrorPayload,
  Progress,
  ReceiveDonePayload,
  ReceiveStartedPayload,
  SendDonePayload,
  SendProgressPayload,
} from '../lib/types'

type Handlers = {
  log: (text: string) => void
  onProgress: (progress: Progress) => void
  onReceived: (path: string) => void
}

export function useTransferEvents({ log, onProgress, onReceived }: Handlers) {
  useEffect(() => {
    let unlisteners: UnlistenFn[] = []
    let cancelled = false

    const subscribe = async () => {
      const subs = await Promise.all([
        listen<ReceiveStartedPayload>('receive-started', (e) => {
          log(`📥 recebendo "${e.payload.name}" (${formatBytes(e.payload.size)}) de ${e.payload.from}`)
        }),
        listen<ReceiveDonePayload>('receive-done', (e) => {
          onReceived(e.payload.path)
        }),
        listen<SendProgressPayload>('send-progress', (e) => {
          onProgress({ sent: e.payload.bytes_sent, total: e.payload.total })
        }),
        listen<SendDonePayload>('send-done', (e) => {
          log(`📤 "${e.payload.name}" enviado para ${e.payload.target}`)
        }),
        listen<ErrorPayload>('error', (e) => {
          log(`⚠️ ${e.payload.message}`)
        }),
      ])
      if (cancelled) subs.forEach((fn) => fn())
      else unlisteners = subs
    }

    subscribe()
    return () => {
      cancelled = true
      unlisteners.forEach((fn) => fn())
    }
  }, [log, onProgress, onReceived])
}
