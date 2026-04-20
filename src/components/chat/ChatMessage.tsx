'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Copy, Check, ChevronDown, Brain, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, parseThinkingContent } from '@/lib/utils'
import type { Message } from '@/types'
import LogoAnimation from '@/components/ui/LogoAnimation'

interface Props {
  message: Message
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [thinkingOpen, setThinkingOpen] = useState(false)

  const isUser = message.role === 'user'
  const { thinking, answer } = parseThinkingContent(message.content)
  const hasThinking = !!thinking

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const content = hasThinking ? answer : message.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex gap-3 px-4 py-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        ) : (
          <LogoAnimation spinning={isStreaming} size={32} />
        )}
      </div>

      <div className={cn('flex-1 min-w-0', isUser ? 'flex justify-end' : '')}>
        {isUser ? (
          <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="max-w-[90%]">
            {hasThinking && (
              <button
                onClick={() => setThinkingOpen(!thinkingOpen)}
                className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg mb-3 hover:bg-indigo-100 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Thinking process</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', thinkingOpen && 'rotate-180')} />
              </button>
            )}

            <AnimatePresence>
              {hasThinking && thinkingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin">
                    {thinking}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn('prose-chat', isStreaming && !content && 'stream-cursor')}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? '')
                    const codeStr = String(children).replace(/\n$/, '')
                    const isBlock = !!match

                    if (!isBlock) {
                      return <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-gray-800" {...props}>{children}</code>
                    }

                    return (
                      <div className="code-block relative group/code my-3">
                        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-xl">
                          <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
                          <button
                            onClick={() => copyCode(codeStr)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedCode === codeStr ? (
                              <><Check className="w-3 h-3" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: '0 0 12px 12px',
                            fontSize: '13px'
                          }}
                        >
                          {codeStr}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && content && <span className="stream-cursor" />}
            </div>

            {!isStreaming && message.model && (
              <p className="text-[10px] text-gray-300 mt-2">{message.model}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
