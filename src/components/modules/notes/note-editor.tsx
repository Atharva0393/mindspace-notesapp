'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Pin,
  Star,
  Folder as FolderIcon,
  Tag,
  X,
  ArrowLeft,
  CloudCheck,
  RotateCw,
  Palette,
  Check,
} from 'lucide-react'
import { Note, Folder, AutoSaveStatus } from '@/types/notes'
import { PASTEL_PALETTE, PastelColorKey, PASTEL_COLOR_KEYS } from '@/lib/constants/colors'
import { EditorToolbar } from './editor-toolbar'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { cn } from '@/lib/utils/styling'

export interface NoteEditorProps {
  note: Note
  folders: Folder[]
  isConfigured?: boolean
  onSave: (updatedNote: Partial<Note>) => Promise<void>
  onClose: () => void
}

export function NoteEditor({
  note,
  folders,
  isConfigured = true,
  onSave,
  onClose,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [colorTheme, setColorTheme] = useState<PastelColorKey>(note.colorTheme)
  const [folderId, setFolderId] = useState<string | null>(note.folderId || null)
  const [isPinned, setIsPinned] = useState(note.isPinned)
  const [isFavorite, setIsFavorite] = useState(note.isFavorite)
  const [tags, setTags] = useState<string[]>(note.tags || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('saved')

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(false)

  const palette = PASTEL_PALETTE[colorTheme] || PASTEL_PALETTE.buttercream

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#4D327B] underline' },
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts, drop a checklist, or paste ideas...',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-hidden max-w-none min-h-[360px] text-[#33312F]',
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      triggerAutoSave(activeEditor.getHTML(), activeEditor.getJSON())
    },
  })

  // Autosave handler with debounce
  const triggerAutoSave = useCallback(
    (htmlContent?: string, jsonContent?: Record<string, unknown>) => {
      setSaveStatus('saving')
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const contentToSave = htmlContent !== undefined ? htmlContent : editor?.getHTML() || note.content
          const jsonToSave = jsonContent !== undefined ? jsonContent : editor?.getJSON() || note.contentJson

          await onSave({
            id: note.id,
            title: title.trim() || 'Untitled Note',
            content: contentToSave,
            contentJson: jsonToSave,
            colorTheme,
            folderId,
            isPinned,
            isFavorite,
            tags,
            updatedAt: new Date().toISOString(),
          })

          setSaveStatus(isConfigured ? 'saved' : 'offline')
        } catch (err) {
          console.error('Autosave error:', err)
          setSaveStatus('error')
        }
      }, 750)
    },
    [editor, note, title, colorTheme, folderId, isPinned, isFavorite, tags, onSave, isConfigured]
  )

  // Watch for external field updates (title, color, pin, etc.)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    triggerAutoSave()
  }, [title, colorTheme, folderId, isPinned, isFavorite, tags, triggerAutoSave])

  // Cmd+S and Escape keyboard listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        triggerAutoSave()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerAutoSave, onClose])

  function handleAddTag() {
    const trimmed = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Folder dropdown items
  const folderItems: (DropdownMenuItem | 'divider')[] = [
    {
      id: 'none',
      label: 'No Folder (Inbox)',
      icon: <FolderIcon className="w-3.5 h-3.5 text-[#85817D]" />,
      onClick: () => setFolderId(null),
    },
    'divider',
    ...folders.map((f) => ({
      id: f.id,
      label: f.name,
      icon: <FolderIcon className="w-3.5 h-3.5 text-[#33312F]" />,
      onClick: () => setFolderId(f.id),
    })),
  ]

  // Color dropdown items
  const colorItems: DropdownMenuItem[] = PASTEL_COLOR_KEYS.map((key) => {
    const p = PASTEL_PALETTE[key]
    return {
      id: key,
      label: p.name,
      icon: (
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
          style={{ backgroundColor: p.hex }}
        />
      ),
      onClick: () => setColorTheme(key),
    }
  })

  const currentFolder = folders.find((f) => f.id === folderId)

  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh-140px)] rounded-[20px] border p-6 sm:p-8 flex flex-col transition-colors paper-shadow-lg',
        palette.bgClass,
        palette.borderClass
      )}
    >
      {/* Top Header Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-black/[0.06]">
        {/* Left: Back button & Save Status Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[9px] bg-white/70 hover:bg-white text-[#33312F] border border-black/[0.04] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Notes</span>
          </button>

          {/* Save Status Badge */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#85817D]">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[#85817D]">
                <RotateCw className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[#3D7535]">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'offline' && (
              <span className="flex items-center gap-1 text-[#42361D]">
                <Check className="w-3 h-3 text-[#3D7535]" />
                <span>Saved locally</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <button
                type="button"
                onClick={() => triggerAutoSave()}
                className="flex items-center gap-1 text-[#A8382B] hover:underline cursor-pointer"
              >
                <span>Save failed — Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Folder, Color, Pin, Star, Close */}
        <div className="flex items-center gap-2">
          {/* Folder Selector */}
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="h-8 px-2.5 rounded-[9px] bg-white/70 hover:bg-white text-[#33312F] border border-black/[0.04] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <FolderIcon className="w-3.5 h-3.5 text-[#85817D]" />
                <span className="max-w-[120px] truncate">
                  {currentFolder ? currentFolder.name : 'Inbox'}
                </span>
              </button>
            }
            items={folderItems}
            align="right"
          />

          {/* Color Selector */}
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="h-8 px-2 rounded-[9px] bg-white/70 hover:bg-white text-[#33312F] border border-black/[0.04] transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title="Change pastel color"
              >
                <Palette className="w-3.5 h-3.5 text-[#85817D]" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: palette.hex }}
                />
              </button>
            }
            items={colorItems}
            align="right"
          />

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              'w-8 h-8 rounded-[9px] flex items-center justify-center transition-colors border border-black/[0.04] cursor-pointer',
              isPinned
                ? 'bg-[#33312F] text-white shadow-xs'
                : 'bg-white/70 text-[#85817D] hover:text-[#33312F] hover:bg-white'
            )}
            title={isPinned ? 'Unpin note' : 'Pin note to top'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Favorite toggle */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              'w-8 h-8 rounded-[9px] flex items-center justify-center transition-colors border border-black/[0.04] cursor-pointer',
              isFavorite
                ? 'bg-[#E5B54F] text-white shadow-xs'
                : 'bg-white/70 text-[#85817D] hover:text-[#33312F] hover:bg-white'
            )}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('w-3.5 h-3.5', isFavorite && 'fill-white')} />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[9px] bg-white/70 hover:bg-white text-[#85817D] hover:text-[#33312F] border border-black/[0.04] flex items-center justify-center transition-colors cursor-pointer"
            title="Close editor (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold tracking-tight text-[#33312F] placeholder-[#AFAAA4] focus:outline-hidden"
        />
      </div>

      {/* Tags Strip */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {tags.map((tag) => (
          <PastelBadge key={tag} variant="white" size="sm" className="group">
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-[#85817D] hover:text-[#A8382B] cursor-pointer"
            >
              ×
            </button>
          </PastelBadge>
        ))}

        {isAddingTag ? (
          <div className="inline-flex items-center gap-1 bg-white border border-[#EAE6DF] rounded-[6px] px-2 py-0.5 text-xs">
            <span className="text-[#85817D]">#</span>
            <input
              type="text"
              autoFocus
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                } else if (e.key === 'Escape') {
                  setIsAddingTag(false)
                }
              }}
              onBlur={handleAddTag}
              placeholder="tag name..."
              className="w-20 bg-transparent text-xs text-[#33312F] focus:outline-hidden"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/50 hover:bg-white text-[11px] font-medium text-[#85817D] hover:text-[#33312F] border border-dashed border-black/[0.1] transition-colors cursor-pointer"
          >
            <Tag className="w-3 h-3" />
            <span>Add tag</span>
          </button>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div className="sticky top-20 z-10 mb-4">
        <EditorToolbar editor={editor} />
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 bg-white/70 backdrop-blur-xs rounded-[16px] border border-black/[0.04] p-6 sm:p-8 paper-shadow">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Footer Meta */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#85817D]">
        <span>
          Last modified:{' '}
          {new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(note.updatedAt))}
        </span>
        <span className="hidden sm:inline">Press ⌘S to save immediately &bull; Esc to return</span>
      </div>
    </div>
  )
}

