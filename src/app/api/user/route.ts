import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { validateOpenRouterKey } from '@/lib/openrouter'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('users')
    .select('id, email, name, avatar, plan, api_key_openrouter, api_key_groq, created_at')
    .eq('id', session.user.id)
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { name, api_key_openrouter, api_key_groq } = body

  const updates: Record<string, string> = {}
  if (name !== undefined) updates.name = name
  if (api_key_openrouter !== undefined) updates.api_key_openrouter = api_key_openrouter
  if (api_key_groq !== undefined) updates.api_key_groq = api_key_groq

  const db = createServiceClient()
  const { data, error } = await db
    .from('users')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { action, apiKey, provider } = body

  if (action === 'validate-key') {
    if (provider === 'openrouter') {
      const valid = await validateOpenRouterKey(apiKey)
      return Response.json({ valid })
    }
    if (provider === 'groq') {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` }
        })
        return Response.json({ valid: res.ok })
      } catch {
        return Response.json({ valid: false })
      }
    }
  }

  return new Response('Unknown action', { status: 400 })
}
