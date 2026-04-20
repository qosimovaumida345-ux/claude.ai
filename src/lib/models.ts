import { AIModel } from '@/types'

export const MODELS: AIModel[] = [
  {
    id: 'claude-fan-made-haiku',
    name: 'Claude Fan-Made Haiku',
    description: 'Fast and efficient for everyday tasks',
    provider: 'openrouter',
    realModel: 'meta-llama/llama-3.1-8b-instruct:free',
    isFast: true,
    contextWindow: 131072,
    category: 'haiku'
  },
  {
    id: 'claude-fan-made-4.6',
    name: 'Claude Fan-Made 4.6',
    description: 'Balanced intelligence and speed',
    provider: 'openrouter',
    realModel: 'meta-llama/llama-3.3-70b-instruct:free',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.7',
    name: 'Claude Fan-Made 4.7',
    description: 'Latest generation with improved reasoning',
    provider: 'openrouter',
    realModel: 'google/gemini-2.0-flash-exp:free',
    contextWindow: 1048576,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.6-opus',
    name: 'Claude Fan-Made 4.6 Opus',
    description: 'Maximum intelligence for complex tasks',
    provider: 'openrouter',
    realModel: 'deepseek/deepseek-chat-v3-0324:free',
    contextWindow: 163840,
    category: 'opus'
  },
  {
    id: 'claude-fan-made-4.6-opus-thinking',
    name: 'Claude Fan-Made 4.6 Opus (Thinking)',
    description: 'Deep reasoning with extended thinking',
    provider: 'openrouter',
    realModel: 'deepseek/deepseek-r1:free',
    isThinking: true,
    contextWindow: 163840,
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
  return model?.provider ?? 'openrouter'
}
