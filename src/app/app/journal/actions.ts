'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import {
  JournalEntry,
  JournalEntryCreateInput,
  JournalEntryUpdateInput,
  MoodLog,
  MoodLogInput,
  JournalFilter,
  JournalSort,
  MoodLevel,
} from '@/types/journal'
import { Database, Json } from '@/types/database'

export interface JournalQueryResult {
  entries: JournalEntry[]
  moodLogs: MoodLog[]
  isConfigured: boolean
  error?: string
}

export async function getJournalData(options?: {
  filter?: JournalFilter
  mood?: MoodLevel
  favoriteOnly?: boolean
  sortBy?: JournalSort
}): Promise<JournalQueryResult> {
  if (!isSupabaseConfigured()) {
    return { entries: [], moodLogs: [], isConfigured: false }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { entries: [], moodLogs: [], isConfigured: true, error: 'Unauthorized' }
    }

    // 1. Fetch Journal Entries
    let query = supabase.from('journal_entries').select('*').eq('user_id', user.id)

    if (options?.favoriteOnly) {
      query = query.eq('is_favorite', true)
    }

    if (options?.mood) {
      query = query.eq('mood', options.mood)
    }

    const sort = options?.sortBy || 'newest'
    if (sort === 'newest') {
      query = query.order('entry_date', { ascending: false }).order('created_at', { ascending: false })
    } else if (sort === 'oldest') {
      query = query.order('entry_date', { ascending: true }).order('created_at', { ascending: true })
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true })
    }

    const { data: entryData, error: entryError } = await query

    if (entryError) {
      return { entries: [], moodLogs: [], isConfigured: true, error: entryError.message }
    }

    const entries: JournalEntry[] = (entryData || []).map((e) => ({
      id: e.id,
      userId: e.user_id,
      entryDate: e.entry_date,
      title: e.title || 'Untitled Reflection',
      content: e.content,
      contentJson: e.content_json as Record<string, unknown> | null,
      moodLevel: (e.mood as MoodLevel) || null,
      emotions: e.emotions || [],
      tags: e.tags || [],
      isFavorite: e.is_favorite ?? false,
      colorTheme: (e.color_theme as JournalEntry['colorTheme']) || 'peach',
      templateId: e.template_id,
      linkedNoteIds: e.linked_note_ids || [],
      gratitudeItems: e.gratitude_items || [],
      promptQuestion: e.prompt_question,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }))

    // 2. Fetch Mood Logs
    const { data: moodData, error: moodError } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })

    if (moodError) {
      console.error('Error loading mood logs:', moodError.message)
    }

    const moodLogs: MoodLog[] = (moodData || []).map((m) => ({
      id: m.id,
      userId: m.user_id,
      logDate: m.log_date,
      moodScore: m.mood_score as MoodLog['moodScore'],
      moodLevel: m.mood_level as MoodLevel,
      emotions: m.emotions || [],
      note: m.note,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }))

    return { entries, moodLogs, isConfigured: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { entries: [], moodLogs: [], isConfigured: true, error: message }
  }
}

export async function createJournalEntryAction(
  input: JournalEntryCreateInput
): Promise<{ entry?: JournalEntry; error?: string }> {
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

  const todayStr = new Date().toISOString().split('T')[0]
  const entryDate = input.entryDate || todayStr

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      entry_date: entryDate,
      title: input.title.trim(),
      content: input.content || '',
      content_json: (input.contentJson as Json) || null,
      mood: input.moodLevel || null,
      emotions: input.emotions || [],
      tags: input.tags || [],
      is_favorite: Boolean(input.isFavorite),
      color_theme: input.colorTheme || 'peach',
      template_id: input.templateId || null,
      linked_note_ids: input.linkedNoteIds || [],
      gratitude_items: input.gratitudeItems || [],
      prompt_question: input.promptQuestion || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/journal')
  revalidatePath('/app')

  return {
    entry: {
      id: data.id,
      userId: data.user_id,
      entryDate: data.entry_date,
      title: data.title || 'Untitled Reflection',
      content: data.content,
      contentJson: data.content_json as Record<string, unknown> | null,
      moodLevel: (data.mood as MoodLevel) || null,
      emotions: data.emotions || [],
      tags: data.tags || [],
      isFavorite: data.is_favorite ?? false,
      colorTheme: (data.color_theme as JournalEntry['colorTheme']) || 'peach',
      templateId: data.template_id,
      linkedNoteIds: data.linked_note_ids || [],
      gratitudeItems: data.gratitude_items || [],
      promptQuestion: data.prompt_question,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function updateJournalEntryAction(
  id: string,
  input: JournalEntryUpdateInput
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

  const updates: Database['public']['Tables']['journal_entries']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (input.entryDate !== undefined) updates.entry_date = input.entryDate
  if (input.title !== undefined) updates.title = input.title.trim()
  if (input.content !== undefined) updates.content = input.content
  if (input.contentJson !== undefined) updates.content_json = input.contentJson as Json
  if (input.moodLevel !== undefined) updates.mood = input.moodLevel
  if (input.emotions !== undefined) updates.emotions = input.emotions
  if (input.tags !== undefined) updates.tags = input.tags
  if (input.isFavorite !== undefined) updates.is_favorite = input.isFavorite
  if (input.colorTheme !== undefined) updates.color_theme = input.colorTheme
  if (input.templateId !== undefined) updates.template_id = input.templateId
  if (input.linkedNoteIds !== undefined) updates.linked_note_ids = input.linkedNoteIds
  if (input.gratitudeItems !== undefined) updates.gratitude_items = input.gratitudeItems
  if (input.promptQuestion !== undefined) updates.prompt_question = input.promptQuestion

  const { error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/journal')
  revalidatePath('/app')
  return { success: true }
}

export async function deleteJournalEntryAction(id: string): Promise<{ success: boolean; error?: string }> {
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

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/journal')
  revalidatePath('/app')
  return { success: true }
}

export async function toggleFavoriteJournalAction(
  id: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateJournalEntryAction(id, { isFavorite })
}

export async function logMoodAction(
  input: MoodLogInput
): Promise<{ moodLog?: MoodLog; error?: string }> {
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
    .from('mood_logs')
    .upsert(
      {
        user_id: user.id,
        log_date: input.logDate,
        mood_score: input.moodScore,
        mood_level: input.moodLevel,
        emotions: input.emotions || [],
        note: input.note || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/journal')
  revalidatePath('/app')

  return {
    moodLog: {
      id: data.id,
      userId: data.user_id,
      logDate: data.log_date,
      moodScore: data.mood_score as MoodLog['moodScore'],
      moodLevel: data.mood_level as MoodLevel,
      emotions: data.emotions || [],
      note: data.note,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

