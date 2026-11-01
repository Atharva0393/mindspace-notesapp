import { PastelColorKey } from '@/lib/constants/colors'

export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Productivity'
  | 'Personal'
  | 'Mindfulness'
  | 'Other'

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom'

export interface Habit {
  id: string
  userId: string
  title: string
  description?: string | null
  category: HabitCategory
  frequency: HabitFrequency
  scheduleDays: number[] // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  targetCount: number
  colorTheme: PastelColorKey
  icon?: string | null
  reminderTime?: string | null
  isPaused: boolean
  isArchived: boolean
  currentStreak: number
  bestStreak: number
  createdAt: string
  updatedAt: string
  // Computed helpers for current session
  completedToday?: boolean
  skippedToday?: boolean
}

export type HabitLogStatus = 'completed' | 'skipped'

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  logDate: string // YYYY-MM-DD
  status: HabitLogStatus
  completed: boolean
  completedAt?: string | null
}

export interface HabitCreateInput {
  title: string
  description?: string | null
  category: HabitCategory
  frequency: HabitFrequency
  scheduleDays?: number[]
  targetCount?: number
  colorTheme?: PastelColorKey
  icon?: string | null
  reminderTime?: string | null
  startDate?: string
}

export interface HabitUpdateInput {
  title?: string
  description?: string | null
  category?: HabitCategory
  frequency?: HabitFrequency
  scheduleDays?: number[]
  targetCount?: number
  colorTheme?: PastelColorKey
  icon?: string | null
  reminderTime?: string | null
  isPaused?: boolean
  isArchived?: boolean
}

export interface HabitAnalytics {
  activeCount: number
  overallWeeklyRate: number
  overallMonthlyRate: number
  bestPerforming: { habitId: string; title: string; streak: number }[]
  needsAttention: { habitId: string; title: string; rate: number }[]
}
