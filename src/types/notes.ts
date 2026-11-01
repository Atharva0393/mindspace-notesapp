import { PastelColorKey } from '@/lib/constants/colors'

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  contentJson?: Record<string, unknown> | null
  colorTheme: PastelColorKey
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  isTrashed: boolean
  tags: string[]
  folderId?: string | null
  folderName?: string | null
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  userId: string
  name: string
  color: PastelColorKey
  icon?: string | null
  noteCount?: number
  createdAt: string
  updatedAt: string
}

export type NoteFilter =
  | 'all'
  | 'pinned'
  | 'favorites'
  | 'recent'
  | 'archived'
  | 'trash'

export type NoteSort = 'updated' | 'created' | 'title'
export type NoteViewMode = 'grid' | 'list'

export interface NoteCreateInput {
  title?: string
  content?: string
  contentJson?: Record<string, unknown> | null
  colorTheme?: PastelColorKey
  isPinned?: boolean
  isFavorite?: boolean
  tags?: string[]
  folderId?: string | null
}

export interface NoteUpdateInput {
  title?: string
  content?: string
  contentJson?: Record<string, unknown> | null
  colorTheme?: PastelColorKey
  isPinned?: boolean
  isFavorite?: boolean
  isArchived?: boolean
  isTrashed?: boolean
  tags?: string[]
  folderId?: string | null
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'
