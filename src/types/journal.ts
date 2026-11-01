import { PastelColorKey } from '@/lib/constants/colors'

export type MoodScore = 1 | 2 | 3 | 4 | 5
export type MoodLevel = 'very_low' | 'low' | 'neutral' | 'good' | 'excellent'

export interface MoodLog {
  id: string
  userId: string
  logDate: string // YYYY-MM-DD
  moodScore: MoodScore
  moodLevel: MoodLevel
  emotions: string[]
  note?: string | null
  createdAt: string
  updatedAt: string
}

export interface MoodLogInput {
  logDate: string
  moodScore: MoodScore
  moodLevel: MoodLevel
  emotions?: string[]
  note?: string | null
}

export interface JournalEntry {
  id: string
  userId: string
  entryDate: string // YYYY-MM-DD
  title: string
  content: string
  contentJson?: Record<string, unknown> | null
  moodLevel?: MoodLevel | null
  emotions: string[]
  tags: string[]
  isFavorite: boolean
  colorTheme: PastelColorKey
  templateId?: string | null
  linkedNoteIds: string[]
  gratitudeItems?: string[]
  promptQuestion?: string | null
  createdAt: string
  updatedAt: string
}

export interface JournalEntryCreateInput {
  entryDate?: string
  title: string
  content?: string
  contentJson?: Record<string, unknown> | null
  moodLevel?: MoodLevel | null
  emotions?: string[]
  tags?: string[]
  isFavorite?: boolean
  colorTheme?: PastelColorKey
  templateId?: string | null
  linkedNoteIds?: string[]
  gratitudeItems?: string[]
  promptQuestion?: string | null
}

export interface JournalEntryUpdateInput {
  entryDate?: string
  title?: string
  content?: string
  contentJson?: Record<string, unknown> | null
  moodLevel?: MoodLevel | null
  emotions?: string[]
  tags?: string[]
  isFavorite?: boolean
  colorTheme?: PastelColorKey
  templateId?: string | null
  linkedNoteIds?: string[]
  gratitudeItems?: string[]
  promptQuestion?: string | null
}

export interface JournalTemplate {
  id: string
  title: string
  description: string
  icon: string
  colorTheme: PastelColorKey
  defaultTitle: string
  contentHtml: string
  promptQuestion?: string
  defaultEmotions?: string[]
}

export type JournalFilter = 'all' | 'favorites' | 'by-mood' | 'today'
export type JournalSort = 'newest' | 'oldest' | 'title'
export type JournalViewMode = 'grid' | 'list'

export interface MoodDefinition {
  level: MoodLevel
  score: MoodScore
  label: string
  emoji: string
  colorTheme: PastelColorKey
  bgClass: string
  borderClass: string
  textClass: string
  badgeClass: string
}

export const MOOD_DEFINITIONS: Record<MoodLevel, MoodDefinition> = {
  very_low: {
    level: 'very_low',
    score: 1,
    label: 'Very Low',
    emoji: '🌧️',
    colorTheme: 'powder',
    bgClass: 'bg-[#DFEAF2]',
    borderClass: 'border-[#CBDDE9]',
    textClass: 'text-[#1E3345]',
    badgeClass: 'bg-[#DFEAF2] text-[#1E3345] border-[#CBDDE9]',
  },
  low: {
    level: 'low',
    score: 2,
    label: 'Low',
    emoji: '☁️',
    colorTheme: 'lavender',
    bgClass: 'bg-[#E8E1F4]',
    borderClass: 'border-[#D5CBE5]',
    textClass: 'text-[#4B3968]',
    badgeClass: 'bg-[#E8E1F4] text-[#4B3968] border-[#D5CBE5]',
  },
  neutral: {
    level: 'neutral',
    score: 3,
    label: 'Neutral',
    emoji: '🌤️',
    colorTheme: 'ivory',
    bgClass: 'bg-[#FAF9F6]',
    borderClass: 'border-[#EAE6DF]',
    textClass: 'text-[#33312F]',
    badgeClass: 'bg-[#FAF9F6] text-[#605D58] border-[#EAE6DF]',
  },
  good: {
    level: 'good',
    score: 4,
    label: 'Good',
    emoji: '🌿',
    colorTheme: 'sage',
    bgClass: 'bg-[#E3EBDD]',
    borderClass: 'border-[#CCD9C3]',
    textClass: 'text-[#283824]',
    badgeClass: 'bg-[#E3EBDD] text-[#283824] border-[#CCD9C3]',
  },
  excellent: {
    level: 'excellent',
    score: 5,
    label: 'Excellent',
    emoji: '✨',
    colorTheme: 'peach',
    bgClass: 'bg-[#F4E4DC]',
    borderClass: 'border-[#E7D0C4]',
    textClass: 'text-[#442A20]',
    badgeClass: 'bg-[#F4E4DC] text-[#442A20] border-[#E7D0C4]',
  },
}

export const COMMON_EMOTION_TAGS = [
  'Happy',
  'Calm',
  'Focused',
  'Grateful',
  'Excited',
  'Anxious',
  'Tired',
  'Stressed',
  'Frustrated',
  'Motivated',
  'Peaceful',
  'Reflective',
] as const
