import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest } from 'next/server'
import JSZip from 'jszip'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return new Response('No file', { status: 400 })

  const buffer = await file.arrayBuffer()
  const isZip =
    file.name.endsWith('.zip') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed'

  if (!isZip) {
    const content = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    return Response.json({
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      extractedFiles: []
    })
  }

  try {
    const zip = await JSZip.loadAsync(buffer)
    const extractedFiles: {
      name: string
      path: string
      content: string
      size: number
      type: string
    }[] = []

    const filePromises: Promise<void>[] = []

    zip.forEach((path, zipEntry) => {
      if (!zipEntry.dir) {
        filePromises.push(
          zipEntry.async('text').then(content => {
            const parts = path.split('/')
            const name = parts[parts.length - 1]
            const ext = name.split('.').pop() ?? ''
            extractedFiles.push({
              name,
              path,
              content: content.slice(0, 50000),
              size: content.length,
              type: ext
            })
          }).catch(() => {
            const parts = path.split('/')
            const name = parts[parts.length - 1]
            extractedFiles.push({
              name,
              path,
              content: '[Binary file - cannot display]',
              size: 0,
              type: 'binary'
            })
          })
        )
      }
    })

    await Promise.all(filePromises)
    extractedFiles.sort((a, b) => a.path.localeCompare(b.path))

    return Response.json({
      name: file.name,
      type: file.type,
      size: file.size,
      content: '',
      extractedFiles
    })
  } catch (err) {
    return new Response(`Failed to extract zip: ${err}`, { status: 500 })
  }
}
