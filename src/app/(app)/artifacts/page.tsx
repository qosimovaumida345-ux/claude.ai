'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Layers, MessageSquare, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate, truncate } from '@/lib/utils'
import type { ChatSession } from '@/types'

export default function ArtifactsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => { setSessions(data); setLoading(false) })
  }, [])

  const total = sessions.length
  const totalMessages = sessions.reduce((acc, s) => acc + (s.messages?.length ?? 0), 0)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#e0fafb] flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#00919b]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Artifacts</h1>
            <p className="text-xs text-gray-400">Your conversation history</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Chats', value: total, icon: MessageSquare },
            { label: 'Total Messages', value: totalMessages, icon: Layers },
            { label: 'This Week', value: sessions.filter(s => {
              const d = new Date(s.created_at)
              return Date.now() - d.getTime() < 604800000
            }).length, icon: Calendar }
          ].map(stat => (
            <div key={stat.label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-[#00CDD9]" />
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#00CDD9] rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No conversations yet</p>
            <button
              onClick={() => router.push('/chat')}
              className="btn-primary mt-4"
            >
              Start chatting
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, i) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/chat/${session.id}`)}
                className="w-full text-left card p-4 hover:border-[#00CDD9]/40 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#00CDD9] transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#00919b] transition-colors">
                        {truncate(session.title, 60)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">{formatDate(session.updated_at)}</span>
                        <span className="text-gray-200">•</span>
                        <span className="text-[11px] text-gray-400">{session.model}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-300 shrink-0 mt-0.5">
                    {session.messages?.length ?? 0} msgs
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
