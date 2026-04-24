// Tauri da ishlayaptimi?
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// Fayl yozish
export async function writeFile(path: string, content: string): Promise<string> {
  if (!isTauri()) throw new Error('Bu funksiya faqat desktop ilovada ishlaydi')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('write_file', { path, content })
}

// Fayl o'qish
export async function readFile(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Bu funksiya faqat desktop ilovada ishlaydi')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('read_file', { path })
}

// Papka yaratish
export async function createDir(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Bu funksiya faqat desktop ilovada ishlaydi')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('create_dir', { path })
}

// Papka ro'yxati
export async function listDir(path: string): Promise<string[]> {
  if (!isTauri()) throw new Error('Bu funksiya faqat desktop ilovada ishlaydi')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string[]>('list_dir', { path })
}

// Fayl o'chirish
export async function deleteFile(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Bu funksiya faqat desktop ilovada ishlaydi')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('delete_file', { path })
}

// Fayl mavjudmi?
export async function fileExists(path: string): Promise<boolean> {
  if (!isTauri()) return false
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<boolean>('file_exists', { path })
}

// Chat xabaridan fayl amali bormi?
export function detectFileCommand(message: string): {
  action: 'write' | 'read' | 'create_dir' | 'list' | 'delete' | null
  path: string | null
  content: string | null
} {
  const lower = message.toLowerCase()

  // Yozish: "D:/test.txt ga yoz ..." yoki "... ni D:/test.txt ga saqlа"
  const writeMatch = message.match(/(?:yaratgin|yozgin|saqlа|saqlаgin|create|write|save)[^"'`]*["'`]([^"'`]+)["'`]/i)
    || message.match(/([A-Za-z]:[/\\][^\s]+\.[a-zA-Z]+)\s+(?:ga\s+)?(?:yoz|yaratgin|saqlа|saqla)/i)
    || message.match(/(?:fayl|file)\s+["'`]?([A-Za-z]:[/\\][^\s"'`]+)["'`]?/i)

  if (writeMatch) {
    return { action: 'write', path: writeMatch[1], content: null }
  }

  // O'qish
  const readMatch = message.match(/(?:o[`']qi|ochgin|ko[`']rsat|read|open)\s+["'`]?([A-Za-z]:[/\\][^\s"'`]+)["'`]?/i)
  if (readMatch) {
    return { action: 'read', path: readMatch[1], content: null }
  }

  // Papka
  const dirMatch = message.match(/(?:papka|folder|dir)\s+["'`]?([A-Za-z]:[/\\][^\s"'`]+)["'`]?/i)
  if (dirMatch) {
    return { action: 'create_dir', path: dirMatch[1], content: null }
  }

  return { action: null, path: null, content: null }
}