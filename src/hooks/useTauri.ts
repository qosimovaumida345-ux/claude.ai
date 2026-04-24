import { useState, useEffect } from 'react'
import { isTauri, writeFile, readFile, createDir, listDir, deleteFile } from '@/lib/tauri'

export function useTauri() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(isTauri())
  }, [])

  return {
    isDesktop,
    writeFile,
    readFile,
    createDir,
    listDir,
    deleteFile,
  }
}