import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'
import { MODELS } from '@/lib/models'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const live = searchParams.get('live') === 'true'

  if (!live) {
    return Response.json({ fanMadeModels: MODELS, liveModels: [] })
  }

  const db = createServiceClient()
  const { data: user } = await db
    .from('users')
    .select('api_key_openrouter')
    .eq('id', session.user.id)
    .single()

  const apiKey = user?.api_key_openrouter || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ fanMadeModels: MODELS, liveModels: [] })
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 }
    })
    if (!res.ok) return Response.json({ fanMadeModels: MODELS, liveModels: [] })
    const data = await res.json()
    const liveModels = data.data?.map((m: {
      id: string
      name: string
      description?: string
      context_length?: number
    }) => ({
      id: m.id,
      name: m.name,
      description: m.description ?? '',
      contextWindow: m.context_length ?? 8192
    })) ?? []
    return Response.json({ fanMadeModels: MODELS, liveModels })
  } catch {
    return Response.json({ fanMadeModels: MODELS, liveModels: [] })
  }
}
