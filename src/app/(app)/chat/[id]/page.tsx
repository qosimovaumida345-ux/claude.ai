'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { DEFAULT_MODEL } from '@/lib/models'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import FileTreeViewer from '@/components/chat/FileTreeViewer'
import type { Message, UploadedFile } from '@/types'

export default function ChatSessionPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [model, setModel] = useState(searchParams.get('model') ?? DEFAULT_MODEL)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    loadMessages()
  }, [id])

  useEffect(() => {
    const initMsg = searchParams.get('init')
    if (initMsg && !initialized.current && messages.length > 0) {
      initialized.current = true
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === 'user') {
        sendToAI(messages, initMsg)
      }
    }
  }, [messages, searchParams])

  const loadMessages = async () => {
    const res = await fetch(`/api/messages?sessionId=${id}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
  }

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
  }

  const buildUserContent = (text: string, files?: UploadedFile[]) => {
    if (!files || files.length === 0) return text
    const fileContext = files.map(f => {
      if (f.extractedFiles && f.extractedFiles.length > 0) {
        const listing = f.extractedFiles
          .slice(0, 30)
          .map(ef => `  ${ef.path}`)
          .join('\n')
        const samples = f.extractedFiles
          .filter(ef => ef.content && ef.content !== '[Binary file - cannot display]')
          .slice(0, 5)
          .map(ef => `\n--- ${ef.path} ---\n${ef.content.slice(0, 1500)}`)
          .join('\n')
        return `[ZIP File: ${f.name}]\nStructure:\n${listing}${samples}`
      }
      return `[File: ${f.name}]\n${f.content?.slice(0, 4000) ?? ''}`
    }).join('\n\n')
    return text ? `${text}\n\n${fileContext}` : fileContext
  }

  const sendToAI = useCallback(async (currentMessages: Message[], latestContent: string) => {
    setStreaming(true)
    setStreamContent('')
    scrollToBottom()

    const apiMessages = currentMessages.map(m => ({
      role: m.role,
      content: m.content
    }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: apiMessages,
          model,
          sessionId: id
        })
      })

      if (!res.ok) {
        const err = await res.text()
        setStreamContent(`Error: ${err}`)
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamContent(fullText)
        scrollToBottom(false)
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        session_id: id,
        role: 'assistant',
        content: fullText,
        model,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
      setStreamContent('')
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setStreamContent('Connection error. Please try again.')
      }
    } finally {
      setStreaming(false)
    }
  }, [id, model])

  const handleSend = async (content: string, files?: UploadedFile[]) => {
    const fullContent = buildUserContent(content, files)
    if (!fullContent.trim()) return

    if (files?.some(f => f.extractedFiles && f.extractedFiles.length > 0)) {
      setActiveFile(files.find(f => f.extractedFiles && f.extractedFiles.length > 0) ?? null)
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      session_id: id,
      role: 'user',
      content: fullContent,
      created_at: new Date().toISOString()
    }

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, role: 'user', content: fullContent })
    })

    if (messages.length === 0) {
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: content.slice(0, 50) || 'New Chat', model })
      })
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    await sendToAI(newMessages, fullContent)
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStreaming(false)
    if (streamContent) {
      const msg: Message = {
        id: crypto.randomUUID(),
        session_id: id,
        role: 'assistant',
        content: streamContent,
        model,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, msg])
      setStreamContent('')
    }
  }

  const streamingMessage: Message = {
    id: 'streaming',
    session_id: id,
    role: 'assistant',
    content: streamContent,
    created_at: new Date().toISOString()
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className={`flex flex-col flex-1 overflow-hidden ${activeFile ? 'w-1/2' : 'w-full'}`}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="max-w-3xl mx-auto py-6">
            {messages.length === 0 && !streaming && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Start a conversation
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {streaming && (
              <ChatMessage
                key="streaming"
                message={streamingMessage}
                isStreaming={true}
              />
            )}

            {streaming && !streamContent && (
              <div className="flex gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#00CDD9]"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-24 right-6 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-10"
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={streaming}
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>

      <AnimatePresence>
        {activeFile && activeFile.extractedFiles && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-gray-200 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-hidden p-3">
              <FileTreeViewer
                files={activeFile.extractedFiles}
                zipName={activeFile.name}
                onClose={() => setActiveFile(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
