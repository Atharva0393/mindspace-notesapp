'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Goal, GoalCreateInput, GoalUpdateInput, GoalMilestone } from '@/types/tasks'
import { Database, Json } from '@/types/database'
import { syncWorkspaceItemToKnowledge, removeSourceKnowledgeChunks } from '@/lib/ai/indexer'

export interface GoalsQueryResult {
  goals: Goal[]
  isConfigured: boolean
  isAuthenticated: boolean
  error?: string
}

export async function getGoalsData(): Promise<GoalsQueryResult> {
  if (!isSupabaseConfigured()) {
    return { goals: [], isConfigured: false, isAuthenticated: false }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { goals: [], isConfigured: true, isAuthenticated: false, error: 'Unauthorized' }
    }

    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (goalError) {
      return { goals: [], isConfigured: true, isAuthenticated: true, error: goalError.message }
    }

    const goals: Goal[] = (goalData || []).map((g) => ({
      id: g.id,
      userId: g.user_id,
      title: g.title,
      description: g.description,
      category: (g.category as Goal['category']) || 'Personal',
      colorTheme: (g.color_theme as Goal['colorTheme']) || 'powder',
      targetDate: g.target_date,
      progress: g.progress,
      milestones: (g.milestones as unknown as GoalMilestone[]) || [],
      linkedNoteIds: g.linked_note_ids || [],
      isCompleted: g.is_completed,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    }))

    return { goals, isConfigured: true, isAuthenticated: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { goals: [], isConfigured: true, isAuthenticated: false, error: message }
  }
}

export async function createGoalAction(input: GoalCreateInput): Promise<{ goal?: Goal; error?: string }> {
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

  const milestones: GoalMilestone[] = (input.milestones || []).map((m, idx) => ({
    id: `m-${Date.now()}-${idx}`,
    title: m.title,
    dueDate: m.dueDate,
    isCompleted: false,
  }))

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description || null,
      category: input.category || 'Personal',
      color_theme: input.colorTheme || 'powder',
      target_date: input.targetDate || null,
      progress: 0,
      milestones: milestones as unknown as Json,
      linked_note_ids: input.linkedNoteIds || [],
      is_completed: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Automatic knowledge ingestion for the created goal
  try {
    await syncWorkspaceItemToKnowledge(supabase, {
      userId: user.id,
      sourceType: 'goal',
      sourceId: data.id,
      title: data.title,
      rawContent: data.description || '',
      metadata: {
        category: data.category,
        targetDate: data.target_date,
        progress: data.progress,
        isCompleted: data.is_completed,
      },
    })
  } catch (ingestErr) {
    console.warn('[Goals Ingestion] Failed to index goal:', ingestErr)
  }

  revalidatePath('/app/goals')
  return {
    goal: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category as Goal['category'],
      colorTheme: data.color_theme as Goal['colorTheme'],
      targetDate: data.target_date,
      progress: data.progress,
      milestones: (data.milestones as unknown as GoalMilestone[]) || [],
      linkedNoteIds: data.linked_note_ids || [],
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function updateGoalAction(
  id: string,
  input: GoalUpdateInput
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

  const updates: Database['public']['Tables']['goals']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.category !== undefined) updates.category = input.category
  if (input.colorTheme !== undefined) updates.color_theme = input.colorTheme
  if (input.targetDate !== undefined) updates.target_date = input.targetDate
  if (input.progress !== undefined) updates.progress = input.progress
  if (input.milestones !== undefined) updates.milestones = input.milestones as unknown as Json
  if (input.linkedNoteIds !== undefined) updates.linked_note_ids = input.linkedNoteIds
  if (input.isCompleted !== undefined) updates.is_completed = input.isCompleted

  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Automatic knowledge synchronization for updated goal
  try {
    const { data: updatedGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (updatedGoal) {
      await syncWorkspaceItemToKnowledge(supabase, {
        userId: user.id,
        sourceType: 'goal',
        sourceId: updatedGoal.id,
        title: updatedGoal.title,
        rawContent: updatedGoal.description || '',
        metadata: {
          category: updatedGoal.category,
          targetDate: updatedGoal.target_date,
          progress: updatedGoal.progress,
          isCompleted: updatedGoal.is_completed,
        },
      })
    }
  } catch (ingestErr) {
    console.warn('[Goals Ingestion] Failed to update goal index:', ingestErr)
  }

  revalidatePath('/app/goals')
  return { success: true }
}

export async function deleteGoalAction(id: string): Promise<{ success: boolean; error?: string }> {
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

  // Automatic knowledge chunk removal for deleted goal
  try {
    await removeSourceKnowledgeChunks(supabase, user.id, 'goal', id)
  } catch (ingestErr) {
    console.warn('[Goals Ingestion] Failed to remove goal index chunks:', ingestErr)
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/goals')
  return { success: true }
}

