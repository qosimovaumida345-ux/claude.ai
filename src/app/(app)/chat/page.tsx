'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Zap, Brain, Code, Lightbulb, FileText, Globe } from 'lucide-react'
import { DEFAULT_MODEL } from '@/lib/models'
import ChatInput from '@/components/chat/ChatInput'
import LogoAnimation from '@/components/ui/LogoAnimation'
import type { UploadedFile } from '@/types'

const STARTERS = [
  { icon: Code, label: 'Write code', prompt: 'Help me write a function that ' },
  { icon: Brain, label: 'Explain concept', prompt: 'Explain in simple terms: ' },
  { icon: Lightbulb, label: 'Brainstorm ideas', prompt: 'Help me brainstorm ideas for ' },
  { icon: FileText, label: 'Summarize text', prompt: 'Summarize the following: ' },
  { icon: Globe, label: 'Translate text', prompt: 'Translate this to English: ' },
  { icon: Zap, label: 'Quick task', prompt: 'Help me quickly ' }
]

export default function ChatHomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [creating, setCreating] = useState(false)

  const name = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const startChat = async (content: string, files?: UploadedFile[]) => {
    if (!content.trim() && (!files || files.length === 0)) return
    setCreating(true)

    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: content.slice(0, 50) || files?.[0]?.name || 'New Chat',
        model
      })
    })

    if (!sessionRes.ok) { setCreating(false); return }
    const chatSession = await sessionRes.json()

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: chatSession.id,
        role: 'user',
        content: buildUserContent(content, files)
      })
    })

    router.push(`/chat/${chatSession.id}?init=${encodeURIComponent(content)}&model=${model}`)
  }

  const buildUserContent = (text: string, files?: UploadedFile[]) => {
    if (!files || files.length === 0) return text
    const fileContext = files.map(f => {
      if (f.extractedFiles && f.extractedFiles.length > 0) {
        const fileList = f.extractedFiles
          .slice(0, 20)
          .map(ef => `- ${ef.path} (${ef.type})`)
          .join('\n')
        return `[ZIP: ${f.name}]\nContents:\n${fileList}`
      }
      return `[File: ${f.name}]\n${f.content?.slice(0, 3000) ?? ''}`
    }).join('\n\n')
    return text ? `${text}\n\n${fileContext}` : fileContext
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoAnimation size={40} />
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {name}
            </h1>
          </div>
          <p className="text-gray-400 text-base">How can I help you today?</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 w-full max-w-2xl"
        >
          {STARTERS.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => startChat(s.prompt)}
              className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-[#e0fafb] border border-gray-200 hover:border-[#00CDD9] rounded-2xl text-sm text-gray-600 hover:text-[#00919b] transition-all duration-200 text-left group"
            >
              <s.icon className="w-4 h-4 shrink-0 group-hover:text-[#00CDD9]" />
              <span className="truncate">{s.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4">
        <ChatInput
          onSend={startChat}
          isStreaming={creating}
          model={model}
          onModelChange={setModel}
          disabled={creating}
        />
      </div>
    </div>
  )
}
