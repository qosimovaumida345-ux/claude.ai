// @tauri-apps/api import qilmaymiz — Render build buzilmaydi
// Tauri window ichiga __TAURI_INTERNALS__ inject qiladi, undan foydalanamiz

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// Ichki invoke — hech qanday npm package kerak emas
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const internals = (window as any).__TAURI_INTERNALS__
  if (!internals) throw new Error('Tauri runtime topilmadi')
  return internals.invoke(cmd, args)
}

export async function writeFile(path: string, content: string): Promise<string> {
  if (!isTauri()) throw new Error('Faqat desktop ilovada ishlaydi')
  return tauriInvoke<string>('write_file', { path, content })
}

export async function readFile(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Faqat desktop ilovada ishlaydi')
  return tauriInvoke<string>('read_file', { path })
}

export async function createDir(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Faqat desktop ilovada ishlaydi')
  return tauriInvoke<string>('create_dir', { path })
}

export async function listDir(path: string): Promise<string[]> {
  if (!isTauri()) throw new Error('Faqat desktop ilovada ishlaydi')
  return tauriInvoke<string[]>('list_dir', { path })
}

export async function deleteFile(path: string): Promise<string> {
  if (!isTauri()) throw new Error('Faqat desktop ilovada ishlaydi')
  return tauriInvoke<string>('delete_file', { path })
}

export async function fileExists(path: string): Promise<boolean> {
  if (!isTauri()) return false
  return tauriInvoke<boolean>('file_exists', { path })
}