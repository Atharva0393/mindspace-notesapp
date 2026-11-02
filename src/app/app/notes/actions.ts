'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Note, Folder, NoteFilter, NoteSort, NoteCreateInput, NoteUpdateInput } from '@/types/notes'
import { Database, Json } from '@/types/database'

export interface NotesQueryResult {
  notes: Note[]
  folders: Folder[]
  allTags: string[]
  isConfigured: boolean
  isAuthenticated: boolean
  error?: string
}

export async function getNotesData(options?: {
  filter?: NoteFilter
  folderId?: string | null
  tag?: string | null
  search?: string | null
  sortBy?: NoteSort
}): Promise<NotesQueryResult> {
  const configured = isSupabaseConfigured()
  if (!configured) {
    return {
      notes: [],
      folders: [],
      allTags: [],
      isConfigured: false,
      isAuthenticated: false,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        notes: [],
        folders: [],
        allTags: [],
        isConfigured: true,
        isAuthenticated: false,
        error: 'Not authenticated',
      }
    }

    // 1. Fetch Folders
    const { data: folderData, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (folderError) {
      console.error('Error fetching folders:', folderError.message)
    }

    const folders: Folder[] = (folderData || []).map((f) => ({
      id: f.id,
      userId: f.user_id,
      name: f.name,
      color: (f.color as Folder['color']) || 'lavender',
      icon: f.icon,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }))

    // 2. Build Query for Notes
    let query = supabase.from('notes').select('*').eq('user_id', user.id)

    const filter = options?.filter || 'all'
    if (filter === 'trash') {
      query = query.eq('is_trashed', true)
    } else {
      query = query.eq('is_trashed', false)
      if (filter === 'archived') {
        query = query.eq('is_archived', true)
      } else {
        query = query.eq('is_archived', false)
        if (filter === 'pinned') {
          query = query.eq('is_pinned', true)
        } else if (filter === 'favorites') {
          query = query.eq('is_favorite', true)
        }
      }
    }

    if (options?.folderId) {
      query = query.eq('folder_id', options.folderId)
    }

    if (options?.tag) {
      query = query.contains('tags', [options.tag])
    }

    if (options?.search && options.search.trim()) {
      const s = options.search.trim()
      query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`)
    }

    const sortBy = options?.sortBy || 'updated'
    if (sortBy === 'created') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'title') {
      query = query.order('title', { ascending: true })
    } else {
      // Default: pinned first, then recently updated
      query = query.order('is_pinned', { ascending: false }).order('updated_at', { ascending: false })
    }

    const { data: noteData, error: noteError } = await query

    if (noteError) {
      console.error('Error fetching notes:', noteError.message)
      return {
        notes: [],
        folders,
        allTags: [],
        isConfigured: true,
        isAuthenticated: true,
        error: noteError.message,
      }
    }

    const folderMap = new Map(folders.map((f) => [f.id, f.name]))
    const allTagsSet = new Set<string>()

    const notes: Note[] = (noteData || []).map((n) => {
      (n.tags || []).forEach((t: string) => allTagsSet.add(t))
      return {
        id: n.id,
        userId: n.user_id,
        title: n.title,
        content: n.content,
        contentJson: (n.content_json as Record<string, unknown>) || null,
        colorTheme: (n.color_theme as Note['colorTheme']) || 'ivory',
        isPinned: n.is_pinned,
        isFavorite: n.is_favorite ?? false,
        isArchived: n.is_archived ?? false,
        isTrashed: n.is_trashed ?? false,
        tags: n.tags || [],
        folderId: n.folder_id,
        folderName: n.folder_id ? folderMap.get(n.folder_id) ?? null : null,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }
    })

    return {
      notes,
      folders,
      allTags: Array.from(allTagsSet).sort(),
      isConfigured: true,
      isAuthenticated: true,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      notes: [],
      folders: [],
      allTags: [],
      isConfigured: true,
      isAuthenticated: false,
      error: message,
    }
  }
}

export async function createNoteAction(input: NoteCreateInput): Promise<{ note?: Note; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase credentials are not configured in environment variables.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create notes.' }
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input.title || 'Untitled Note',
      content: input.content || '',
      content_json: (input.contentJson as Json) ?? null,
      color_theme: input.colorTheme || 'buttercream',
      is_pinned: input.isPinned ?? false,
      is_favorite: input.isFavorite ?? false,
      tags: input.tags || [],
      folder_id: input.folderId || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/notes')
  return {
    note: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      contentJson: (data.content_json as Record<string, unknown>) || null,
      colorTheme: (data.color_theme as Note['colorTheme']) || 'ivory',
      isPinned: data.is_pinned,
      isFavorite: data.is_favorite ?? false,
      isArchived: data.is_archived ?? false,
      isTrashed: data.is_trashed ?? false,
      tags: data.tags || [],
      folderId: data.folder_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function updateNoteAction(
  id: string,
  input: NoteUpdateInput
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const updates: Database['public']['Tables']['notes']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updates.title = input.title
  if (input.content !== undefined) updates.content = input.content
  if (input.contentJson !== undefined) updates.content_json = input.contentJson as Json
  if (input.colorTheme !== undefined) updates.color_theme = input.colorTheme
  if (input.isPinned !== undefined) updates.is_pinned = input.isPinned
  if (input.isFavorite !== undefined) updates.is_favorite = input.isFavorite
  if (input.isArchived !== undefined) updates.is_archived = input.isArchived
  if (input.isTrashed !== undefined) updates.is_trashed = input.isTrashed
  if (input.tags !== undefined) updates.tags = input.tags
  if (input.folderId !== undefined) updates.folder_id = input.folderId

  const { error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/notes')
  return { success: true }
}

export async function deleteNoteAction(
  id: string,
  permanent = false
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (permanent) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
  } else {
    // Soft delete -> move to trash
    const { error } = await supabase
      .from('notes')
      .update({ is_trashed: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/app/notes')
  return { success: true }
}

export async function createFolderAction(
  name: string,
  color = 'lavender'
): Promise<{ folder?: Folder; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase not configured' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: user.id,
      name: name.trim(),
      color,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/notes')
  return {
    folder: {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      color: (data.color as Folder['color']) || 'lavender',
      icon: data.icon,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function deleteFolderAction(
  folderId: string,
  moveNotesToDefault = true
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (moveNotesToDefault) {
    await supabase
      .from('notes')
      .update({ folder_id: null })
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/notes')
  return { success: true }
}
