'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Plus, Search, MessageSquare, Settings, ChevronLeft, ChevronRight,
  LogOut, Trash2, MoreHorizontal, Cpu, Layers, User, ChevronDown, Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDate, truncate } from '@/lib/utils'
import type { ChatSession } from '@/types'

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string }
}

export default function Sidebar({ user }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [search, setSearch] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [pathname])

  const fetchSessions = async () => {
    const res = await fetch('/api/sessions')
    if (res.ok) {
      const data = await res.json()
      setSessions(data)
    }
  }

  const createSession = async () => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' })
    })
    if (res.ok) {
      const session = await res.json()
      router.push(`/chat/${session.id}`)
      setSessions(prev => [session, ...prev])
    }
  }

  const deleteSession = async (id: string) => {
    await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
    if (pathname === `/chat/${id}`) router.push('/chat')
    setContextMenu(null)
  }

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, ChatSession[]>>((acc, s) => {
    const label = formatDate(s.updated_at)
    if (!acc[label]) acc[label] = []
    acc[label].push(s)
    return acc
  }, {})

  const currentId = pathname.split('/chat/')[1]

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 60 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-hidden shrink-0"
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" stroke="#00CDD9" strokeWidth="1.5" fill="none"/>
                <path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" fill="#00CDD9" fillOpacity="0.15"/>
                <circle cx="20" cy="20" r="3.5" fill="#00CDD9"/>
              </svg>
              <span className="font-semibold text-gray-900 text-sm">Claude Fan-Made</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-2">
          <button
            onClick={createSession}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#00CDD9] hover:text-[#00919b] transition-all duration-200',
              collapsed && 'justify-center px-2'
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>New chat</span>}
          </button>
        </div>

        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#00CDD9] transition-colors"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
          {!collapsed && (
            <>
              <div className="space-y-0.5 mb-3">
                {[
                  { href: '/chat', icon: MessageSquare, label: 'Chats' },
                  { href: '/artifacts', icon: Layers, label: 'Artifacts' },
                  { href: '/settings', icon: Settings, label: 'Settings' }
                ].map(item => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'sidebar-item w-full',
                      pathname === item.href && 'sidebar-item-active'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Recent
                </p>
                {Object.entries(grouped).map(([label, items]) => (
                  <div key={label} className="mb-3">
                    <p className="text-[11px] text-gray-400 px-3 mb-1">{label}</p>
                    {items.map(session => (
                      <div key={session.id} className="relative group">
                        <button
                          onClick={() => router.push(`/chat/${session.id}`)}
                          onContextMenu={e => {
                            e.preventDefault()
                            setContextMenu({ id: session.id, x: e.clientX, y: e.clientY })
                          }}
                          className={cn(
                            'sidebar-item w-full',
                            currentId === session.id && 'sidebar-item-active'
                          )}
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span className="truncate text-xs">{truncate(session.title, 35)}</span>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setContextMenu({ id: session.id, x: e.clientX, y: e.clientY })
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-md transition-all"
                        >
                          <MoreHorizontal className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-2">No chats yet</p>
                )}
              </div>
            </>
          )}

          {collapsed && (
            <div className="flex flex-col items-center gap-1 mt-1">
              {[
                { href: '/chat', icon: MessageSquare },
                { href: '/artifacts', icon: Layers },
                { href: '/settings', icon: Settings }
              ].map(item => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'p-2.5 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors',
                    pathname === item.href && 'bg-[#e0fafb] text-[#00919b]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-200 rounded-xl transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00CDD9] to-[#009aa5] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{user.name ?? user.email}</p>
                  <p className="text-[10px] text-gray-400">Free plan</p>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </>
            )}
          </button>

          <AnimatePresence>
            {showUserMenu && !collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-16 left-2 right-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profile & Settings
                </button>
                <button
                  onClick={() => router.push('/settings?tab=api')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Cpu className="w-4 h-4 text-gray-400" />
                  API Keys
                </button>
                <button
                  onClick={() => router.push('/settings?tab=plan')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Gift className="w-4 h-4 text-gray-400" />
                  Upgrade Plan
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: contextMenu.x, top: contextMenu.y }}
              className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 min-w-[140px]"
            >
              <button
                onClick={() => deleteSession(contextMenu.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete chat
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
