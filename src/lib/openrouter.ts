export async function streamOpenRouter(
  messages: { role: string; content: string }[],
  model: string,
  apiKey: string,
  systemPrompt?: string
): Promise<ReadableStream> {
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
      'X-Title': 'Claude Fan-Made'
    },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      stream: true,
      max_tokens: 4096
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error: ${response.status} ${err}`)
  }

  return response.body!
}

export async function validateOpenRouterKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    return res.ok
  } catch {
    return false
  }
}

export async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data?.map((m: { id: string }) => m.id) ?? []
  } catch {
    return []
  }
}
