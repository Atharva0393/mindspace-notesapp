import { PastelColorKey } from '@/lib/constants/colors'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom'

export interface Task {
  id: string
  userId: string
  goalId?: string | null
  goalTitle?: string | null
  title: string
  description?: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null // YYYY-MM-DD
  dueTime?: string | null // HH:mm
  project?: string | null
  tags?: string[]
  recurrence: TaskRecurrence
  linkedNoteId?: string | null
  linkedNoteTitle?: string | null
  isDailyFocus: boolean
  createdAt: string
  updatedAt: string
}

export type TaskFilter =
  | 'all'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'completed'
  | 'by-project'

export type TaskSort = 'dueDate' | 'priority' | 'title' | 'created'

export interface TaskCreateInput {
  title: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string | null
  dueTime?: string | null
  project?: string | null
  tags?: string[]
  recurrence?: TaskRecurrence
  goalId?: string | null
  linkedNoteId?: string | null
  isDailyFocus?: boolean
}

export interface TaskUpdateInput {
  title?: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string | null
  dueTime?: string | null
  project?: string | null
  tags?: string[]
  recurrence?: TaskRecurrence
  goalId?: string | null
  linkedNoteId?: string | null
  isDailyFocus?: boolean
}

export type GoalCategory =
  | 'Personal'
  | 'Career'
  | 'Education'
  | 'Fitness'
  | 'Finance'
  | 'Health'
  | 'Other'

export interface GoalMilestone {
  id: string
  title: string
  isCompleted: boolean
  dueDate?: string | null
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string | null
  category: GoalCategory
  colorTheme: PastelColorKey
  targetDate?: string | null
  progress: number
  milestones: GoalMilestone[]
  linkedNoteIds: string[]
  isCompleted: boolean
  tasksCount?: number
  completedTasksCount?: number
  createdAt: string
  updatedAt: string
}

export interface GoalCreateInput {
  title: string
  description?: string | null
  category?: GoalCategory
  colorTheme?: PastelColorKey
  targetDate?: string | null
  milestones?: { title: string; dueDate?: string | null }[]
  linkedNoteIds?: string[]
}

export interface GoalUpdateInput {
  title?: string
  description?: string | null
  category?: GoalCategory
  colorTheme?: PastelColorKey
  targetDate?: string | null
  progress?: number
  milestones?: GoalMilestone[]
  linkedNoteIds?: string[]
  isCompleted?: boolean
}
