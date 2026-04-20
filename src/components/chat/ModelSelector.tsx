'use client'

import { useState } from 'react'
import { ChevronDown, Zap, Brain, Cpu, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MODELS } from '@/lib/models'
import { cn } from '@/lib/utils'
import type { AIModel } from '@/types'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  haiku: <Zap className="w-3.5 h-3.5 text-yellow-500" />,
  sonnet: <Cpu className="w-3.5 h-3.5 text-[#00CDD9]" />,
  opus: <Sparkles className="w-3.5 h-3.5 text-purple-500" />,
  thinking: <Brain className="w-3.5 h-3.5 text-indigo-500" />
}

const CATEGORY_COLORS: Record<string, string> = {
  haiku: 'bg-yellow-50 text-yellow-700',
  sonnet: 'bg-[#e0fafb] text-[#00919b]',
  opus: 'bg-purple-50 text-purple-700',
  thinking: 'bg-indigo-50 text-indigo-700'
}

interface Props {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export default function ModelSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const current = MODELS.find(m => m.id === value) ?? MODELS[1]

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
          'bg-white border-gray-200 text-gray-700 hover:border-[#00CDD9] hover:text-[#00919b]',
          disabled && 'opacity-50 cursor-not-allowed',
          open && 'border-[#00CDD9] text-[#00919b]'
        )}
      >
        {CATEGORY_ICONS[current.category]}
        <span className="max-w-[140px] truncate">{current.name}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-72"
            >
              <div className="p-2 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Fan-Made Models
                </p>
              </div>

              <div className="p-2 space-y-0.5">
                {MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => { onChange(model.id); setOpen(false) }}
                    className={cn(
                      'w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors',
                      value === model.id ? 'bg-[#e0fafb]' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {CATEGORY_ICONS[model.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold', value === model.id ? 'text-[#00919b]' : 'text-gray-800')}>
                          {model.name}
                        </span>
                        {model.isFast && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                            Fast
                          </span>
                        )}
                        {model.isThinking && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                            Thinking
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{model.description}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {(model.contextWindow / 1000).toFixed(0)}K context
                      </p>
                    </div>
                    {value === model.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00CDD9] mt-2 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
