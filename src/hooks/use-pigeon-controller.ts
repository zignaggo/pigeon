import { useCallback, useEffect, useRef, useState } from 'react'
import {
  readFile,
  writeFile,
  mkdir,
  BaseDirectory,
} from '@tauri-apps/plugin-fs'
import { appCacheDir, join } from '@tauri-apps/api/path'
import * as api from '../lib/api'
import { deriveNameFromUri, fileNameOf, formatBytes } from '../lib/format'
import type { PigeonContextValue, Progress, SafDir } from '../lib/types'
import { useLogs } from './use-logs'
import { useTransferEvents } from './use-transfer-events'

export function usePigeonController(): PigeonContextValue {
  const { logs, log } = useLogs()
  const [localIp, setLocalIp] = useState('—')
  const [saveDir, setSaveDir] = useState('')
  const [serverRunning, setServerRunning] = useState(false)
  const [targetIp, setTargetIp] = useState('')
  const [filePath, setFilePath] = useState('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [safDirName, setSafDirName] = useState<string | null>(null)
  const safDirRef = useRef<SafDir | null>(null)

  const onProgress = useCallback((p: Progress) => setProgress(p), [])

  const onReceived = useCallback(
    async (path: string) => {
      const dir = safDirRef.current
      if (!dir) {
        log(`✅ recebido em ${path}`)
        return
      }
      const name = fileNameOf(path)
      try {
        await api.safImportFile(dir, path, name)
        log(`✅ "${name}" salvo na pasta escolhida`)
      } catch (e) {
        log(`erro ao salvar na pasta escolhida: ${String(e)}`)
      }
    },
    [log],
  )

  useTransferEvents({ log, onProgress, onReceived })

  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      try {
        const ip = await api.getLocalIp()
        if (!cancelled) setLocalIp(ip)
      } catch (e) {
        log(`erro ao obter IP: ${String(e)}`)
      }
      try {
        const dir = await api.getDefaultSaveDir()
        if (!cancelled) setSaveDir(dir)
      } catch (e) {
        log(`erro ao obter pasta padrão: ${String(e)}`)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [log])

  const toggleServer = useCallback(async () => {
    if (serverRunning) {
      try {
        await api.stopServer()
        setServerRunning(false)
        log('🔴 servidor parado')
      } catch (e) {
        log(`erro ao parar servidor: ${String(e)}`)
      }
      return
    }
    try {
      await api.startServer(saveDir)
      setServerRunning(true)
      log(`🟢 servidor escutando na porta 7878 (salvando em ${saveDir})`)
    } catch (e) {
      log(`erro ao iniciar servidor: ${String(e)}`)
    }
  }, [serverRunning, saveDir, log])

  const pickDir = useCallback(async () => {
    try {
      const path = await api.pickDirectory()
      if (path) setSaveDir(path)
    } catch (e) {
      log(`erro ao selecionar pasta: ${String(e)}`)
    }
  }, [log])

  const pickSafDir = useCallback(async () => {
    try {
      const dir = await api.safPickDir()
      if (dir) {
        safDirRef.current = dir
        setSafDirName('Pasta selecionada ✓')
        log('📁 pasta de destino escolhida (SAF)')
      }
    } catch (e) {
      log(`erro ao escolher pasta: ${String(e)}`)
    }
  }, [log])

  const pickFile = useCallback(async () => {
    try {
      const path = await api.pickFile()
      if (path) setFilePath(path)
    } catch (e) {
      log(`erro ao selecionar arquivo: ${String(e)}`)
    }
  }, [log])

  const send = useCallback(async () => {
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
      await api.sendFile(targetIp.trim(), pathToSend)
    } catch (e) {
      log(`erro ao enviar: ${String(e)}`)
    } finally {
      setSending(false)
    }
  }, [targetIp, filePath, log])

  return {
    localIp,
    saveDir,
    setSaveDir,
    serverRunning,
    targetIp,
    setTargetIp,
    filePath,
    setFilePath,
    sending,
    progress,
    logs,
    safDirName,
    toggleServer,
    pickDir,
    pickSafDir,
    pickFile,
    send,
  }
}
