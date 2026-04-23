export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  plan: 'free' | 'pro' | 'team'
  api_key_openrouter?: string
  api_key_cerebras?: string
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  model: string
  system_prompt?: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  thinking?: string
  created_at: string
}

export interface AIModel {
  id: string
  name: string
  description: string
  provider: 'openrouter' | 'cerebras'
  realModel: string
  image?: string                              // ✅ yangi field
  isThinking?: boolean
  isFast?: boolean
  contextWindow: number
  category: 'haiku' | 'sonnet' | 'opus' | 'thinking'
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  content?: string
  extractedFiles?: ExtractedFile[]
}

export interface ExtractedFile {
  name: string
  path: string
  content: string
  size: number
  type: string
}

export interface ApiKeyStatus {
  openrouter: boolean | null
  cerebras: boolean | null
}