'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Task, TaskCreateInput, TaskUpdateInput, TaskFilter, TaskSort } from '@/types/tasks'
import { createNextOccurrence } from '@/lib/tasks/recurrence'
import { Database } from '@/types/database'

export interface TasksQueryResult {
  tasks: Task[]
  projects: string[]
  isConfigured: boolean
  error?: string
}

export async function getTasksData(options?: {
  filter?: TaskFilter
  project?: string | null
  sortBy?: TaskSort
}): Promise<TasksQueryResult> {
  if (!isSupabaseConfigured()) {
    return { tasks: [], projects: [], isConfigured: false }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { tasks: [], projects: [], isConfigured: true, error: 'Unauthorized' }
    }

    let query = supabase.from('tasks').select('*').eq('user_id', user.id)

    const filter = options?.filter || 'all'
    const todayStr = new Date().toISOString().split('T')[0]

    if (filter === 'completed') {
      query = query.eq('status', 'completed')
    } else {
      query = query.neq('status', 'completed')
      if (filter === 'today') {
        query = query.eq('due_date', todayStr)
      } else if (filter === 'upcoming') {
        query = query.gt('due_date', todayStr)
      } else if (filter === 'overdue') {
        query = query.lt('due_date', todayStr)
      }
    }

    if (options?.project) {
      query = query.eq('project', options.project)
    }

    const { data: taskData, error: taskError } = await query.order('created_at', { ascending: false })

    if (taskError) {
      return { tasks: [], projects: [], isConfigured: true, error: taskError.message }
    }

    const projectSet = new Set<string>()

    const tasks: Task[] = (taskData || []).map((t) => {
      if (t.project) projectSet.add(t.project)
      return {
        id: t.id,
        userId: t.user_id,
        goalId: t.goal_id,
        title: t.title,
        description: t.description,
        priority: t.priority as Task['priority'],
        status: t.status as Task['status'],
        dueDate: t.due_date,
        dueTime: t.due_time,
        project: t.project,
        tags: t.tags || [],
        recurrence: (t.recurrence as Task['recurrence']) || 'none',
        linkedNoteId: t.linked_note_id,
        isDailyFocus: t.is_daily_focus ?? false,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }
    })

    return {
      tasks,
      projects: Array.from(projectSet).sort(),
      isConfigured: true,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { tasks: [], projects: [], isConfigured: true, error: message }
  }
}

export async function createTaskAction(input: TaskCreateInput): Promise<{ task?: Task; error?: string }> {
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
    .from('tasks')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description || null,
      priority: input.priority || 'medium',
      status: input.status || 'todo',
      due_date: input.dueDate || null,
      due_time: input.dueTime || null,
      project: input.project || null,
      tags: input.tags || [],
      recurrence: input.recurrence || 'none',
      goal_id: input.goalId || null,
      linked_note_id: input.linkedNoteId || null,
      is_daily_focus: input.isDailyFocus ?? false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/tasks')
  revalidatePath('/app')
  return {
    task: {
      id: data.id,
      userId: data.user_id,
      goalId: data.goal_id,
      title: data.title,
      description: data.description,
      priority: data.priority as Task['priority'],
      status: data.status as Task['status'],
      dueDate: data.due_date,
      dueTime: data.due_time,
      project: data.project,
      tags: data.tags || [],
      recurrence: data.recurrence as Task['recurrence'],
      linkedNoteId: data.linked_note_id,
      isDailyFocus: data.is_daily_focus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  }
}

export async function completeTaskAction(task: Task): Promise<{ success: boolean; nextTask?: Task; error?: string }> {
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

  // 1. Mark current task completed
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', task.id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // 2. If recurring, generate next occurrence
  let nextTask: Task | undefined
  if (task.recurrence && task.recurrence !== 'none') {
    const nextPayload = createNextOccurrence(task)
    if (nextPayload) {
      const { data: nextData } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: nextPayload.title!,
          description: nextPayload.description,
          priority: nextPayload.priority,
          status: 'todo',
          due_date: nextPayload.dueDate,
          due_time: nextPayload.dueTime,
          project: nextPayload.project,
          tags: nextPayload.tags || [],
          recurrence: nextPayload.recurrence!,
          goal_id: nextPayload.goalId,
          linked_note_id: nextPayload.linkedNoteId,
          is_daily_focus: false,
        })
        .select()
        .single()

      if (nextData) {
        nextTask = {
          id: nextData.id,
          userId: nextData.user_id,
          goalId: nextData.goal_id,
          title: nextData.title,
          description: nextData.description,
          priority: nextData.priority as Task['priority'],
          status: nextData.status as Task['status'],
          dueDate: nextData.due_date,
          dueTime: nextData.due_time,
          project: nextData.project,
          tags: nextData.tags || [],
          recurrence: nextData.recurrence as Task['recurrence'],
          linkedNoteId: nextData.linked_note_id,
          isDailyFocus: nextData.is_daily_focus,
          createdAt: nextData.created_at,
          updatedAt: nextData.updated_at,
        }
      }
    }
  }

  revalidatePath('/app/tasks')
  revalidatePath('/app')
  return { success: true, nextTask }
}

export async function updateTaskAction(
  id: string,
  input: TaskUpdateInput
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

  const updates: Database['public']['Tables']['tasks']['Update'] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.priority !== undefined) updates.priority = input.priority
  if (input.status !== undefined) updates.status = input.status
  if (input.dueDate !== undefined) updates.due_date = input.dueDate
  if (input.dueTime !== undefined) updates.due_time = input.dueTime
  if (input.project !== undefined) updates.project = input.project
  if (input.tags !== undefined) updates.tags = input.tags
  if (input.recurrence !== undefined) updates.recurrence = input.recurrence
  if (input.goalId !== undefined) updates.goal_id = input.goalId
  if (input.linkedNoteId !== undefined) updates.linked_note_id = input.linkedNoteId
  if (input.isDailyFocus !== undefined) updates.is_daily_focus = input.isDailyFocus

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/tasks')
  revalidatePath('/app')
  return { success: true }
}

export async function deleteTaskAction(id: string): Promise<{ success: boolean; error?: string }> {
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
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/tasks')
  revalidatePath('/app')
  return { success: true }
}

