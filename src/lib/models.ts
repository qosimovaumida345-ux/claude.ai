import { AIModel } from '@/types'

export const MODELS: AIModel[] = [
  {
    id: 'claude-fan-made-haiku',
    name: 'Claude Fan-Made Haiku',
    description: 'Llama 3.1 8B (Fastest)',
    provider: 'cerebras',
    realModel: 'llama3.1-8b',
    isFast: true,
    contextWindow: 131072,
    category: 'haiku'
  },
  {
    id: 'claude-fan-made-4.6',
    name: 'Claude Fan-Made 4.6',
    description: 'GPT OSS 120B (Balanced)',
    provider: 'cerebras',
    realModel: 'gpt-oss-120b',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.7',
    name: 'Claude Fan-Made 4.7',
    description: 'Qwen 3 235B (High Quality)',
    provider: 'cerebras',
    realModel: 'qwen-3-235b-a22b-instruct-2507',
    contextWindow: 131072,
    category: 'sonnet'
  },
  {
    id: 'claude-fan-made-4.6-opus',
    name: 'Claude Fan-Made 4.6 Opus',
    description: 'Qwen 3 235B (Best for Coding)',
    provider: 'cerebras',
    realModel: 'qwen-3-235b-a22b-instruct-2507',
    contextWindow: 131072,
    category: 'opus'
  },
  {
    id: 'claude-fan-made-4.6-opus-thinking',
    name: 'Claude Fan-Made 4.6 Opus (Thinking)',
    description: 'Qwen 3 235B (Deep Reasoning)',
    provider: 'cerebras',
    realModel: 'qwen-3-235b-a22b-instruct-2507',
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