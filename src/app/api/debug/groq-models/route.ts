import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data: user, error } = await db
    .from('users')
    .select('api_key_groq')
    .eq('id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const groqKey = user?.api_key_groq ?? process.env.GROQ_API_KEY
  if (!groqKey) {
    return NextResponse.json({ error: 'Missing GROQ API key' }, { status: 400 })
  }

  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${groqKey}` }
  })

  const json = await res.json()

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status })
  }

  // json ichida odatda: { data: [{ id, ... }, ...] }
  return NextResponse.json(json)
}