import { AIModel } from '@/types'

export const MODELS: AIModel[] = [
  {
    id: 'claude-fan-made-haiku',
    name: 'Claude Fan-Made Haiku',
    description: 'Fast — lightweight coding/chat',
    provider: 'groq',
    realModel: 'llama3-8b-8192',
    isFast: true,
    contextWindow: 131072,
    category: 'haiku'
  },
  {
    id: 'claude-fan-made-4.6',
    name: 'Claude Fan-Made 4.6',
    description: 'Balanced — code + chat',
    provider: 'groq',
    realModel: 'llama-3.3-70b-versatile',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.7',
    name: 'Claude Fan-Made 4.7',
    description: 'Strong — complex code',
    provider: 'groq',
    realModel: 'llama-3.3-70b-versatile',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.6-opus',
    name: 'Claude Fan-Made 4.6 Opus',
    description: 'Best coding quality (without Google)',
    provider: 'groq',
    realModel: 'llama-3.3-70b-versatile',
    contextWindow: 131072,
    category: 'opus'
  },
  {
    id: 'claude-fan-made-4.6-opus-thinking',
    name: 'Claude Fan-Made 4.6 Opus (Thinking)',
    description: 'Deep reasoning mode',
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
  return model?.realModel ?? MODELS[1].realModel
}

export function getModelProvider(fanMadeId: string): string {
  const model = getModelById(fanMadeId)
  return model?.provider ?? 'groq'
}