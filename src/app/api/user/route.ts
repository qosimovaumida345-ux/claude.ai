import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

async function getUserId() {
  const session = await getServerSession(authOptions)
  const db = createServiceClient()

  if (session?.user?.id) return session.user.id as string

  const email = session?.user?.email
  if (!email) return null

  const { data } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  return data?.id as string | null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('users')
    .select('id, email, name, avatar, plan, api_key_openrouter, api_key_groq, api_key_google, created_at')
    .eq('id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, api_key_openrouter, api_key_groq, api_key_google } = body

  const updates: Record<string, string> = {}
  if (name !== undefined) updates.name = name
  if (api_key_openrouter !== undefined) updates.api_key_openrouter = api_key_openrouter
  if (api_key_groq !== undefined) updates.api_key_groq = api_key_groq
  if (api_key_google !== undefined) updates.api_key_google = api_key_google

  const db = createServiceClient()
  const { data, error } = await db
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, apiKey, provider } = body

  if (action === 'validate-key') {
    try {
      if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` }
        })
        return NextResponse.json({ valid: res.ok })
      }

      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` }
        })
        return NextResponse.json({ valid: res.ok })
      }

      if (provider === 'google') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )
        return NextResponse.json({ valid: res.ok })
      }
    } catch {
      return NextResponse.json({ valid: false })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}