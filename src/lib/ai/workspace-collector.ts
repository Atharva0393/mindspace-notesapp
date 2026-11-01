import { WorkspaceIndexableItem } from './indexer'
import {
  getLocalHabits,
  getLocalTasks,
  getLocalGoals,
  getLocalDailyPlan,
  getLocalJournalEntries,
} from '@/lib/workspace/store'
import { getLocalNotes } from '@/lib/notes/storage'

/**
 * Collects indexable items from local storage across all enabled modules.
 */
export function collectLocalWorkspaceItems(userId = 'default-user'): WorkspaceIndexableItem[] {
  const items: WorkspaceIndexableItem[] = []

  // 1. Notes
  try {
    const notes = getLocalNotes()
    for (const note of notes) {
      if (note.isArchived || note.isTrashed) continue
      items.push({
        userId,
        sourceType: 'note',
        sourceId: note.id,
        title: note.title || 'Untitled Note',
        rawContent: note.content || '',
        metadata: {
          colorTheme: note.colorTheme,
          tags: note.tags,
          isPinned: note.isPinned,
          folderId: note.folderId,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local notes:', err)
  }

  // 2. Tasks
  try {
    const tasks = getLocalTasks()
    for (const task of tasks) {
      items.push({
        userId,
        sourceType: 'task',
        sourceId: task.id,
        title: task.title,
        rawContent: `${task.description || ''} Status: ${task.status}. Priority: ${task.priority}. ${
          task.dueDate ? `Due date: ${task.dueDate}` : ''
        } ${task.project ? `Project: ${task.project}` : ''}`,
        metadata: {
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          project: task.project,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local tasks:', err)
  }

  // 3. Goals
  try {
    const goals = getLocalGoals()
    for (const goal of goals) {
      const milestoneNames = (goal.milestones || []).map((m) => m.title).join(', ')
      items.push({
        userId,
        sourceType: 'goal',
        sourceId: goal.id,
        title: goal.title,
        rawContent: `${goal.description || ''} Category: ${goal.category}. Progress: ${goal.progress}%. Milestones: ${milestoneNames}`,
        metadata: {
          category: goal.category,
          progress: goal.progress,
          targetDate: goal.targetDate,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local goals:', err)
  }

  // 4. Habits
  try {
    const habits = getLocalHabits()
    for (const habit of habits) {
      if (habit.isArchived) continue
      items.push({
        userId,
        sourceType: 'habit',
        sourceId: habit.id,
        title: habit.title,
        rawContent: `${habit.description || ''} Category: ${habit.category}. Frequency: ${habit.frequency}. Current Streak: ${habit.currentStreak} days.`,
        metadata: {
          category: habit.category,
          frequency: habit.frequency,
          streak: habit.currentStreak,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local habits:', err)
  }

  // 5. Daily Plans
  try {
    const plan = getLocalDailyPlan()
    if (plan.morningIntention || plan.eveningReflection) {
      items.push({
        userId,
        sourceType: 'daily_plan',
        sourceId: plan.id,
        title: `Daily Plan (${plan.planDate})`,
        rawContent: `Morning Intention: ${plan.morningIntention || 'None'}. Evening Reflection: ${plan.eveningReflection || 'None'}`,
        metadata: {
          planDate: plan.planDate,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local daily plan:', err)
  }

  // 6. Journal Entries
  try {
    const journalEntries = getLocalJournalEntries()
    for (const entry of journalEntries) {
      items.push({
        userId,
        sourceType: 'journal',
        sourceId: entry.id,
        title: entry.title || `Journal ${entry.entryDate}`,
        rawContent: `${entry.content || ''} Mood: ${entry.moodLevel || 'Neutral'}. Emotions: ${(entry.emotions || []).join(', ')}`,
        metadata: {
          entryDate: entry.entryDate,
          moodLevel: entry.moodLevel,
          emotions: entry.emotions,
        },
      })
    }
  } catch (err) {
    console.warn('[Collector] Could not load local journal entries:', err)
  }

  return items
}

