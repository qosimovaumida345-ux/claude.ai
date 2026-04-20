import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { getModelById } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, model, sessionId, systemPrompt } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.DEEPSEEK_BASE_URL
    const deepseekChatModel = process.env.DEEPSEEK_CHAT_MODEL
    const deepseekReasonerModel = process.env.DEEPSEEK_REASONER_MODEL

    if (!deepseekKey || !baseUrl || !deepseekChatModel || !deepseekReasonerModel) {
      return NextResponse.json(
        { error: 'Missing DeepSeek env vars (DEEPSEEK_API_KEY/BASE_URL/CHAT_MODEL/REASONER_MODEL)' },
        { status: 500 }
      )
    }

    // deepseek chat completions URL
    // docs: base_url = https://api.deepseek.com, OpenAI-compatible -> /v1/chat/completions
    const chatCompletionsUrl = baseUrl.endsWith('/v1')
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/v1/chat/completions`

    const fanModel = getModelById(model)
    const deepseekModel = fanModel?.isThinking ? deepseekReasonerModel : deepseekChatModel

    const finalMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const db = createServiceClient()

    const upstreamRes = await fetch(chatCompletionsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: deepseekModel,
        messages: finalMessages,
        stream: true
      })
    })

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      return NextResponse.json(
        { error: `Model error: ${errText}` },
        { status: upstreamRes.status }
      )
    }

    let fullContent = ''
    let buffer = ''
    const decoder = new TextDecoder()

    const transform = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })

        // SSE: lines like "data: {json}" and "data: [DONE]"
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue

          const data = trimmed.slice('data:'.length).trim()
          if (!data || data === '[DONE]') continue

          try {
            const json = JSON.parse(data)

            const delta =
              json?.choices?.[0]?.delta?.content ??
              json?.choices?.[0]?.message?.content ??
              ''

            if (delta) {
              fullContent += delta
              controller.enqueue(new TextEncoder().encode(delta))
            }
          } catch {
            // ignore broken partial lines
          }
        }
      },

      async flush() {
        // assistant javobini DB ga yozish
        if (sessionId && fullContent) {
          try {
            await db.from('messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              model // fan-made id ni saqlaymiz (sizning oldingi logikangizga mos)
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

    if (!upstreamRes.body) {
      return NextResponse.json({ error: 'No upstream body' }, { status: 502 })
    }

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