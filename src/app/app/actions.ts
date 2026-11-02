'use server'

import { revalidatePath } from 'next/cache'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Habit, HabitLog, HabitLogStatus } from '@/types/habits'
import { Task, Goal, GoalMilestone } from '@/types/tasks'
import { DailyPlan, TimeBlock, DailyReflection } from '@/types/planner'
import { JournalEntry, MoodLog, MoodLevel } from '@/types/journal'

export interface DashboardDataResult {
  isAuthenticated: boolean
  habits: Habit[]
  habitLogs: HabitLog[]
  tasks: Task[]
  dailyPlan: DailyPlan | null
  timeBlocks: TimeBlock[]
  goals: Goal[]
  recentJournal: JournalEntry | null
  todayMood: MoodLog | null
  error?: string
}

export async function getDashboardData(todayStr: string): Promise<DashboardDataResult> {
  if (!isSupabaseConfigured()) {
    return {
      isAuthenticated: false,
      habits: [],
      habitLogs: [],
      tasks: [],
      dailyPlan: null,
      timeBlocks: [],
      goals: [],
      recentJournal: null,
      todayMood: null,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        isAuthenticated: false,
        habits: [],
        habitLogs: [],
        tasks: [],
        dailyPlan: null,
        timeBlocks: [],
        goals: [],
        recentJournal: null,
        todayMood: null,
      }
    }

    const userId = user.id

    // Parallel fetch for dashboard elements
    const [
      habitsRes,
      habitLogsRes,
      tasksRes,
      planRes,
      blocksRes,
      goalsRes,
      journalRes,
      moodRes,
    ] = await Promise.all([
      // Habits
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false }),

      // Habit logs
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(200),

      // Tasks
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // Daily plan for today
      supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_date', todayStr)
        .maybeSingle(),

      // Time blocks for today
      supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', userId)
        .eq('block_date', todayStr)
        .order('start_time', { ascending: true }),

      // Goals
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // Recent Journal Entry
      supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Today's Mood Log
      supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', todayStr)
        .maybeSingle(),
    ])

    // Format Habits
    const habits: Habit[] = (habitsRes.data || []).map((h) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title,
      description: h.description,
      category: (h.category as Habit['category']) || 'Personal',
      frequency: (h.frequency as Habit['frequency']) || 'daily',
      scheduleDays: h.schedule_days || [1, 2, 3, 4, 5, 6, 7],
      targetCount: h.target_count || 1,
      colorTheme: (h.color_theme as Habit['colorTheme']) || 'sage',
      icon: h.icon,
      reminderTime: h.reminder_time,
      isPaused: h.is_paused ?? false,
      isArchived: h.is_archived ?? false,
      currentStreak: h.streak_count || 0,
      bestStreak: h.best_streak || 0,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    }))

    // Format Habit Logs
    const habitLogs: HabitLog[] = (habitLogsRes.data || []).map((l) => ({
      id: l.id,
      userId: l.user_id,
      habitId: l.habit_id,
      logDate: l.log_date,
      status: (l.status as HabitLogStatus) || 'completed',
      completed: l.completed,
      completedAt: l.completed_at,
    }))

    // Format Tasks
    const tasks: Task[] = (tasksRes.data || []).map((t) => ({
      id: t.id,
      userId: t.user_id,
      goalId: t.goal_id,
      title: t.title,
      description: t.description,
      priority: (t.priority as Task['priority']) || 'medium',
      status: (t.status as Task['status']) || 'todo',
      dueDate: t.due_date,
      dueTime: t.due_time ? t.due_time.slice(0, 5) : undefined,
      project: t.project,
      tags: t.tags || [],
      recurrence: (t.recurrence as Task['recurrence']) || 'none',
      linkedNoteId: t.linked_note_id,
      isDailyFocus: t.is_daily_focus ?? false,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))

    // Format Daily Plan
    const dailyPlan: DailyPlan | null = planRes.data
      ? {
          id: planRes.data.id,
          userId: planRes.data.user_id,
          planDate: planRes.data.plan_date,
          morningIntention: planRes.data.morning_intention,
          eveningReflection: planRes.data.evening_reflection,
          dailyReflection: (planRes.data.daily_reflection as unknown as DailyReflection) || null,
          timeBlocks: [],
          createdAt: planRes.data.created_at,
          updatedAt: planRes.data.updated_at,
        }
      : null

    // Format Time Blocks
    const timeBlocks: TimeBlock[] = (blocksRes.data || []).map((b) => ({
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

    // Format Goals
    const goals: Goal[] = (goalsRes.data || []).map((g) => ({
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

    // Format Recent Journal
    const recentJournal: JournalEntry | null = journalRes.data
      ? {
          id: journalRes.data.id,
          userId: journalRes.data.user_id,
          title: journalRes.data.title || 'Untitled Reflection',
          content: journalRes.data.content,
          entryDate: journalRes.data.entry_date,
          colorTheme: (journalRes.data.color_theme as JournalEntry['colorTheme']) || 'peach',
          emotions: journalRes.data.emotions || [],
          tags: journalRes.data.tags || [],
          isFavorite: journalRes.data.is_favorite ?? false,
          templateId: journalRes.data.template_id,
          linkedNoteIds: journalRes.data.linked_note_ids || [],
          gratitudeItems: journalRes.data.gratitude_items || [],
          promptQuestion: journalRes.data.prompt_question,
          createdAt: journalRes.data.created_at,
          updatedAt: journalRes.data.updated_at,
        }
      : null

    // Format Mood Log
    const todayMood: MoodLog | null = moodRes.data
      ? {
          id: moodRes.data.id,
          userId: moodRes.data.user_id,
          logDate: moodRes.data.log_date,
          moodScore: moodRes.data.mood_score as MoodLog['moodScore'],
          moodLevel: moodRes.data.mood_level as MoodLevel,
          emotions: moodRes.data.emotions || [],
          note: moodRes.data.note,
          createdAt: moodRes.data.created_at,
          updatedAt: moodRes.data.updated_at,
        }
      : null

    return {
      isAuthenticated: true,
      habits,
      habitLogs,
      tasks,
      dailyPlan,
      timeBlocks,
      goals,
      recentJournal,
      todayMood,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      isAuthenticated: false,
      habits: [],
      habitLogs: [],
      tasks: [],
      dailyPlan: null,
      timeBlocks: [],
      goals: [],
      recentJournal: null,
      todayMood: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function saveIntentionDashboardAction(todayStr: string, intention: string) {
  if (!isSupabaseConfigured()) return { success: false }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('daily_plans').upsert(
      {
        user_id: user.id,
        plan_date: todayStr,
        morning_intention: intention,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,plan_date' }
    )

    if (error) throw error
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error saving intention:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' }
  }
}

export async function toggleHabitDashboardAction(
  habitId: string,
  logDate: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Ownership check: ensure habit belongs to current user
    const { data: habit, error: habitErr } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

    if (habitErr || !habit) {
      return { success: false, error: 'Habit not found or unauthorized' }
    }

    if (completed) {
      const { error } = await supabase.from('habit_logs').upsert(
        {
          user_id: user.id,
          habit_id: habitId,
          log_date: logDate,
          status: 'completed',
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'habit_id,log_date' }
      )
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('log_date', logDate)
      if (error) throw error
    }

    revalidatePath('/app')
    revalidatePath('/app/habits')
    return { success: true }
  } catch (error) {
    console.error('Error toggling habit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' }
  }
}

export async function toggleTaskDashboardAction(taskId: string, isCompleted: boolean) {
  if (!isSupabaseConfigured()) return { success: false }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const newStatus = isCompleted ? 'completed' : 'todo'

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/app')
    revalidatePath('/app/tasks')
    return { success: true }
  } catch (error) {
    console.error('Error toggling task:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' }
  }
}
