import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return new Response('Email and password required', { status: 400 })
  }

  if (password.length < 8) {
    return new Response('Password must be at least 8 characters', { status: 400 })
  }

  const db = createServiceClient()
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return new Response('Email already in use', { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const { data, error } = await db
    .from('users')
    .insert({ email, name: name ?? email.split('@')[0], password_hash: hash, provider: 'credentials' })
    .select('id, email, name')
    .single()

  if (error) return new Response(error.message, { status: 500 })
  return Response.json(data, { status: 201 })
}
