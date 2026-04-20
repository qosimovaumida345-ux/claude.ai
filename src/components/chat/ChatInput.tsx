'use client'

import { useState, useRef, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Send, Paperclip, X, FileText, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatFileSize } from '@/lib/utils'
import ModelSelector from './ModelSelector'
import type { UploadedFile } from '@/types'

interface Props {
  onSend: (content: string, files?: UploadedFile[]) => void
  onStop?: () => void
  isStreaming: boolean
  model: string
  onModelChange: (id: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, onStop, isStreaming, model, onModelChange, disabled }: Props) {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed && files.length === 0) return
    onSend(trimmed, files.length > 0 ? files : undefined)
    setValue('')
    setFiles([])
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
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
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
          placeholder="Message Claude Fan-Made..."
          minRows={1}
          maxRows={8}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            className="shrink-0 p-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors"
            title="Stop generating"
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
        <p className="text-[11px] text-gray-300">Shift+Enter for new line</p>
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
