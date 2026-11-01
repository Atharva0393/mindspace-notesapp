'use client'

import React from 'react'
import { Pin, Star, MoreVertical, Folder as FolderIcon } from 'lucide-react'
import { Note, Folder } from '@/types/notes'
import { PASTEL_PALETTE, PastelColorKey } from '@/lib/constants/colors'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export interface NoteListRowProps {
  note: Note
  folders: Folder[]
  onOpen: (note: Note) => void
  onTogglePin: (id: string) => void
  onToggleFavorite: (id: string) => void
  onDuplicate: (note: Note) => void
  onChangeColor: (id: string, color: PastelColorKey) => void
  onMoveToFolder: (id: string, folderId: string | null) => void
  onToggleArchive: (id: string) => void
  onDelete: (id: string, permanent?: boolean) => void
  onRestore?: (id: string) => void
}

export function NoteListRow({
  note,
  onOpen,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onToggleArchive,
  onDelete,
  onRestore,
}: NoteListRowProps) {
  const palette = PASTEL_PALETTE[note.colorTheme] || PASTEL_PALETTE.ivory

  const snippet = React.useMemo(() => {
    if (!note.content) return ''
    return note.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }, [note.content])

  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(note.updatedAt))
  }, [note.updatedAt])

  const menuItems: (DropdownMenuItem | 'divider')[] = note.isTrashed
    ? [
        {
          id: 'restore',
          label: 'Restore',
          onClick: () => onRestore && onRestore(note.id),
        },
        'divider',
        {
          id: 'delete',
          label: 'Delete Permanently',
          destructive: true,
          onClick: () => onDelete(note.id, true),
        },
      ]
    : [
        {
          id: 'pin',
          label: note.isPinned ? 'Unpin' : 'Pin',
          onClick: () => onTogglePin(note.id),
        },
        {
          id: 'fav',
          label: note.isFavorite ? 'Unfavorite' : 'Favorite',
          onClick: () => onToggleFavorite(note.id),
        },
        {
          id: 'dup',
          label: 'Duplicate',
          onClick: () => onDuplicate(note),
        },
        'divider',
        {
          id: 'archive',
          label: note.isArchived ? 'Unarchive' : 'Archive',
          onClick: () => onToggleArchive(note.id),
        },
        {
          id: 'trash',
          label: 'Move to Trash',
          destructive: true,
          onClick: () => onDelete(note.id, false),
        },
      ]

  return (
    <div
      onClick={() => onOpen(note)}
      className="group flex items-center justify-between p-3.5 bg-white border border-[#EAE6DF] hover:border-[#D0DEC8] rounded-[14px] transition-all cursor-pointer paper-shadow hover:paper-shadow-md select-none"
    >
      {/* Left: Color dot, title & snippet */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        <span
          className="w-3 h-3 rounded-full shrink-0 border border-black/10"
          style={{ backgroundColor: palette.hex }}
        />

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-[#33312F] truncate">
            {note.title || 'Untitled Note'}
          </span>

          {note.isPinned && (
            <Pin className="w-3 h-3 text-[#B58525] fill-[#B58525]/30 shrink-0" />
          )}
          {note.isFavorite && (
            <Star className="w-3 h-3 text-[#E5B54F] fill-[#E5B54F] shrink-0" />
          )}

          <span className="hidden md:inline text-xs text-[#85817D] truncate max-w-sm">
            — {snippet}
          </span>
        </div>
      </div>

      {/* Right: Folder, Tags, Date, Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {note.folderName && (
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-[#706E6B] font-medium bg-[#F5F2EB] px-2 py-0.5 rounded-[5px]">
            <FolderIcon className="w-2.5 h-2.5" />
            <span className="truncate max-w-[90px]">{note.folderName}</span>
          </span>
        )}

        <span className="text-[11px] text-[#85817D] min-w-[50px] text-right">
          {formattedDate}
        </span>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-1 rounded-[6px] hover:bg-[#F5F2EB] text-[#85817D] hover:text-[#33312F] cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>
    </div>
  )
}
