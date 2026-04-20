import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import { generateTitle } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('chat_sessions')
    .select('*, messages(id, role, content, created_at)')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const db = createServiceClient()

  const { data, error } = await db
    .from('chat_sessions')
    .insert({
      user_id: session.user.id,
      title: body.title ?? 'New Chat',
      model: body.model ?? 'claude-fan-made-4.6',
      system_prompt: body.systemPrompt
    })
    .select()
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { id, title, model, systemPrompt } = body
  const db = createServiceClient()

  const { data, error } = await db
    .from('chat_sessions')
    .update({ title, model, system_prompt: systemPrompt })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const db = createServiceClient()
  const { error } = await db
    .from('chat_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return new Response(error.message, { status: 500 })
  return new Response('OK')
}
