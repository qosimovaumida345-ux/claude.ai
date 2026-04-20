import { AIModel } from '@/types'

export const MODELS: AIModel[] = [
  {
    id: 'claude-fan-made-haiku',
    name: 'Claude Fan-Made Haiku',
    description: 'Fast coding/chat (Cerebras)',
    provider: 'cerebras',
    realModel: 'qwen-3-coder-480b-free',
    isFast: true,
    contextWindow: 131072,
    category: 'haiku'
  },
  {
    id: 'claude-fan-made-4.6',
    name: 'Claude Fan-Made 4.6',
    description: 'Balanced coding/chat (Cerebras)',
    provider: 'cerebras',
    realModel: 'qwen-3-coder-480b-free',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.7',
    name: 'Claude Fan-Made 4.7',
    description: 'Stronger coding/chat (Cerebras)',
    provider: 'cerebras',
    realModel: 'qwen-3-coder-480b-free',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.6-opus',
    name: 'Claude Fan-Made 4.6 Opus',
    description: 'Best coding (Cerebras)',
    provider: 'cerebras',
    realModel: 'qwen-3-coder-480b-free',
    contextWindow: 131072,
    category: 'opus'
  },
  {
    id: 'claude-fan-made-4.6-opus-thinking',
    name: 'Claude Fan-Made 4.6 Opus (Thinking)',
    description: 'Deep reasoning mode (Cerebras)',
    provider: 'cerebras',
    realModel: 'qwen-3-235b-a22b-thinking-2507', // agar error bo‘lsa bu satrni Cerebras docsdagi nom bilan almashtiramiz
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
  return model?.provider ?? 'cerebras'
}