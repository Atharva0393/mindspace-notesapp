import { Task, TaskRecurrence } from '@/types/tasks'
import { formatLocalDate } from '@/lib/habits/streaks'

/**
 * Calculates the next due date string (YYYY-MM-DD) for a recurring task
 */
export function getNextDueDate(currentDueDateStr: string | null | undefined, recurrence: TaskRecurrence): string | null {
  if (recurrence === 'none') return null

  const baseDate = currentDueDateStr ? new Date(currentDueDateStr) : new Date()
  const next = new Date(baseDate)

  if (recurrence === 'daily') {
    next.setDate(next.getDate() + 1)
  } else if (recurrence === 'weekdays') {
    // If Fri -> Mon (+3), Sat -> Mon (+2), otherwise +1
    const day = next.getDay()
    if (day === 5) {
      next.setDate(next.getDate() + 3)
    } else if (day === 6) {
      next.setDate(next.getDate() + 2)
    } else {
      next.setDate(next.getDate() + 1)
    }
  } else if (recurrence === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (recurrence === 'monthly') {
    next.setMonth(next.getMonth() + 1)
  } else {
    next.setDate(next.getDate() + 1)
  }

  return formatLocalDate(next)
}

/**
 * Creates the next recurring task payload when a recurring task is completed
 */
export function createNextOccurrence(task: Task): Partial<Task> | null {
  if (task.recurrence === 'none') return null

  const nextDueDate = getNextDueDate(task.dueDate, task.recurrence)
  if (!nextDueDate) return null

  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: 'todo',
    dueDate: nextDueDate,
    dueTime: task.dueTime,
    project: task.project,
    tags: task.tags ? [...task.tags] : [],
    recurrence: task.recurrence,
    goalId: task.goalId,
    linkedNoteId: task.linkedNoteId,
    isDailyFocus: false,
  }
}

