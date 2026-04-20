import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function generateTitle(content: string): string {
  const words = content.trim().split(/\s+/).slice(0, 8).join(' ')
  return truncate(words, 50)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    ts: '📘', tsx: '⚛️', js: '📜', jsx: '⚛️',
    py: '🐍', rs: '🦀', go: '🐹', java: '☕',
    css: '🎨', html: '🌐', json: '📋', md: '📝',
    txt: '📄', zip: '📦', png: '🖼️', jpg: '🖼️',
    jpeg: '🖼️', gif: '🖼️', svg: '🎨', pdf: '📕',
    sql: '🗃️', sh: '⚙️', env: '🔒', yml: '⚙️', yaml: '⚙️'
  }
  return icons[ext ?? ''] ?? '📄'
}

export function parseThinkingContent(content: string): { thinking: string; answer: string } {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i)
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim()
    const answer = content.replace(/<think>[\s\S]*?<\/think>/i, '').trim()
    return { thinking, answer }
  }
  return { thinking: '', answer: content }
}
