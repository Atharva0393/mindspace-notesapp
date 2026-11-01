import { PastelColorKey } from '@/lib/constants/colors'

export interface DailyReflection {
  whatWentWell?: string
  whatWasDifficult?: string
  whatAccomplished?: string
  improveTomorrow?: string
}

export interface TimeBlock {
  id: string
  userId: string
  dailyPlanId?: string | null
  taskId?: string | null
  taskTitle?: string | null
  title: string
  blockDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
  colorTheme: PastelColorKey
  notes?: string | null
  isCompleted: boolean
  createdAt: string
}

export interface DailyPlan {
  id: string
  userId: string
  planDate: string // YYYY-MM-DD
  morningIntention?: string | null
  eveningReflection?: string | null
  dailyReflection?: DailyReflection | null
  timeBlocks: TimeBlock[]
  createdAt: string
  updatedAt: string
}

export interface TimeBlockCreateInput {
  title: string
  blockDate: string
  startTime: string
  endTime: string
  colorTheme?: PastelColorKey
  taskId?: string | null
  notes?: string | null
}

export interface TimeBlockUpdateInput {
  title?: string
  blockDate?: string
  startTime?: string
  endTime?: string
  colorTheme?: PastelColorKey
  taskId?: string | null
  notes?: string | null
  isCompleted?: boolean
}
