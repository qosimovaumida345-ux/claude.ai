import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions)

  const db = createServiceClient()

  // 1) eng tez: id bo'lsa
  if (session?.user?.id) return session.user.id as string

  // 2) id yo'q bo'lsa: email bo'yicha topamiz
  const email = session?.user?.email
  if (!email) return null

  const { data, error } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (error) {
    console.error('getUserIdFromSession error:', error)
    return null
  }

  return data?.id as string | null
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()
    const { data, error } = await db
      .from('chat_sessions')
      .select('*, messages(id, role, content, created_at)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const db = createServiceClient()

    const { data, error } = await db
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: body.title ?? 'New Chat',
        model: body.model ?? 'claude-fan-made-4.6',
        system_prompt: body.systemPrompt ?? null
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH/DELETE ham xuddi shunday userId fallback bilan
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, title, model, systemPrompt } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const db = createServiceClient()
    const { data, error } = await db
      .from('chat_sessions')
      .update({
        title,
        model,
        system_prompt: systemPrompt ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const db = createServiceClient()
    const { error } = await db
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/sessions error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}