import { AIProposedAction } from '@/types/ai'
import {
  getLocalTasks,
  saveLocalTasks,
  getLocalGoals,
  saveLocalGoals,
  getLocalHabits,
  saveLocalHabits,
  getLocalTimeBlocks,
  saveLocalTimeBlocks,
  getLocalJournalEntries,
  saveLocalJournalEntries,
} from '@/lib/workspace/store'
import { getLocalNotes, saveLocalNotes } from '@/lib/notes/storage'
import { Task, Goal, TaskPriority, TaskStatus, GoalCategory } from '@/types/tasks'
import { Habit, HabitCategory, HabitFrequency } from '@/types/habits'
import { Note } from '@/types/notes'
import { TimeBlock } from '@/types/planner'
import { JournalEntry, MoodLevel } from '@/types/journal'
import { PastelColorKey } from '@/lib/constants/colors'

export interface ActionResult {
  success: boolean
  summary: string
  recordId?: string
  error?: string
}

/**
 * Validates and executes an approved action safely.
 * Only invoked after explicit user approval!
 */
export async function executeApprovedAction(
  action: AIProposedAction,
  userId = 'default-user',
  supabase?: {
    from: (table: string) => {
      insert: (rows: unknown[]) => Promise<{ error: { message: string } | null }>
      update: (values: unknown) => { eq: (col: string, val: string) => { eq: (col2: string, val2: string) => Promise<{ error: { message: string } | null }> } }
    }
  } | null
): Promise<ActionResult> {
  const { type, payload } = action

  // 1. Prevent repeated approval or execution of already handled actions
  if (action.status === 'executed') {
    return { success: false, summary: '', error: 'Action has already been executed.' }
  }
  if (action.status === 'rejected') {
    return { success: false, summary: '', error: 'Action has previously been rejected.' }
  }

  // 2. Validate payload structure
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { success: false, summary: '', error: 'Invalid action payload: expected a structured object.' }
  }

  try {
    switch (type) {
      case 'create_task': {
        const title = String(payload.title || action.title || '').trim()
        if (!title) {
          return { success: false, summary: '', error: 'Task title cannot be empty.' }
        }

        const rawPriority = String(payload.priority || 'medium').toLowerCase()
        const priority: TaskPriority =
          rawPriority === 'urgent' || rawPriority === 'high' || rawPriority === 'low'
            ? rawPriority
            : 'medium'
        const dueDate = String(payload.dueDate || new Date().toISOString().split('T')[0])
        const project = payload.project ? String(payload.project) : 'General'

        const newTask: Task = {
          id: `task-${Date.now()}`,
          userId,
          title,
          description: payload.description ? String(payload.description) : '',
          priority,
          status: 'todo',
          dueDate,
          dueTime: payload.dueTime ? String(payload.dueTime) : null,
          project,
          recurrence: 'none',
          isDailyFocus: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const tasks = getLocalTasks()
        saveLocalTasks([newTask, ...tasks])

        if (supabase) {
          try {
            await supabase.from('tasks').insert([
              {
                id: newTask.id,
                user_id: userId,
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                status: newTask.status,
                due_date: newTask.dueDate,
                due_time: newTask.dueTime,
                project: newTask.project,
              },
            ])
          } catch (e) {
            console.warn('[ActionExecutor] Supabase task insert error:', e)
          }
        }

        return {
          success: true,
          summary: `Created task "${title}" with ${priority} priority.`,
          recordId: newTask.id,
        }
      }

      case 'create_note': {
        const title = String(payload.title || action.title || '').trim()
        if (!title) {
          return { success: false, summary: '', error: 'Note title cannot be empty.' }
        }

        const content = payload.content
          ? String(payload.content)
          : '<p>Created by AI Companion upon approval.</p>'
        const colorTheme = (payload.colorTheme as PastelColorKey) || 'warm-ivory'

        const newNote: Note = {
          id: `note-${Date.now()}`,
          userId,
          title,
          content,
          colorTheme,
          tags: Array.isArray(payload.tags)
            ? (payload.tags as string[])
            : ['ai-copilot'],
          isPinned: false,
          isArchived: false,
          isFavorite: false,
          isTrashed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const notes = getLocalNotes()
        saveLocalNotes([newNote, ...notes])

        if (supabase) {
          try {
            await supabase.from('notes').insert([
              {
                id: newNote.id,
                user_id: userId,
                title: newNote.title,
                content: newNote.content,
                color_theme: newNote.colorTheme,
                tags: newNote.tags,
              },
            ])
          } catch (e) {
            console.warn('[ActionExecutor] Supabase note insert error:', e)
          }
        }

        return {
          success: true,
          summary: `Created note "${title}" in pastel ${colorTheme}.`,
          recordId: newNote.id,
        }
      }

      case 'update_task': {
        const taskId = String(payload.taskId || payload.id || '')
        if (!taskId) {
          return { success: false, summary: '', error: 'Target task ID was not provided.' }
        }

        const tasks = getLocalTasks()
        const index = tasks.findIndex((t) => t.id === taskId)
        if (index === -1) {
          return { success: false, summary: '', error: `Task ${taskId} not found.` }
        }

        const existing = tasks[index]

        // Strict cross-user ownership authorization check
        if (existing.userId && existing.userId !== userId) {
          return {
            success: false,
            summary: '',
            error: 'Unauthorized: Cannot modify a task belonging to another user.',
          }
        }

        const rawPriority = payload.priority
          ? String(payload.priority).toLowerCase()
          : existing.priority
        const priority: TaskPriority =
          rawPriority === 'urgent' || rawPriority === 'high' || rawPriority === 'low'
            ? rawPriority
            : 'medium'

        const updatedTask: Task = {
          ...existing,
          title: payload.title ? String(payload.title) : existing.title,
          priority,
          status: (payload.status as TaskStatus) || existing.status,
          dueDate: payload.dueDate ? String(payload.dueDate) : existing.dueDate,
          updatedAt: new Date().toISOString(),
        }

        tasks[index] = updatedTask
        saveLocalTasks(tasks)

        if (supabase) {
          try {
            await supabase
              .from('tasks')
              .update({
                title: updatedTask.title,
                priority: updatedTask.priority,
                status: updatedTask.status,
                due_date: updatedTask.dueDate,
              })
              .eq('id', taskId)
              .eq('user_id', userId)
          } catch (e) {
            console.warn('[ActionExecutor] Supabase task update error:', e)
          }
        }

        return {
          success: true,
          summary: `Updated task "${updatedTask.title}".`,
          recordId: updatedTask.id,
        }
      }

      case 'create_goal': {
        const title = String(payload.title || action.title || 'Untitled Goal').trim()
        const category: GoalCategory = (payload.category as GoalCategory) || 'Personal'
        const colorTheme: PastelColorKey = (payload.colorTheme as PastelColorKey) || 'sage'

        const newGoal: Goal = {
          id: `goal-${Date.now()}`,
          userId,
          title,
          description: payload.description ? String(payload.description) : '',
          category,
          colorTheme,
          targetDate: payload.targetDate ? String(payload.targetDate) : null,
          progress: 0,
          milestones: [
            { id: 'm-1', title: 'Define key milestones', isCompleted: false },
            { id: 'm-2', title: 'First implementation sprint', isCompleted: false },
          ],
          isCompleted: false,
          linkedNoteIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const goals = getLocalGoals()
        saveLocalGoals([newGoal, ...goals])

        return {
          success: true,
          summary: `Created goal "${title}" in ${category}.`,
          recordId: newGoal.id,
        }
      }

      case 'suggest_habit': {
        const title = String(payload.title || action.title || 'New Daily Habit').trim()
        const category: HabitCategory = (payload.category as HabitCategory) || 'Personal'
        const frequency: HabitFrequency = (payload.frequency as HabitFrequency) || 'daily'
        const colorTheme: PastelColorKey = (payload.colorTheme as PastelColorKey) || 'peach'

        const newHabit: Habit = {
          id: `habit-${Date.now()}`,
          userId,
          title,
          description: payload.description ? String(payload.description) : '',
          category,
          frequency,
          scheduleDays: [1, 2, 3, 4, 5, 6, 7],
          targetCount: 1,
          colorTheme,
          icon: 'sparkles',
          isPaused: false,
          isArchived: false,
          currentStreak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const habits = getLocalHabits()
        saveLocalHabits([newHabit, ...habits])

        return {
          success: true,
          summary: `Added habit "${title}" to your Habit Studio.`,
          recordId: newHabit.id,
        }
      }

      case 'organize_daily_plan': {
        const title = String(payload.title || 'Focus Time Block').trim()
        const startTime = String(payload.startTime || '09:00')
        const endTime = String(payload.endTime || '10:30')
        const colorTheme: PastelColorKey = (payload.colorTheme as PastelColorKey) || 'lavender'
        const blockDate = String(payload.blockDate || new Date().toISOString().split('T')[0])

        const newBlock: TimeBlock = {
          id: `block-${Date.now()}`,
          userId,
          dailyPlanId: 'default-plan',
          title,
          blockDate,
          startTime,
          endTime,
          colorTheme,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        }

        const blocks = getLocalTimeBlocks()
        saveLocalTimeBlocks([...blocks, newBlock])

        return {
          success: true,
          summary: `Scheduled time block "${title}" from ${startTime} to ${endTime}.`,
          recordId: newBlock.id,
        }
      }

      case 'draft_reflection': {
        const title = String(payload.title || 'Mindful Reflection').trim()
        const content = payload.content
          ? String(payload.content)
          : '<p>Reflection notes approved by user.</p>'
        const moodLevel: MoodLevel = 'good'

        const newEntry: JournalEntry = {
          id: `journal-${Date.now()}`,
          userId,
          title,
          content,
          entryDate: new Date().toISOString().split('T')[0],
          moodLevel,
          emotions: ['Reflective', 'Calm'],
          isFavorite: false,
          colorTheme: 'lavender',
          tags: [],
          gratitudeItems: [],
          linkedNoteIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const entries = getLocalJournalEntries()
        saveLocalJournalEntries([newEntry, ...entries])

        return {
          success: true,
          summary: `Saved reflection draft "${title}" to Journal.`,
          recordId: newEntry.id,
        }
      }

      default:
        return {
          success: false,
          summary: '',
          error: `Unsupported action type: ${type}`,
        }
    }
  } catch (err) {
    return {
      success: false,
      summary: '',
      error: `Failed to execute action: ${(err as Error).message}`,
    }
  }
}
