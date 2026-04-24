'use client'

import { useState, useRef, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Send, Paperclip, X, FileText, Square, FolderOpen, HardDrive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatFileSize } from '@/lib/utils'
import ModelSelector from './ModelSelector'
import { isTauri, writeFile, readFile, createDir, listDir, deleteFile } from '@/lib/tauri'
import type { UploadedFile } from '@/types'

interface Props {
  onSend: (content: string, files?: UploadedFile[]) => void
  onStop?: () => void
  isStreaming: boolean
  model: string
  onModelChange: (id: string) => void
  disabled?: boolean
}

// AI javobidan fayl yozish buyrug'ini parse qilish
function parseAIFileCommand(text: string): { path: string; content: string } | null {
  // Format: [WRITE_FILE:D:/path/to/file.txt]
  // Content shundan keyin keladi
  const match = text.match(/\[WRITE_FILE:([^\]]+)\]\s*([\s\S]+)/i)
  if (match) return { path: match[1].trim(), content: match[2].trim() }
  return null
}

export default function ChatInput({ onSend, onStop, isStreaming, model, onModelChange, disabled }: Props) {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [tauriStatus, setTauriStatus] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsDesktop(isTauri())
  }, [])

  // Xabar yuborishdan oldin fayl buyrug'ini tekshirish
  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed && files.length === 0) return

    // Desktop da fayl buyrug'larini handle qilish
    if (isDesktop && trimmed) {
      const handled = await handleTauriCommand(trimmed)
      if (handled) {
        setValue('')
        return
      }
    }

    onSend(trimmed, files.length > 0 ? files : undefined)
    setValue('')
    setFiles([])
  }

  // Tauri fayl buyrug'larini bajarish
  const handleTauriCommand = async (msg: string): Promise<boolean> => {
    const lower = msg.toLowerCase()

    // "D:/test.txt yaratgin yoki yoz" + content
    const writeMatch = msg.match(/^(.+?)\s+(?:fayliga?|ga|ichiga)\s+(.+)$/is)
      || msg.match(/^(.+?)\s+(?:yozgin|yaratingiz?|create|write)\s*[:\-]?\s*(.+)$/is)

    // Oddiyroq: path + "yaratgin"/"yoz"
    const simpleWrite = msg.match(/["'`]([^"'`]+)["'`]\s+(?:fayl\s+)?(?:yaratgin|yozgin|create)/i)
      || msg.match(/([A-Za-z]:[\/\\][^\s]+)\s+(?:fayl\s+)?(?:yaratgin|yozgin|create)/i)

    // O'qish
    const readMatch = msg.match(/["'`]([^"'`]+)["'`]\s+(?:o['`]qi|ko['`]rsat|ochgin|read)/i)
      || msg.match(/([A-Za-z]:[\/\\][^\s]+)\s+(?:o['`]qi|ko['`]rsat|ochgin|read)/i)

    // Papka yaratish
    const dirMatch = msg.match(/["'`]([^"'`]+)["'`]\s+(?:papka|folder)\s+(?:yaratgin|create)/i)
      || msg.match(/([A-Za-z]:[\/\\][^\s]+)\s+(?:papka|folder)\s+(?:yaratgin|create)/i)

    // Papka ro'yxati
    const listMatch = msg.match(/["'`]([^"'`]+)["'`]\s+(?:ro['`]yxat|list|nima bor)/i)
      || msg.match(/([A-Za-z]:[\/\\][^\s]*)\s+(?:da\s+)?(?:nima bor|ro['`]yxat|list)/i)

    // O'chirish
    const deleteMatch = msg.match(/["'`]([^"'`]+)["'`]\s+(?:o['`]chir|delete|remove)/i)
      || msg.match(/([A-Za-z]:[\/\\][^\s]+)\s+(?:o['`]chir|delete|remove)/i)

    if (simpleWrite) {
      const path = simpleWrite[1]
      try {
        setTauriStatus('Yaratilmoqda...')
        const result = await writeFile(path, '// Claude Fan-Made tomonidan yaratildi\n')
        setTauriStatus(result)
        onSend(msg)
        setTimeout(() => setTauriStatus(null), 3000)
        return true
      } catch (e: any) {
        setTauriStatus(`❌ Xato: ${e}`)
        setTimeout(() => setTauriStatus(null), 4000)
        return true
      }
    }

    if (readMatch) {
      const path = readMatch[1]
      try {
        setTauriStatus('O\'qilmoqda...')
        const content = await readFile(path)
        setTauriStatus(null)
        onSend(`${path} fayli:\n\`\`\`\n${content}\n\`\`\``)
        return true
      } catch (e: any) {
        setTauriStatus(`❌ Xato: ${e}`)
        setTimeout(() => setTauriStatus(null), 4000)
        return true
      }
    }

    if (dirMatch) {
      const path = dirMatch[1]
      try {
        setTauriStatus('Papka yaratilmoqda...')
        const result = await createDir(path)
        setTauriStatus(result)
        onSend(msg)
        setTimeout(() => setTauriStatus(null), 3000)
        return true
      } catch (e: any) {
        setTauriStatus(`❌ Xato: ${e}`)
        setTimeout(() => setTauriStatus(null), 4000)
        return true
      }
    }

    if (listMatch) {
      const path = listMatch[1]
      try {
        setTauriStatus('Ro\'yxat olinmoqda...')
        const files = await listDir(path)
        setTauriStatus(null)
        const list = files.map(f => `- ${f}`).join('\n')
        onSend(`${path} ichidagi fayllar:\n${list}`)
        return true
      } catch (e: any) {
        setTauriStatus(`❌ Xato: ${e}`)
        setTimeout(() => setTauriStatus(null), 4000)
        return true
      }
    }

    if (deleteMatch) {
      const path = deleteMatch[1]
      try {
        setTauriStatus('O\'chirilmoqda...')
        const result = await deleteFile(path)
        setTauriStatus(result)
        onSend(msg)
        setTimeout(() => setTauriStatus(null), 3000)
        return true
      } catch (e: any) {
        setTauriStatus(`❌ Xato: ${e}`)
        setTimeout(() => setTauriStatus(null), 4000)
        return true
      }
    }

    return false
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming) handleSend()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return
    setUploading(true)

    for (const file of selected) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          setFiles(prev => [...prev, { id: crypto.randomUUID(), ...data }])
        }
      } catch {}
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  return (
    <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-4">

      {/* Tauri status xabari */}
      <AnimatePresence>
        {tauriStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-2 flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-[#e0fafb] text-[#00919b] border border-[#00CDD9]/20"
          >
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            {tauriStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop badge */}
      {isDesktop && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-[#00919b]">
          <HardDrive className="w-3 h-3" />
          <span>Desktop rejim — disk amallari faol</span>
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2 mb-3 overflow-hidden"
          >
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#00CDD9] shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-700 font-medium truncate max-w-[160px]">{file.name}</p>
                  <p className="text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                {file.extractedFiles && file.extractedFiles.length > 0 && (
                  <span className="text-[10px] bg-[#e0fafb] text-[#00919b] px-1.5 py-0.5 rounded-full">
                    {file.extractedFiles.length} files
                  </span>
                )}
                <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#00CDD9] focus-within:ring-2 focus-within:ring-[#00CDD9]/10 transition-all duration-200">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isStreaming || uploading}
          className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          title="Attach file"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00CDD9] rounded-full animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDesktop
            ? 'Xabar yozing yoki: "D:/test.txt yaratgin"'
            : 'Message Claude Fan-Made...'
          }
          minRows={1}
          maxRows={8}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            className="shrink-0 p-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-gray-600 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={(!value.trim() && files.length === 0) || !!disabled}
            className={cn(
              'shrink-0 p-2 rounded-xl transition-all duration-200',
              value.trim() || files.length > 0
                ? 'bg-[#00CDD9] hover:bg-[#00b8c4] text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2.5 px-1">
        <ModelSelector value={model} onChange={onModelChange} disabled={isStreaming} />
        <p className="text-[11px] text-gray-300">Shift+Enter yangi qator</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".zip,.txt,.md,.json,.csv,.js,.ts,.jsx,.tsx,.py,.html,.css,.sql,.yaml,.yml,.sh,.env"
        multiple
      />
    </div>
  )
}