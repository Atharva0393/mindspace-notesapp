'use client'

import React, { useState } from 'react'
import {
  FileText,
  Pin,
  Star,
  Clock,
  Archive,
  Trash2,
  Folder as FolderIcon,
  Plus,
  MoreVertical,
  Edit2,
} from 'lucide-react'
import { NoteFilter, Folder } from '@/types/notes'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/styling'

export interface NotesSidebarProps {
  currentFilter: NoteFilter
  selectedFolderId: string | null
  selectedTag: string | null
  folders: Folder[]
  allTags: string[]
  counts: {
    all: number
    pinned: number
    favorites: number
    archived: number
    trash: number
  }
  onSelectFilter: (filter: NoteFilter) => void
  onSelectFolder: (folderId: string | null) => void
  onSelectTag: (tag: string | null) => void
  onCreateFolder: (name: string) => Promise<void>
  onRenameFolder: (folderId: string, newName: string) => Promise<void>
  onDeleteFolder: (folderId: string) => Promise<void>
  className?: string
}

export function NotesSidebar({
  currentFilter,
  selectedFolderId,
  selectedTag,
  folders,
  allTags,
  counts,
  onSelectFilter,
  onSelectFolder,
  onSelectTag,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  className,
}: NotesSidebarProps) {
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)

  const navFilters: { id: NoteFilter; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'all',
      label: 'All Notes',
      icon: <FileText className="w-4 h-4 text-[#85817D]" />,
      count: counts.all,
    },
    {
      id: 'pinned',
      label: 'Pinned Notes',
      icon: <Pin className="w-4 h-4 text-[#B58525]" />,
      count: counts.pinned,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Star className="w-4 h-4 text-[#E5B54F]" />,
      count: counts.favorites,
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: <Clock className="w-4 h-4 text-[#213545]" />,
    },
    {
      id: 'archived',
      label: 'Archived',
      icon: <Archive className="w-4 h-4 text-[#85817D]" />,
      count: counts.archived,
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: <Trash2 className="w-4 h-4 text-[#A8382B]" />,
      count: counts.trash,
    },
  ]

  async function handleCreateFolderSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newFolderName.trim()) return
    await onCreateFolder(newFolderName.trim())
    setNewFolderName('')
    setIsNewFolderOpen(false)
  }

  async function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!folderToRename || !renameValue.trim()) return
    await onRenameFolder(folderToRename.id, renameValue.trim())
    setFolderToRename(null)
    setRenameValue('')
  }

  async function handleDeleteConfirm() {
    if (!folderToDelete) return
    await onDeleteFolder(folderToDelete.id)
    setFolderToDelete(null)
  }

  return (
    <div className={cn('w-full flex flex-col gap-6 select-none', className)}>
      {/* Navigation Filter Links */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#85817D] px-2 mb-2 block">
          Views
        </span>
        {navFilters.map((f) => {
          const isActive = currentFilter === f.id && !selectedFolderId && !selectedTag
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                onSelectFolder(null)
                onSelectTag(null)
                onSelectFilter(f.id)
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-colors text-left cursor-pointer',
                isActive
                  ? 'bg-white border border-[#EAE6DF] text-[#33312F] shadow-2xs font-semibold'
                  : 'text-[#5C5956] hover:bg-[#F5F2EB] hover:text-[#33312F]'
              )}
            >
              <div className="flex items-center gap-2.5">
                {f.icon}
                <span>{f.label}</span>
              </div>
              {f.count !== undefined && f.count > 0 && (
                <span className="text-[10px] text-[#85817D] font-normal px-1.5 py-0.2 rounded-md bg-black/[0.04]">
                  {f.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Folders Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#85817D]">
            Folders
          </span>
          <button
            type="button"
            onClick={() => setIsNewFolderOpen(true)}
            className="p-1 rounded-[6px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
            title="Create new folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {folders.length === 0 ? (
          <p className="text-xs text-[#85817D] px-2 py-1">No folders yet</p>
        ) : (
          folders.map((folder) => {
            const isFolderActive = selectedFolderId === folder.id
            const folderMenuItems: DropdownMenuItem[] = [
              {
                id: 'rename',
                label: 'Rename Folder',
                icon: <Edit2 className="w-3.5 h-3.5 text-[#85817D]" />,
                onClick: () => {
                  setFolderToRename(folder)
                  setRenameValue(folder.name)
                },
              },
              {
                id: 'delete',
                label: 'Delete Folder',
                icon: <Trash2 className="w-3.5 h-3.5 text-[#A8382B]" />,
                destructive: true,
                onClick: () => setFolderToDelete(folder),
              },
            ]

            return (
              <div
                key={folder.id}
                className={cn(
                  'group flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-colors text-left cursor-pointer',
                  isFolderActive
                    ? 'bg-white border border-[#EAE6DF] text-[#33312F] shadow-2xs font-semibold'
                    : 'text-[#5C5956] hover:bg-[#F5F2EB] hover:text-[#33312F]'
                )}
                onClick={() => {
                  onSelectTag(null)
                  onSelectFolder(folder.id)
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderIcon className="w-3.5 h-3.5 text-[#85817D] shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu
                    trigger={
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-0.5 rounded text-[#85817D] hover:text-[#33312F] cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </div>
                    }
                    items={folderMenuItems}
                    align="right"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tags Section */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#85817D]">
              Tags
            </span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className="text-[10px] text-[#A8382B] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 px-1">
            {allTags.map((tag) => {
              const isTagActive = selectedTag === tag
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSelectFolder(null)
                    onSelectTag(isTagActive ? null : tag)
                  }}
                  className={cn(
                    'px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition-all border cursor-pointer select-none',
                    isTagActive
                      ? 'bg-[#33312F] text-white border-[#33312F] shadow-xs'
                      : 'bg-white border-[#EAE6DF] text-[#5C5956] hover:border-[#C8BEDE] hover:text-[#33312F]'
                  )}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      <Modal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        title="Create New Folder"
        description="Organize your notes into themed collections."
        footer={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewFolderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateFolderSubmit}
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateFolderSubmit}>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Folder Name
          </label>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="e.g. Work Projects, Book Notes"
            autoFocus
          />
        </form>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal
        isOpen={Boolean(folderToRename)}
        onClose={() => setFolderToRename(null)}
        title="Rename Folder"
        footer={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFolderToRename(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleRenameSubmit}
              disabled={!renameValue.trim()}
            >
              Save Name
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRenameSubmit}>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            New Name
          </label>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
          />
        </form>
      </Modal>

      {/* Delete Folder Modal */}
      <Modal
        isOpen={Boolean(folderToDelete)}
        onClose={() => setFolderToDelete(null)}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folderToDelete?.name}"? Any notes inside will be safely kept and moved to your Inbox.`}
        footer={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFolderToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              Delete Folder
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#85817D]">
          This action will only remove the folder organization, not your note content.
        </p>
      </Modal>
    </div>
  )
}
