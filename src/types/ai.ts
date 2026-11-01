// Phase 06: AI Companion & Personal Knowledge Management Types

export type KnowledgeSourceType = 'note' | 'task' | 'goal' | 'habit' | 'daily_plan' | 'journal'

export interface AIContextPreferences {
  userId: string
  includeNotes: boolean
  includeTasks: boolean
  includeGoals: boolean
  includeHabits: boolean
  includeDailyPlans: boolean
  // STRICT REQUIREMENT: Journal access must be disabled by default!
  includeJournal: boolean
  updatedAt?: string
}

export const DEFAULT_AI_CONTEXT_PREFERENCES: Omit<AIContextPreferences, 'userId'> = {
  includeNotes: true,
  includeTasks: true,
  includeGoals: true,
  includeHabits: true,
  includeDailyPlans: true,
  includeJournal: false,
}

export interface AISourceReference {
  id: string
  sourceType: KnowledgeSourceType
  sourceId: string
  title: string
  excerpt: string
  url?: string
  similarity?: number
}

export type AIActionType =
  | 'create_task'
  | 'create_note'
  | 'update_task'
  | 'create_goal'
  | 'suggest_habit'
  | 'organize_daily_plan'
  | 'draft_reflection'

export type AIActionStatus = 'proposed' | 'approved' | 'rejected' | 'executed'

export interface AIProposedAction {
  id: string
  type: AIActionType
  title: string
  description: string
  payload: Record<string, unknown>
  status: AIActionStatus
  executedAt?: string
  resultSummary?: string
  error?: string
}

export interface AIMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: AISourceReference[]
  proposedAction?: AIProposedAction | null
  createdAt: string
  error?: string
}

export interface AIConversation {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessagePreview?: string
}

export interface AIKnowledgeChunk {
  id: string
  userId: string
  sourceType: KnowledgeSourceType
  sourceId: string
  title: string
  contentChunk: string
  chunkIndex: number
  metadata: Record<string, unknown>
  similarity?: number
}

export interface AIDailyBriefing {
  date: string
  greeting: string
  focusTasks: { id: string; title: string; priority: string; project?: string }[]
  dueToday: { id: string; title: string; dueTime?: string }[]
  scheduledHabits: { id: string; title: string; category: string; streak: number }[]
  activeGoals: { id: string; title: string; progress: number }[]
  planningSuggestion: string
  mindfulNote: string
}

export interface AIWeeklyReview {
  dateRange: string
  summary: string
  tasksCompletedCount: number
  tasksPendingCount: number
  habitConsistencyRate: number
  topConsistentHabit?: string
  goalProgressHighlights: string[]
  suggestedFocusForNextWeek: string[]
}

export type AIResponseStatus =
  | 'success'
  | 'gemini_key_missing'
  | 'service_unavailable'
  | 'rate_limited'
  | 'context_length_exceeded'
  | 'error'

export interface AIServerResponse<T = unknown> {
  status: AIResponseStatus
  data?: T
  message?: string
  error?: string
}
