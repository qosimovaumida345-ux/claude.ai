import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { getModelById } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

interface ProviderConfig {
  url: string
  key: string
  model: string
}

function buildProviderConfig(
  provider: string,
  realModel: string,
  userKeys: { google?: string; groq?: string; openrouter?: string }
): ProviderConfig | null {
  switch (provider) {
    case 'google': {
      const key = userKeys.google || process.env.GOOGLE_AI_API_KEY
      if (!key) return null
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        key,
        model: realModel
      }
    }
    case 'groq': {
      const key = userKeys.groq || process.env.GROQ_API_KEY
      if (!key) return null
      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        key,
        model: realModel
      }
    }
    case 'openrouter': {
      const key = userKeys.openrouter || process.env.OPENROUTER_API_KEY
      if (!key) return null
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key,
        model: realModel
      }
    }
    default:
      return null
  }
}

async function getUserId(session: any, db: any): Promise<string | null> {
  if (session?.user?.id) return session.user.id

  const email = session?.user?.email
  if (!email) return null

  const { data } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  return data?.id ?? null
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const db = createServiceClient()
    const userId = await getUserId(session, db)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, model, sessionId, systemPrompt } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    // User keys (DB dan)
    const { data: userData } = await db
      .from('users')
      .select('api_key_openrouter, api_key_groq, api_key_google')
      .eq('id', userId)
      .single()

    const userKeys = {
      google: userData?.api_key_google || undefined,
      groq: userData?.api_key_groq || undefined,
      openrouter: userData?.api_key_openrouter || undefined
    }

    const fanModel = getModelById(model)
    const provider = fanModel?.provider ?? 'google'
    const realModel = fanModel?.realModel ?? 'gemini-2.0-flash'

    // Provider config (user key → env key)
    const config = buildProviderConfig(provider, realModel, userKeys)

    if (!config) {
      return NextResponse.json(
        { error: `No API key available for provider: ${provider}. Add your key in Settings → API Keys.` },
        { status: 400 }
      )
    }

    const finalMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const upstreamRes = await fetch(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        ...(provider === 'openrouter' && {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://claude-ai-8iev.onrender.com',
          'X-Title': 'Claude Fan-Made'
        })
      },
      body: JSON.stringify({
        model: config.model,
        messages: finalMessages,
        stream: true,
        max_tokens: 8192
      })
    })

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      return NextResponse.json(
        { error: `Model error: ${errText}` },
        { status: upstreamRes.status }
      )
    }

    if (!upstreamRes.body) {
      return NextResponse.json({ error: 'No response body' }, { status: 502 })
    }

    let fullContent = ''
    let buffer = ''
    const decoder = new TextDecoder()

    const transform = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue

          const data = trimmed.slice('data:'.length).trim()
          if (!data || data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              controller.enqueue(new TextEncoder().encode(delta))
            }
          } catch {
            // ignore broken SSE lines
          }
        }
      },

      async flush() {
        if (sessionId && fullContent) {
          try {
            await db.from('messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              model
            })
            await db
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', sessionId)
          } catch (e) {
            console.error('DB save error:', e)
          }
        }
      }
    })

    return new Response(upstreamRes.body.pipeThrough(transform), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
      }
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}