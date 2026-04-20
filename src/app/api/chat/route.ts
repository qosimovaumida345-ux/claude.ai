import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { getRealModel } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, model, sessionId, systemPrompt, apiKey } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const db = createServiceClient()

    const { data: user } = await db
      .from('users')
      .select('api_key_openrouter, api_key_groq')
      .eq('id', session.user.id)
      .single()

    const openrouterKey =
      apiKey?.openrouter ||
      user?.api_key_openrouter ||
      process.env.OPENROUTER_API_KEY

    if (!openrouterKey) {
      return NextResponse.json({ error: 'No API key available' }, { status: 400 })
    }

    const realModel = getRealModel(model)

    const finalMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const upstreamRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://claude-ai-8iev.onrender.com',
        'X-Title': 'Claude Fan-Made'
      },
      body: JSON.stringify({
        model: realModel,
        messages: finalMessages,
        stream: true,
        max_tokens: 4096
      })
    })

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      console.error('OpenRouter error:', errText)
      return NextResponse.json(
        { error: `Model error: ${errText}` },
        { status: upstreamRes.status }
      )
    }

    let fullContent = ''

    const transform = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              controller.enqueue(new TextEncoder().encode(delta))
            }
          } catch {
            // ignore parse errors
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
          } catch (err) {
            console.error('DB save error:', err)
          }
        }
      }
    })

    return new Response(upstreamRes.body!.pipeThrough(transform), {
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