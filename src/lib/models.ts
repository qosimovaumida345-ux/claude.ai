import { AIModel } from '@/types'

export const MODELS: AIModel[] = [
  {
    id: 'claude-fan-made-haiku',
    name: 'Claude Fan-Made Haiku',
    description: 'Ultra fast — everyday tasks',
    provider: 'groq',
    realModel: 'llama-3.3-70b-versatile',
    isFast: true,
    contextWindow: 131072,
    category: 'haiku'
  },
  {
    id: 'claude-fan-made-4.6',
    name: 'Claude Fan-Made 4.6',
    description: 'Balanced — code + chat',
    provider: 'google',
    realModel: 'gemini-2.0-flash',
    contextWindow: 1048576,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.7',
    name: 'Claude Fan-Made 4.7',
    description: 'Smart — complex code',
    provider: 'google',
    realModel: 'gemini-2.5-flash-preview-04-17',
    contextWindow: 1048576,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.6-opus',
    name: 'Claude Fan-Made 4.6 Opus',
    description: 'Powerful — deep coding',
    provider: 'google',
    realModel: 'gemini-2.5-pro-preview-03-25',
    contextWindow: 1048576,
    category: 'opus'
  },
  {
    id: 'claude-fan-made-4.6-opus-thinking',
    name: 'Claude Fan-Made 4.6 Opus (Thinking)',
    description: 'Deep reasoning — hardest tasks',
    provider: 'groq',
    realModel: 'deepseek-r1-distill-llama-70b',
    isThinking: true,
    contextWindow: 131072,
    category: 'thinking'
  }
]

export const DEFAULT_MODEL = 'claude-fan-made-4.6'

export function getModelById(id: string): AIModel | undefined {
  return MODELS.find(m => m.id === id)
}

export function getRealModel(fanMadeId: string): string {
  const model = getModelById(fanMadeId)
  return model?.realModel ?? 'gemini-2.0-flash'
}

export function getModelProvider(fanMadeId: string): string {
  const model = getModelById(fanMadeId)
  return model?.provider ?? 'google'
}