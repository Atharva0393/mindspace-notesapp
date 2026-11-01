'use client'

import React, { useState } from 'react'
import { Plus, Maximize2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Folder, NoteCreateInput } from '@/types/notes'
import { PASTEL_PALETTE, PastelColorKey, PASTEL_COLOR_KEYS } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface QuickNoteModalProps {
  isOpen: boolean
  onClose: () => void
  folders: Folder[]
  onCreateNote: (input: NoteCreateInput, openFullEditor?: boolean) => void
}

export function QuickNoteModal({
  isOpen,
  onClose,
  folders,
  onCreateNote,
}: QuickNoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [colorTheme, setColorTheme] = useState<PastelColorKey>('buttercream')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  function resetForm() {
    setTitle('')
    setContent('')
    setColorTheme('buttercream')
    setFolderId(null)
    setTagInput('')
  }

  function handleSave(openFullEditor = false) {
    if (!title.trim() && !content.trim()) return

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
      .filter(Boolean)

    const htmlContent = content
      .split('\n')
      .filter((p) => p.trim())
      .map((p) => `<p>${p}</p>`)
      .join('')

    onCreateNote(
      {
        title: title.trim() || 'Untitled Note',
        content: htmlContent || '<p></p>',
        colorTheme,
        folderId,
        tags: parsedTags,
      },
      openFullEditor
    )

    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F4EBD5] flex items-center justify-center text-[#42361D]">
            <Plus className="w-4 h-4" />
          </div>
          <span>Quick Note Capture</span>
        </div>
      }
      description="Jot down a thought instantly on a pastel sticky note."
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
            onClick={() => handleSave(true)}
          >
            Open in Full Editor
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={!title.trim() && !content.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this about?"
            autoFocus
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Thoughts &amp; Notes
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your notes here..."
            className="min-h-[110px]"
          />
        </div>

        {/* Pastel Color Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1.5">
            Card Pastel Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PASTEL_COLOR_KEYS.map((key) => {
              const p = PASTEL_PALETTE[key]
              const isSelected = colorTheme === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorTheme(key)}
                  className={cn(
                    'w-7 h-7 rounded-full border transition-transform cursor-pointer',
                    p.bgClass,
                    isSelected
                      ? 'scale-110 border-[#33312F] ring-2 ring-[#33312F]/20'
                      : 'border-black/10 hover:scale-105'
                  )}
                  title={p.name}
                />
              )
            })}
          </div>
        </div>

        {/* Folder and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAE6DF]">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Folder
            </label>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
              className="w-full h-9 px-3 bg-white border border-[#EAE6DF] rounded-[11px] text-xs text-[#33312F] focus:outline-hidden focus:ring-2 focus:ring-[#C8BEDE]"
            >
              <option value="">No folder (Inbox)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Tags (comma separated)
            </label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ideas, focus, sprint"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
