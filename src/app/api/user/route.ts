import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { validateOpenRouterKey } from '@/lib/openrouter'
import { NextRequest, NextResponse } from 'next/server'

const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL ?? 'https://api.cerebras.ai/v1'

async function validateCerebrasKey(apiKey: string) {
  try {
    const res = await fetch(`${CEREBRAS_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('users')
    .select('id, email, name, avatar, plan, api_key_openrouter, api_key_cerebras, created_at')
    .eq('id', session.user.id)
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { name, api_key_openrouter, api_key_cerebras } = body

  const updates: Record<string, string> = {}
  if (name !== undefined) updates.name = name
  if (api_key_openrouter !== undefined) updates.api_key_openrouter = api_key_openrouter
  if (api_key_cerebras !== undefined) updates.api_key_cerebras = api_key_cerebras

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

    if (provider === 'cerebras') {
      const valid = await validateCerebrasKey(apiKey)
      return Response.json({ valid })
    }
  }

  return new Response('Unknown action', { status: 400 })
}