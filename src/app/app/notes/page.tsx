'use client'

import React, { useState, useEffect, useMemo, useRef, useTransition } from 'react'
import {
  Plus,
  Search,
  Grid,
  List,
  Sparkles,
  StickyNote,
  Database,
  ArrowUpDown,
} from 'lucide-react'
import { Note, Folder, NoteFilter, NoteSort, NoteViewMode, NoteCreateInput } from '@/types/notes'
import { PastelColorKey } from '@/lib/constants/colors'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'
import { NoteEditor } from '@/components/modules/notes/note-editor'
import { NotesSidebar } from '@/components/modules/notes/notes-sidebar'
import { NoteCardItem } from '@/components/modules/notes/note-card-item'
import { NoteListRow } from '@/components/modules/notes/note-list-row'
import { QuickNoteModal } from '@/components/modules/notes/quick-note-modal'
import { TemplatePicker } from '@/components/modules/notes/template-picker'
import { NoteTemplate } from '@/lib/notes/templates'
import {
  getLocalNotes,
  saveLocalNotes,
  getLocalFolders,
  saveLocalFolders,
} from '@/lib/notes/storage'
import {
  getNotesData,
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  createFolderAction,
  deleteFolderAction,
} from './actions'
import { cn } from '@/lib/utils/styling'

