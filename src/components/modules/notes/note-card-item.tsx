'use client'

import React from 'react'
import {
  Pin,
  Star,
  Copy,
  Archive,
  Trash2,
  Folder as FolderIcon,
  MoreVertical,
  RotateCcw,
} from 'lucide-react'
import { Note, Folder } from '@/types/notes'
import { StickyCard } from '@/components/ui/sticky-card'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { PASTEL_PALETTE, PastelColorKey, PASTEL_COLOR_KEYS } from '@/lib/constants/colors'

export interface NoteCardItemProps {
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

export function NoteCardItem({
  note,
  folders,
  onOpen,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onChangeColor,
  onMoveToFolder,
  onToggleArchive,
  onDelete,
  onRestore,
}: NoteCardItemProps) {
  // Strip HTML for clean snippet preview
  const snippet = React.useMemo(() => {
    if (!note.content) return 'Empty note'
    return note.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
  }, [note.content])

  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(note.updatedAt))
  }, [note.updatedAt])

  // Context Menu items
  const menuItems: (DropdownMenuItem | 'divider')[] = note.isTrashed
    ? [
        {
          id: 'restore',
          label: 'Restore Note',
          icon: <RotateCcw className="w-3.5 h-3.5 text-[#3D7535]" />,
          onClick: () => onRestore && onRestore(note.id),
        },
        'divider',
        {
          id: 'perm-delete',
          label: 'Delete Permanently',
          icon: <Trash2 className="w-3.5 h-3.5 text-[#A8382B]" />,
          destructive: true,
          onClick: () => onDelete(note.id, true),
        },
      ]
    : [
        {
          id: 'pin',
          label: note.isPinned ? 'Unpin Note' : 'Pin Note',
          icon: <Pin className="w-3.5 h-3.5 text-[#85817D]" />,
          onClick: () => onTogglePin(note.id),
        },
        {
          id: 'favorite',
          label: note.isFavorite ? 'Remove Favorite' : 'Mark Favorite',
          icon: <Star className="w-3.5 h-3.5 text-[#E5B54F]" />,
          onClick: () => onToggleFavorite(note.id),
        },
        {
          id: 'duplicate',
          label: 'Duplicate Note',
          icon: <Copy className="w-3.5 h-3.5 text-[#85817D]" />,
          onClick: () => onDuplicate(note),
        },
        'divider',
        ...PASTEL_COLOR_KEYS.slice(0, 4).map((k) => ({
          id: `color-${k}`,
          label: `Color: ${PASTEL_PALETTE[k].name}`,
          icon: (
            <span
              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: PASTEL_PALETTE[k].hex }}
            />
          ),
          onClick: () => onChangeColor(note.id, k),
        })),
        'divider',
        ...folders.slice(0, 3).map((f) => ({
          id: `move-to-${f.id}`,
          label: `Move to: ${f.name}`,
          icon: <FolderIcon className="w-3.5 h-3.5 text-[#85817D]" />,
          onClick: () => onMoveToFolder(note.id, f.id),
        })),
        'divider',
        {
          id: 'archive',
          label: note.isArchived ? 'Unarchive' : 'Archive Note',
          icon: <Archive className="w-3.5 h-3.5 text-[#85817D]" />,
          onClick: () => onToggleArchive(note.id),
        },
        {
          id: 'delete',
          label: 'Move to Trash',
          icon: <Trash2 className="w-3.5 h-3.5 text-[#A8382B]" />,
          destructive: true,
          onClick: () => onDelete(note.id, false),
        },
      ]

  return (
    <StickyCard
      color={note.colorTheme}
      isPinned={note.isPinned}
      onClick={() => onOpen(note)}
      className="h-[210px] group flex flex-col justify-between"
      headerAction={
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {note.isFavorite && (
            <Star className="w-3.5 h-3.5 text-[#E5B54F] fill-[#E5B54F] shrink-0 mr-1" />
          )}

          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-1 rounded-[6px] hover:bg-black/5 text-[#85817D] hover:text-[#33312F] transition-colors cursor-pointer"
                aria-label="Note options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      }
      title={note.title || 'Untitled Note'}
      date={formattedDate}
      tags={note.tags}
      footerAction={
        note.folderName ? (
          <span className="flex items-center gap-1 text-[10px] text-[#706E6B] font-medium bg-black/[0.04] px-1.5 py-0.5 rounded-[5px]">
            <FolderIcon className="w-2.5 h-2.5" />
            <span className="truncate max-w-[80px]">{note.folderName}</span>
          </span>
        ) : null
      }
    >
      <p className="text-xs text-[#524E4A] line-clamp-3 leading-relaxed mt-1">
        {snippet}
      </p>
    </StickyCard>
  )
}
