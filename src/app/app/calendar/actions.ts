'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { DailyPlan, TimeBlock, TimeBlockCreateInput, TimeBlockUpdateInput, DailyReflection } from '@/types/planner'
import { Database, Json } from '@/types/database'

export interface DailyPlanQueryResult {
  dailyPlan: DailyPlan | null
  timeBlocks: TimeBlock[]
  isConfigured: boolean
  isAuthenticated: boolean
  error?: string
}

export async function getDailyPlanData(dateStr: string): Promise<DailyPlanQueryResult> {
  if (!isSupabaseConfigured()) {
    return { dailyPlan: null, timeBlocks: [], isConfigured: false, isAuthenticated: false }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { dailyPlan: null, timeBlocks: [], isConfigured: true, isAuthenticated: false, error: 'Unauthorized' }
    }

    // 1. Fetch Daily Plan
    const { data: planData } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_date', dateStr)
      .maybeSingle()

    // 2. Fetch Time Blocks for this date
    const { data: blockData, error: blockError } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('block_date', dateStr)
      .order('start_time', { ascending: true })

    if (blockError) {
      console.error('Error fetching time blocks:', blockError.message)
    }

    const timeBlocks: TimeBlock[] = (blockData || []).map((b) => ({
      id: b.id,
      userId: b.user_id,
      dailyPlanId: b.daily_plan_id,
      taskId: b.task_id,
      title: b.title,
      blockDate: b.block_date,
      startTime: b.start_time.slice(0, 5),
      endTime: b.end_time.slice(0, 5),
      colorTheme: (b.color_theme as TimeBlock['colorTheme']) || 'powder',
      notes: b.notes,
      isCompleted: b.is_completed,
      createdAt: b.created_at,
    }))

    const dailyPlan: DailyPlan | null = planData
      ? {
          id: planData.id,
          userId: planData.user_id,
          planDate: planData.plan_date,
          morningIntention: planData.morning_intention,
          eveningReflection: planData.evening_reflection,
          dailyReflection: (planData.daily_reflection as unknown as DailyReflection) || null,
          timeBlocks,
          createdAt: planData.created_at,
          updatedAt: planData.updated_at,
        }
      : null

    return { dailyPlan, timeBlocks, isConfigured: true, isAuthenticated: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { dailyPlan: null, timeBlocks: [], isConfigured: true, isAuthenticated: false, error: message }
  }
}

export async function updateDailyIntentionAction(
  dateStr: string,
  morningIntention: string
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

  const { error } = await supabase.from('daily_plans').upsert(
    {
      user_id: user.id,
      plan_date: dateStr,
      morning_intention: morningIntention,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan_date' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app')
  revalidatePath('/app/calendar')
  return { success: true }
}

export async function updateDailyReflectionAction(
  dateStr: string,
  reflection: DailyReflection
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

  const { error } = await supabase.from('daily_plans').upsert(
    {
      user_id: user.id,
      plan_date: dateStr,
      daily_reflection: reflection as unknown as Json,
      evening_reflection: reflection.whatAccomplished || '',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan_date' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app')
  revalidatePath('/app/calendar')
  return { success: true }
}

export async function createTimeBlockAction(
  input: TimeBlockCreateInput
): Promise<{ timeBlock?: TimeBlock; error?: string }> {
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
    .from('time_blocks')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      block_date: input.blockDate,
      start_time: input.startTime,
      end_time: input.endTime,
      color_theme: input.colorTheme || 'powder',
      task_id: input.taskId || null,
      notes: input.notes || null,
      is_completed: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/calendar')
  revalidatePath('/app')
  return {
    timeBlock: {
      id: data.id,
      userId: data.user_id,
      dailyPlanId: data.daily_plan_id,
      taskId: data.task_id,
      title: data.title,
      blockDate: data.block_date,
      startTime: data.start_time.slice(0, 5),
      endTime: data.end_time.slice(0, 5),
      colorTheme: data.color_theme as TimeBlock['colorTheme'],
      notes: data.notes,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
    },
  }
}

export async function updateTimeBlockAction(
  id: string,
  input: TimeBlockUpdateInput
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

  const updates: Database['public']['Tables']['time_blocks']['Update'] = {}

  if (input.title !== undefined) updates.title = input.title
  if (input.blockDate !== undefined) updates.block_date = input.blockDate
  if (input.startTime !== undefined) updates.start_time = input.startTime
  if (input.endTime !== undefined) updates.end_time = input.endTime
  if (input.colorTheme !== undefined) updates.color_theme = input.colorTheme
  if (input.taskId !== undefined) updates.task_id = input.taskId
  if (input.notes !== undefined) updates.notes = input.notes
  if (input.isCompleted !== undefined) updates.is_completed = input.isCompleted

  const { error } = await supabase
    .from('time_blocks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/calendar')
  revalidatePath('/app')
  return { success: true }
}

export async function deleteTimeBlockAction(id: string): Promise<{ success: boolean; error?: string }> {
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
    .from('time_blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/calendar')
  revalidatePath('/app')
  return { success: true }
}

