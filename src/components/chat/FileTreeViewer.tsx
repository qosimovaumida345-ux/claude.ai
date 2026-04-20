'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, X } from 'lucide-react'
import { cn, getFileIcon, formatFileSize } from '@/lib/utils'
import type { ExtractedFile } from '@/types'

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
  file?: ExtractedFile
}

function buildTree(files: ExtractedFile[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      let node = current.find(n => n.name === part)

      if (!node) {
        node = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir: !isLast,
          children: [],
          file: isLast ? file : undefined
        }
        current.push(node)
      }
      current = node.children
    }
  }

  return root
}

function TreeNode({ node, depth = 0, onSelect, selected }: {
  node: TreeNode
  depth?: number
  onSelect: (file: ExtractedFile) => void
  selected?: string
}) {
  const [open, setOpen] = useState(depth < 2)

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors text-xs text-gray-700"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {open ? <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" /> : <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
          {open ? <FolderOpen className="w-3.5 h-3.5 text-yellow-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {node.children.map(child => (
                <TreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} selected={selected} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      className={cn(
        'flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-lg transition-colors text-xs',
        selected === node.path ? 'bg-[#e0fafb] text-[#00919b]' : 'text-gray-600 hover:bg-gray-100'
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <span className="w-3 shrink-0" />
      <span className="text-sm shrink-0">{getFileIcon(node.name)}</span>
      <span className="truncate">{node.name}</span>
    </button>
  )
}

interface Props {
  files: ExtractedFile[]
  zipName: string
  onClose?: () => void
}

export default function FileTreeViewer({ files, zipName, onClose }: Props) {
  const [selected, setSelected] = useState<ExtractedFile | null>(files[0] ?? null)
  const tree = buildTree(files)

  return (
    <div className="flex h-full rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div className="w-56 shrink-0 border-r border-gray-100 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">📦</span>
            <span className="text-xs font-medium text-gray-700 truncate">{zipName}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
          {tree.map(node => (
            <TreeNode key={node.path} node={node} onSelect={setSelected} selected={selected?.path} />
          ))}
        </div>
        <div className="px-3 py-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">{files.length} files</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-sm">{getFileIcon(selected.name)}</span>
              <span className="text-xs font-medium text-gray-700 truncate">{selected.path}</span>
              <span className="ml-auto text-[10px] text-gray-400 shrink-0">{formatFileSize(selected.size)}</span>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-[12px] leading-relaxed font-mono text-gray-700 scrollbar-thin">
              {selected.content === '[Binary file - cannot display]'
                ? <span className="text-gray-400 italic">Binary file — cannot display</span>
                : selected.content
              }
            </pre>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  )
}
