'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Habit, HabitLog, HabitCreateInput, HabitUpdateInput, HabitLogStatus } from '@/types/habits'
import { Database } from '@/types/database'

export interface HabitsQueryResult {
  habits: Habit[]
  logs: HabitLog[]
  isConfigured: boolean
  error?: string
}

export async function getHabitsData(): Promise<HabitsQueryResult> {
  if (!isSupabaseConfigured()) {
    return { habits: [], logs: [], isConfigured: false }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { habits: [], logs: [], isConfigured: true, error: 'Unauthorized' }
    }

    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })

    if (habitsError) {
      return { habits: [], logs: [], isConfigured: true, error: habitsError.message }
    }

    const { data: logsData, error: logsError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)

    if (logsError) {
      console.error('Error fetching habit logs:', logsError.message)
    }

    const logs: HabitLog[] = (logsData || []).map((l) => ({
      id: l.id,
      userId: l.user_id,
      habitId: l.habit_id,
      logDate: l.log_date,
      status: (l.status as HabitLogStatus) || 'completed',
      completed: l.completed,
      completedAt: l.completed_at,
    }))

    const habits: Habit[] = (habitsData || []).map((h) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title,
      description: h.description,
      category: (h.category as Habit['category']) || 'Personal',
      frequency: (h.frequency as Habit['frequency']) || 'daily',
      scheduleDays: h.schedule_days || [1, 2, 3, 4, 5, 6, 7],
      targetCount: h.target_count || 1,
      colorTheme: (h.color_theme as Habit['colorTheme']) || 'peach',
      icon: h.icon,
      reminderTime: h.reminder_time,
      isPaused: h.is_paused ?? false,
      isArchived: h.is_archived ?? false,
      currentStreak: h.streak_count || 0,
      bestStreak: h.best_streak || 0,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    }))

    return { habits, logs, isConfigured: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { habits: [], logs: [], isConfigured: true, error: message }
  }
}

export async function createHabitAction(input: HabitCreateInput): Promise<{ habit?: Habit; error?: string }> {
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
    .from('habits')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description || null,
      category: input.category || 'Personal',
      frequency: input.frequency || 'daily',
      schedule_days: input.scheduleDays || [1, 2, 3, 4, 5, 6, 7],
      target_count: input.targetCount || 1,
      color_theme: input.colorTheme || 'peach',
      icon: input.icon || 'flame',
      reminder_time: input.reminderTime || null,
      is_paused: false,
      is_archived: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/habits')
  return {
    habit: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category as Habit['category'],
      frequency: data.frequency as Habit['frequency'],
      scheduleDays: data.schedule_days || [1, 2, 3, 4, 5, 6, 7],
      targetCount: data.target_count || 1,
      colorTheme: data.color_theme as Habit['colorTheme'],
      icon: data.icon,
      reminderTime: data.reminder_time,
      isPaused: data.is_paused ?? false,
      isArchived: data.is_archived ?? false,
      currentStreak: 0,
      bestStreak: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function logHabitCompletionAction(
  habitId: string,
  logDate: string,
  status: HabitLogStatus = 'completed'
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

  const { error } = await supabase.from('habit_logs').upsert(
    {
      user_id: user.id,
      habit_id: habitId,
      log_date: logDate,
      status,
      completed: status === 'completed',
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    },
    { onConflict: 'habit_id,log_date' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/habits')
  revalidatePath('/app')
  return { success: true }
}

export async function undoHabitCompletionAction(
  habitId: string,
  logDate: string
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

  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('log_date', logDate)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/habits')
  revalidatePath('/app')
  return { success: true }
}

export async function updateHabitAction(
  id: string,
  input: HabitUpdateInput
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

  const updates: Database['public']['Tables']['habits']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.category !== undefined) updates.category = input.category
  if (input.frequency !== undefined) updates.frequency = input.frequency
  if (input.scheduleDays !== undefined) updates.schedule_days = input.scheduleDays
  if (input.targetCount !== undefined) updates.target_count = input.targetCount
  if (input.colorTheme !== undefined) updates.color_theme = input.colorTheme
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.reminderTime !== undefined) updates.reminder_time = input.reminderTime
  if (input.isPaused !== undefined) updates.is_paused = input.isPaused
  if (input.isArchived !== undefined) updates.is_archived = input.isArchived

  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/habits')
  return { success: true }
}

export async function deleteHabitAction(id: string): Promise<{ success: boolean; error?: string }> {
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
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/habits')
  return { success: true }
}