export default function NotesPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // State
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [currentFilter, setCurrentFilter] = useState<NoteFilter>('all')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<NoteSort>('updated')
  const [viewMode, setViewMode] = useState<NoteViewMode>('grid')

  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false)
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. Initial Load: Fetch from Supabase or fallback to Local Storage
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getNotesData()
        setIsConfigured(res.isConfigured)

        if (res.isAuthenticated) {
          setNotes(res.notes)
          setFolders(res.folders)
        } else {
          // Fallback to local storage (or initial samples)
          setNotes(getLocalNotes())
          setFolders(getLocalFolders())
        }
      } catch (err) {
        console.error('Error loading notes:', err)
        setNotes(getLocalNotes())
        setFolders(getLocalFolders())
      } finally {
        setIsLoaded(true)
      }
    }
    loadData()
  }, [])

  // Sync to local storage whenever notes/folders change in local/offline mode
  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalNotes(notes)
    }
  }, [notes, isLoaded, isConfigured])

  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalFolders(folders)
    }
  }, [folders, isLoaded, isConfigured])

  // Global Keyboard shortcuts: Cmd+N (New Note), Cmd+F (Search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setIsQuickNoteOpen(true)
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Counts Calculation
  const counts = useMemo(() => {
    const nonTrashed = notes.filter((n) => !n.isTrashed)
    return {
      all: nonTrashed.filter((n) => !n.isArchived).length,
      pinned: nonTrashed.filter((n) => !n.isArchived && n.isPinned).length,
      favorites: nonTrashed.filter((n) => !n.isArchived && n.isFavorite).length,
      archived: nonTrashed.filter((n) => n.isArchived).length,
      trash: notes.filter((n) => n.isTrashed).length,
    }
  }, [notes])

  // All distinct tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes
      .filter((n) => !n.isTrashed)
      .forEach((n) => n.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [notes])

  // Filtered and Sorted Notes
  const displayedNotes = useMemo(() => {
    let result = [...notes]

    // 1. Filter
    if (currentFilter === 'trash') {
      result = result.filter((n) => n.isTrashed)
    } else {
      result = result.filter((n) => !n.isTrashed)
      if (currentFilter === 'archived') {
        result = result.filter((n) => n.isArchived)
      } else {
        result = result.filter((n) => !n.isArchived)
        if (currentFilter === 'pinned') {
          result = result.filter((n) => n.isPinned)
        } else if (currentFilter === 'favorites') {
          result = result.filter((n) => n.isFavorite)
        }
      }
    }

    // 2. Folder filter
    if (selectedFolderId) {
      result = result.filter((n) => n.folderId === selectedFolderId)
    }

    // 3. Tag filter
    if (selectedTag) {
      result = result.filter((n) => n.tags?.includes(selectedTag))
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q)) ||
          (n.folderName && n.folderName.toLowerCase().includes(q))
      )
    }

    // 5. Sorting
    result.sort((a, b) => {
      // Pinned notes always surface first in 'all' view
      if (currentFilter === 'all' && !searchQuery.trim() && !selectedFolderId && !selectedTag) {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
      }

      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return result
  }, [notes, currentFilter, selectedFolderId, selectedTag, searchQuery, sortBy])

  // Handlers for Note Operations
  function handleOpenNote(note: Note) {
    setActiveNote(note)
  }

  async function handleSaveNote(updatedFields: Partial<Note>) {
    const updatedNotes = notes.map((n) =>
      n.id === updatedFields.id
        ? {
            ...n,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          }
        : n
    )
    setNotes(updatedNotes)

    if (activeNote && activeNote.id === updatedFields.id) {
      setActiveNote((prev) => (prev ? { ...prev, ...updatedFields } : null))
    }

    if (isConfigured && updatedFields.id) {
      await updateNoteAction(updatedFields.id, {
        title: updatedFields.title,
        content: updatedFields.content,
        contentJson: updatedFields.contentJson,
        colorTheme: updatedFields.colorTheme,
        isPinned: updatedFields.isPinned,
        isFavorite: updatedFields.isFavorite,
        isArchived: updatedFields.isArchived,
        isTrashed: updatedFields.isTrashed,
        tags: updatedFields.tags,
        folderId: updatedFields.folderId,
      })
    }
  }

  function handleCreateNote(input: NoteCreateInput, openFullEditor = false) {
    const newId = `note-${Date.now()}`
    const folder = folders.find((f) => f.id === input.folderId)
    const newNote: Note = {
      id: newId,
      userId: 'default-user',
      title: input.title || 'Untitled Note',
      content: input.content || '',
      contentJson: input.contentJson || null,
      colorTheme: input.colorTheme || 'buttercream',
      isPinned: input.isPinned || false,
      isFavorite: input.isFavorite || false,
      isArchived: false,
      isTrashed: false,
      tags: input.tags || [],
      folderId: input.folderId || null,
      folderName: folder ? folder.name : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes((prev) => [newNote, ...prev])

    if (isConfigured) {
      startTransition(async () => {
        const res = await createNoteAction(input)
        if (res.note) {
          // Replace temporary ID with database ID
          setNotes((prev) =>
            prev.map((n) => (n.id === newId ? { ...res.note!, folderName: folder ? folder.name : null } : n))
          )
        }
      })
    }

    toast({
      title: 'Sticky Note Created',
      description: `Created "${newNote.title}" in pastel ${newNote.colorTheme}.`,
      variant: 'pastel',
    })

    if (openFullEditor) {
      setActiveNote(newNote)
    }
  }

  function handleCreateFromTemplate(template: NoteTemplate) {
    handleCreateNote(
      {
        title: template.defaultTitle,
        content: template.contentHtml,
        colorTheme: template.defaultColor,
        tags: template.defaultTags,
      },
      true
    )
  }

  async function handleTogglePin(id: string) {
    const target = notes.find((n) => n.id === id)
    if (!target) return
    const newPinned = !target.isPinned
    handleSaveNote({ id, isPinned: newPinned })
    toast({
      title: newPinned ? 'Note Pinned to Top' : 'Note Unpinned',
      variant: 'default',
    })
  }

  async function handleToggleFavorite(id: string) {
    const target = notes.find((n) => n.id === id)
    if (!target) return
    const newFav = !target.isFavorite
    handleSaveNote({ id, isFavorite: newFav })
    toast({
      title: newFav ? 'Added to Favorites' : 'Removed from Favorites',
      variant: 'default',
    })
  }

  function handleDuplicateNote(noteToDup: Note) {
    handleCreateNote({
      title: `${noteToDup.title} (Copy)`,
      content: noteToDup.content,
      contentJson: noteToDup.contentJson,
      colorTheme: noteToDup.colorTheme,
      tags: [...noteToDup.tags],
      folderId: noteToDup.folderId,
    })
  }

  function handleChangeColor(id: string, color: PastelColorKey) {
    handleSaveNote({ id, colorTheme: color })
  }

  function handleMoveToFolder(id: string, fId: string | null) {
    const folder = folders.find((f) => f.id === fId)
    handleSaveNote({ id, folderId: fId, folderName: folder ? folder.name : null })
  }

  function handleToggleArchive(id: string) {
    const target = notes.find((n) => n.id === id)
    if (!target) return
    const newArchived = !target.isArchived
    handleSaveNote({ id, isArchived: newArchived })
    toast({
      title: newArchived ? 'Note Archived' : 'Note Unarchived',
      variant: 'default',
    })
  }

  async function handleDeleteNote(id: string, permanent = false) {
    if (permanent) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (activeNote?.id === id) setActiveNote(null)
      if (isConfigured) {
        await deleteNoteAction(id, true)
      }
      toast({
        title: 'Note Deleted Permanently',
        variant: 'error',
      })
    } else {
      handleSaveNote({ id, isTrashed: true })
      if (activeNote?.id === id) setActiveNote(null)
      toast({
        title: 'Moved to Trash',
        description: 'You can restore this note anytime from the Trash view.',
        variant: 'default',
      })
    }
  }

  function handleRestoreNote(id: string) {
    handleSaveNote({ id, isTrashed: false })
    toast({
      title: 'Note Restored from Trash',
      variant: 'success',
    })
  }

  // Folder Operations
  async function handleCreateFolder(name: string) {
    const newId = `folder-${Date.now()}`
    const newFolder: Folder = {
      id: newId,
      userId: 'default-user',
      name,
      color: 'lavender',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setFolders((prev) => [...prev, newFolder])

    if (isConfigured) {
      const res = await createFolderAction(name)
      if (res.folder) {
        setFolders((prev) => prev.map((f) => (f.id === newId ? res.folder! : f)))
      }
    }

    toast({
      title: 'Folder Created',
      description: `Folder "${name}" is ready.`,
      variant: 'pastel',
    })
  }

  async function handleRenameFolder(folderId: string, newName: string) {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    )
    toast({
      title: 'Folder Renamed',
      variant: 'default',
    })
  }

  async function handleDeleteFolder(folderId: string) {
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    setNotes((prev) =>
      prev.map((n) => (n.folderId === folderId ? { ...n, folderId: null, folderName: null } : n))
    )
    if (selectedFolderId === folderId) setSelectedFolderId(null)

    if (isConfigured) {
      await deleteFolderAction(folderId, true)
    }

    toast({
      title: 'Folder Deleted',
      description: 'Notes have been moved to your Inbox.',
      variant: 'default',
    })
  }

  // New Note dropdown items
  const newNoteMenuItems: DropdownMenuItem[] = [
    {
      id: 'blank',
      label: 'Blank Sticky Note',
      icon: <StickyNote className="w-4 h-4 text-[#B58525]" />,
      shortcut: '⌘N',
      onClick: () => setIsQuickNoteOpen(true),
    },
    {
      id: 'template',
      label: 'From Template...',
      icon: <Sparkles className="w-4 h-4 text-[#5B3E8C]" />,
      onClick: () => setIsTemplatePickerOpen(true),
    },
  ]

  // Sort dropdown items
  const sortMenuItems: DropdownMenuItem[] = [
    {
      id: 'sort-updated',
      label: 'Recently Updated',
      onClick: () => setSortBy('updated'),
    },
    {
      id: 'sort-created',
      label: 'Recently Created',
      onClick: () => setSortBy('created'),
    },
    {
      id: 'sort-title',
      label: 'Alphabetical (A–Z)',
      onClick: () => setSortBy('title'),
    },
  ]

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Configuration Status Notice */}
      {!isConfigured && (
        <div className="p-3.5 rounded-[16px] bg-[#F4EBD5] border border-[#E7DCBE] text-xs text-[#42361D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#B58525] shrink-0" />
            <div>
              <span className="font-bold">Local Workspace Active</span> &bull;{' '}
              <span>
                Notes and folders are autosaving locally in your browser. Add your Supabase credentials to{' '}
                <code className="bg-[#FAF9F6] px-1 py-0.5 rounded text-[11px]">.env.local</code> to enable multi-tenant cloud PostgreSQL sync.
              </span>
            </div>
          </div>
          <PastelBadge variant="buttercream" size="sm" className="shrink-0">
            Offline &bull; Ready
          </PastelBadge>
        </div>
      )}

      {/* Main Content Area */}
      {activeNote ? (
        /* Full TipTap Rich Text Note Editor View */
        <NoteEditor
          note={activeNote}
          folders={folders}
          isConfigured={isConfigured}
          onSave={handleSaveNote}
          onClose={() => setActiveNote(null)}
        />
      ) : (
        /* Notes Board & Organization Layout */
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Sidebar: Organization Panel */}
          <div className="w-full lg:w-56 shrink-0 bg-white border border-[#EAE6DF] rounded-[20px] p-4 shadow-xs">
            <NotesSidebar
              currentFilter={currentFilter}
              selectedFolderId={selectedFolderId}
              selectedTag={selectedTag}
              folders={folders}
              allTags={allTags}
              counts={counts}
              onSelectFilter={setCurrentFilter}
              onSelectFolder={setSelectedFolderId}
              onSelectTag={setSelectedTag}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>

          {/* Right Area: Header, Controls & Sticky Cards Grid/List */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Notes View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#33312F]">
                    {selectedFolderId
                      ? folders.find((f) => f.id === selectedFolderId)?.name || 'Folder'
                      : selectedTag
                      ? `#${selectedTag}`
                      : currentFilter === 'all'
                      ? 'My Notes'
                      : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#F5F2EB] text-xs font-semibold text-[#85817D] border border-[#EAE6DF]">
                    {displayedNotes.length}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#85817D] mt-1">
                  Your thoughts, ideas, and knowledge in one harmonious desk.
                </p>
              </div>

              {/* Action Buttons: New Note & View Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                {/* View Switcher */}
                <div className="flex items-center border border-[#EAE6DF] rounded-[11px] bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded-[8px] transition-colors cursor-pointer',
                      viewMode === 'grid'
                        ? 'bg-[#F5F2EB] text-[#33312F]'
                        : 'text-[#85817D] hover:text-[#33312F]'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-[8px] transition-colors cursor-pointer',
                      viewMode === 'list'
                        ? 'bg-[#F5F2EB] text-[#33312F]'
                        : 'text-[#85817D] hover:text-[#33312F]'
                    )}
                    aria-label="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="h-9 px-2.5 rounded-[11px] bg-white border border-[#EAE6DF] text-xs font-medium text-[#85817D] hover:text-[#33312F] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sort</span>
                    </button>
                  }
                  items={sortMenuItems}
                  align="right"
                />

                {/* New Note Button with Dropdown */}
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="h-9 px-3.5 rounded-[11px] bg-[#33312F] text-[#FAF9F6] text-xs font-semibold hover:bg-[#1F1E1D] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Note</span>
                    </button>
                  }
                  items={newNoteMenuItems}
                  align="right"
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note titles, content, tags, or folders... (⌘F)"
                className="w-full h-10 pl-10 pr-4 bg-white border border-[#EAE6DF] rounded-[12px] text-xs sm:text-sm text-[#33312F] placeholder-[#AFAAA4] focus:outline-hidden focus:border-[#C8BEDE] focus:ring-2 focus:ring-[#E8E1F4] transition-all"
              />
              <Search className="w-4 h-4 text-[#85817D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#85817D] hover:text-[#33312F] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Notes Display */}
            {displayedNotes.length === 0 ? (
              <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-10 text-center shadow-xs">
                <EmptyState
                  color="buttercream"
                  icon={<StickyNote className="w-6 h-6 text-[#42361D]" />}
                  title={
                    searchQuery
                      ? 'No notes match your search'
                      : currentFilter === 'trash'
                      ? 'Trash is empty'
                      : currentFilter === 'favorites'
                      ? 'No favorite notes yet'
                      : 'No notes here yet'
                  }
                  description={
                    searchQuery
                      ? `We couldn't find any note matching "${searchQuery}". Try a different keyword.`
                      : 'Capture an idea, draft a meeting note, or write down a thought.'
                  }
                  action={
                    currentFilter !== 'trash' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => setIsQuickNoteOpen(true)}
                      >
                        Create Your First Note
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : viewMode === 'grid' ? (
              /* Pastel Sticky Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayedNotes.map((note) => (
                  <NoteCardItem
                    key={note.id}
                    note={note}
                    folders={folders}
                    onOpen={handleOpenNote}
                    onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicateNote}
                    onChangeColor={handleChangeColor}
                    onMoveToFolder={handleMoveToFolder}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteNote}
                    onRestore={handleRestoreNote}
                  />
                ))}
              </div>
            ) : (
              /* Compact List View */
              <div className="space-y-2">
                {displayedNotes.map((note) => (
                  <NoteListRow
                    key={note.id}
                    note={note}
                    folders={folders}
                    onOpen={handleOpenNote}
                    onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicateNote}
                    onChangeColor={handleChangeColor}
                    onMoveToFolder={handleMoveToFolder}
                    onToggleArchive={handleToggleArchive}
                    onDelete={handleDeleteNote}
                    onRestore={handleRestoreNote}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        folders={folders}
        onCreateNote={handleCreateNote}
      />

      {/* Template Picker Modal */}
      <TemplatePicker
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelectTemplate={handleCreateFromTemplate}
      />
    </div>
  )
}
