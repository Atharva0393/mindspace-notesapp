import { Habit, HabitLog } from '@/types/habits'
import { Task, Goal } from '@/types/tasks'
import { DailyPlan, TimeBlock } from '@/types/planner'
import { JournalEntry, MoodLog } from '@/types/journal'
import {
  AIContextPreferences,
  AIConversation,
  AIMessage,
  AIProposedAction,
  DEFAULT_AI_CONTEXT_PREFERENCES,
} from '@/types/ai'
import { formatLocalDate } from '@/lib/habits/streaks'

const todayStr = formatLocalDate(new Date())
const yesterdayStr = formatLocalDate(new Date(Date.now() - 86400000))
const twoDaysAgoStr = formatLocalDate(new Date(Date.now() - 86400000 * 2))
const threeDaysAgoStr = formatLocalDate(new Date(Date.now() - 86400000 * 3))
const fourDaysAgoStr = formatLocalDate(new Date(Date.now() - 86400000 * 4))
const fiveDaysAgoStr = formatLocalDate(new Date(Date.now() - 86400000 * 5))

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    userId: 'default-user',
    title: 'Morning Meditation',
    description: '10 minutes of silent presence and deep breathing.',
    category: 'Mindfulness',
    frequency: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 7],
    targetCount: 1,
    colorTheme: 'peach',
    icon: 'heart',
    reminderTime: '08:00',
    isPaused: false,
    isArchived: false,
    currentStreak: 21,
    bestStreak: 25,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    userId: 'default-user',
    title: 'Deep Creative Reading',
    description: 'Read 20 pages from physical books or thoughtful articles.',
    category: 'Learning',
    frequency: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 7],
    targetCount: 1,
    colorTheme: 'buttercream',
    icon: 'book',
    reminderTime: '21:00',
    isPaused: false,
    isArchived: false,
    currentStreak: 14,
    bestStreak: 18,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    userId: 'default-user',
    title: 'Strength & Mobility Training',
    description: 'Calisthenics, stretching, or focused gym workout.',
    category: 'Fitness',
    frequency: 'weekdays',
    scheduleDays: [1, 2, 3, 4, 5],
    targetCount: 1,
    colorTheme: 'sage',
    icon: 'flame',
    reminderTime: '17:30',
    isPaused: false,
    isArchived: false,
    currentStreak: 9,
    bestStreak: 12,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'habit-4',
    userId: 'default-user',
    title: 'Hydrate 2 Liters Water',
    description: 'Keep water bottle at the desk throughout the day.',
    category: 'Health',
    frequency: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 7],
    targetCount: 1,
    colorTheme: 'powder',
    icon: 'droplet',
    isPaused: false,
    isArchived: false,
    currentStreak: 30,
    bestStreak: 30,
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_HABIT_LOGS: HabitLog[] = [
  // Hydrate completed today
  {
    id: 'log-h4-today',
    userId: 'default-user',
    habitId: 'habit-4',
    logDate: todayStr,
    status: 'completed',
    completed: true,
    completedAt: new Date().toISOString(),
  },
  // Meditation completed yesterday and 2 days ago
  {
    id: 'log-h1-yest',
    userId: 'default-user',
    habitId: 'habit-1',
    logDate: yesterdayStr,
    status: 'completed',
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'log-h1-2d',
    userId: 'default-user',
    habitId: 'habit-1',
    logDate: twoDaysAgoStr,
    status: 'completed',
    completed: true,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  // Reading completed yesterday
  {
    id: 'log-h2-yest',
    userId: 'default-user',
    habitId: 'habit-2',
    logDate: yesterdayStr,
    status: 'completed',
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'default-user',
    goalId: 'goal-1',
    goalTitle: 'Launch Notepad.ai v1.0',
    title: 'Review Phase 04 Habit Studio & Time-blocking',
    description: 'Ensure smooth interconnections between habits, tasks, and daily planner.',
    priority: 'urgent',
    status: 'todo',
    dueDate: todayStr,
    dueTime: '11:00',
    project: 'Productivity Suite',
    tags: ['sprint', 'v1'],
    recurrence: 'none',
    isDailyFocus: true,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    userId: 'default-user',
    goalId: 'goal-1',
    goalTitle: 'Launch Notepad.ai v1.0',
    title: 'Inspect database index query plans with pgvector',
    description: 'Check HNSW cosine distance vector index performance for Phase 06 readiness.',
    priority: 'high',
    status: 'todo',
    dueDate: todayStr,
    dueTime: '15:00',
    project: 'Database Optimization',
    tags: ['pgvector', 'sql'],
    recurrence: 'none',
    isDailyFocus: true,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    userId: 'default-user',
    goalId: 'goal-2',
    goalTitle: 'Daily Mindfulness & Health Streak',
    title: 'Hydrate before morning sprint',
    description: 'Drink a full glass of water and stretch for 5 minutes.',
    priority: 'medium',
    status: 'completed',
    dueDate: todayStr,
    dueTime: '08:30',
    project: 'Wellness',
    tags: ['health'],
    recurrence: 'daily',
    isDailyFocus: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    userId: 'default-user',
    goalId: 'goal-1',
    goalTitle: 'Launch Notepad.ai v1.0',
    title: 'Read Don Norman: The Design of Everyday Things',
    description: 'Study chapter on natural mappings and affordances.',
    priority: 'low',
    status: 'todo',
    dueDate: formatLocalDate(new Date(Date.now() + 86400000)),
    dueTime: '20:00',
    project: 'Design Exploration',
    tags: ['reading', 'ux'],
    recurrence: 'none',
    isDailyFocus: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    userId: 'default-user',
    title: 'Launch Notepad.ai v1.0',
    description: 'Deliver an intentional, beautifully organized personal workspace combining intelligent notes, habits, planner, and Gemini copilot.',
    category: 'Career',
    colorTheme: 'powder',
    targetDate: '2026-12-15',
    progress: 60,
    milestones: [
      { id: 'm1', title: 'Complete design tokens & auth foundation', isCompleted: true },
      { id: 'm2', title: 'Implement intelligent notes & rich editor', isCompleted: true },
      { id: 'm3', title: 'Ship habit studio, task matrix & daily planner', isCompleted: true },
      { id: 'm4', title: 'Integrate Gemini RAG knowledge engine', isCompleted: false },
      { id: 'm5', title: 'End-to-end verification & production launch', isCompleted: false },
    ],
    linkedNoteIds: ['note-1', 'note-2'],
    isCompleted: false,
    tasksCount: 3,
    completedTasksCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    userId: 'default-user',
    title: 'Mindfulness & Physical Vitality',
    description: 'Cultivate sustained mental clarity and physical endurance through daily mindful habits.',
    category: 'Health',
    colorTheme: 'sage',
    targetDate: '2026-11-30',
    progress: 75,
    milestones: [
      { id: 'm6', title: 'Achieve 21-day meditation streak', isCompleted: true },
      { id: 'm7', title: 'Workout 4x weekly for 3 consecutive weeks', isCompleted: true },
      { id: 'm8', title: 'Reach 30-day hydration streak', isCompleted: true },
    ],
    linkedNoteIds: ['note-3'],
    isCompleted: false,
    tasksCount: 1,
    completedTasksCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_TIME_BLOCKS: TimeBlock[] = [
  {
    id: 'tb-1',
    userId: 'default-user',
    title: 'Morning Focus: Habit Studio & Task Matrix',
    blockDate: todayStr,
    startTime: '09:00',
    endTime: '10:30',
    colorTheme: 'powder',
    notes: 'Implement schedule-aware streaks and task recurrence algorithms.',
    isCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-2',
    userId: 'default-user',
    title: 'Daily Planner & Timeline Scheduling',
    blockDate: todayStr,
    startTime: '11:00',
    endTime: '12:30',
    colorTheme: 'sage',
    taskId: 'task-1',
    taskTitle: 'Review Phase 04 Habit Studio & Time-blocking',
    notes: 'Connect task tray to hourly time blocks with subtle hover indicators.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-3',
    userId: 'default-user',
    title: 'Database Query Optimization & pgvector',
    blockDate: todayStr,
    startTime: '14:30',
    endTime: '16:00',
    colorTheme: 'buttercream',
    taskId: 'task-2',
    taskTitle: 'Inspect database index query plans with pgvector',
    notes: 'Verify RLS isolation and cosine distance vector search procedure.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-4',
    userId: 'default-user',
    title: 'Evening Reflection & Mindful Review',
    blockDate: todayStr,
    startTime: '17:30',
    endTime: '18:15',
    colorTheme: 'peach',
    notes: 'Record accomplishments, what went well, and intentions for tomorrow.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
]

export const INITIAL_DAILY_PLAN: DailyPlan = {
  id: 'plan-today',
  userId: 'default-user',
  planDate: todayStr,
  morningIntention: 'Focus on clean interconnections across habits, tasks, and daily timeline with generous whitespace.',
  eveningReflection: 'Shipped comprehensive productivity suite with schedule-aware streaks and responsive timeline.',
  dailyReflection: {
    whatWentWell: 'The tactile pastel aesthetic feels very calm, delightful, and natural to interact with.',
    whatWasDifficult: 'Handling complex schedule-aware rest days for weekday habits.',
    whatAccomplished: 'Built Habit Studio, Task Management, Goals, and Daily Planner.',
    improveTomorrow: 'Prepare seamless Gemini RAG embeddings in Phase 06.',
  },
  timeBlocks: INITIAL_TIME_BLOCKS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const INITIAL_MOOD_LOGS: MoodLog[] = [
  {
    id: 'mood-today',
    userId: 'default-user',
    logDate: todayStr,
    moodScore: 5,
    moodLevel: 'excellent',
    emotions: ['Grateful', 'Focused', 'Calm'],
    note: 'Shipped Habit Studio, Task Management, Goals and Daily Planner with calm pastel surfaces.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mood-yesterday',
    userId: 'default-user',
    logDate: yesterdayStr,
    moodScore: 4,
    moodLevel: 'good',
    emotions: ['Happy', 'Focused'],
    note: 'Deep focus day in the studio writing algorithms for schedule-aware streaks.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mood-2d',
    userId: 'default-user',
    logDate: twoDaysAgoStr,
    moodScore: 4,
    moodLevel: 'good',
    emotions: ['Calm', 'Motivated'],
    note: 'Refined semantic color tokens and responsive typography.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mood-3d',
    userId: 'default-user',
    logDate: threeDaysAgoStr,
    moodScore: 3,
    moodLevel: 'neutral',
    emotions: ['Reflective', 'Tired'],
    note: 'Resting and recharging after intense initial architecture design.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'mood-4d',
    userId: 'default-user',
    logDate: fourDaysAgoStr,
    moodScore: 5,
    moodLevel: 'excellent',
    emotions: ['Excited', 'Grateful'],
    note: 'Breakthrough on rich-text TipTap integration with autosave.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'mood-5d',
    userId: 'default-user',
    logDate: fiveDaysAgoStr,
    moodScore: 4,
    moodLevel: 'good',
    emotions: ['Peaceful', 'Happy'],
    note: 'Morning walk in the garden; creative clarity.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    userId: 'default-user',
    entryDate: todayStr,
    title: 'The Architecture of a Peaceful Digital Desk',
    content: `<p>There is a profound psychological shift that occurs when your digital workspace mimics the tranquility of tactile stationery. Warm ivory paper, peach blush sticky notes, and generous whitespace invite presence rather than urgency.</p><p>Today, connecting habits, tasks, and time blocks into one cohesive flow felt completely natural. It feels less like managing a todo list and more like tending to a well-kept garden.</p>`,
    moodLevel: 'excellent',
    emotions: ['Grateful', 'Calm', 'Focused'],
    tags: ['mindfulness', 'design', 'craft'],
    isFavorite: true,
    colorTheme: 'peach',
    templateId: 'daily-journal',
    linkedNoteIds: ['note-1'],
    gratitudeItems: [
      'Morning stillness before opening laptop',
      'The tactile rhythm of writing clean algorithms',
      'Tea by the sunny window',
    ],
    promptQuestion: 'What felt memorable or meaningful about today?',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-2',
    userId: 'default-user',
    entryDate: yesterdayStr,
    title: 'Evening Review: Flow State & Tactile Interfaces',
    content: `<p>Spent three consecutive hours in an uninterrupted flow state. What made the difference was protecting the calendar blocks and treating rest days with respect.</p><h3>What Went Well</h3><p>Schedule-aware streaks proved that productivity should accommodate real human life, not rigid algorithmic pressure.</p>`,
    moodLevel: 'good',
    emotions: ['Peaceful', 'Reflective'],
    tags: ['reflection', 'flow'],
    isFavorite: false,
    colorTheme: 'lavender',
    templateId: 'evening-reflection',
    linkedNoteIds: [],
    promptQuestion: 'What went well today?',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'entry-3',
    userId: 'default-user',
    entryDate: threeDaysAgoStr,
    title: 'Three Graces: Stillness, Sunlight, and Craft',
    content: `<p>Taking a pause to appreciate the abundance present in ordinary moments:</p><p>1. The cool morning air and the scent of freshly brewed coffee.</p><p>2. A sudden creative insight regarding pastel color balance.</p><p>3. Feeling healthy, rested, and deeply engaged with purposeful work.</p>`,
    moodLevel: 'good',
    emotions: ['Grateful', 'Happy'],
    tags: ['gratitude', 'presence'],
    isFavorite: true,
    colorTheme: 'pink',
    templateId: 'gratitude-journal',
    linkedNoteIds: [],
    gratitudeItems: ['Morning air and coffee', 'Pastel aesthetic balance', 'Health and vitality'],
    promptQuestion: 'What three distinct gifts are you thankful for?',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'entry-4',
    userId: 'default-user',
    entryDate: fiveDaysAgoStr,
    title: 'Stream of Consciousness: Designing for Presence',
    content: `<p>Why do most enterprise SaaS dashboards feel so exhausting? It is the neon status indicators, the dense borders, the incessant notifications. By stripping away that noise, the application becomes an extension of thought.</p>`,
    moodLevel: 'neutral',
    emotions: ['Reflective'],
    tags: ['philosophy', 'minimalism'],
    isFavorite: false,
    colorTheme: 'ivory',
    templateId: 'free-writing',
    linkedNoteIds: [],
    promptQuestion: 'What is currently occupying your mind?',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

// Local Storage Keys
const LS_HABITS = 'notepad_ai_habits_v1'
const LS_HABIT_LOGS = 'notepad_ai_habit_logs_v1'
const LS_TASKS = 'notepad_ai_tasks_v1'
const LS_GOALS = 'notepad_ai_goals_v1'
const LS_TIME_BLOCKS = 'notepad_ai_time_blocks_v1'
const LS_DAILY_PLAN = 'notepad_ai_daily_plan_v1'
const LS_JOURNAL_ENTRIES = 'notepad_ai_journal_entries_v1'
const LS_MOOD_LOGS = 'notepad_ai_mood_logs_v1'

// Server-side in-memory fallbacks when window is undefined (e.g. Node execution or Server Actions)
let memoryHabits: Habit[] = [...INITIAL_HABITS]
let memoryHabitLogs: HabitLog[] = [...INITIAL_HABIT_LOGS]
let memoryTasks: Task[] = [...INITIAL_TASKS]
let memoryGoals: Goal[] = [...INITIAL_GOALS]
let memoryTimeBlocks: TimeBlock[] = [...INITIAL_TIME_BLOCKS]
let memoryDailyPlan: DailyPlan = { ...INITIAL_DAILY_PLAN }
let memoryJournalEntries: JournalEntry[] = [...INITIAL_JOURNAL_ENTRIES]
let memoryMoodLogs: MoodLog[] = [...INITIAL_MOOD_LOGS]

export function getLocalHabits(): Habit[] {
  if (typeof window === 'undefined') return memoryHabits
  try {
    const raw = localStorage.getItem(LS_HABITS)
    if (!raw) {
      localStorage.setItem(LS_HABITS, JSON.stringify(INITIAL_HABITS))
      return INITIAL_HABITS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_HABITS
  }
}

export function saveLocalHabits(habits: Habit[]): void {
  memoryHabits = habits
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_HABITS, JSON.stringify(habits))
  } catch (e) {
    console.error('Error saving local habits:', e)
  }
}

export function getLocalHabitLogs(): HabitLog[] {
  if (typeof window === 'undefined') return memoryHabitLogs
  try {
    const raw = localStorage.getItem(LS_HABIT_LOGS)
    if (!raw) {
      localStorage.setItem(LS_HABIT_LOGS, JSON.stringify(INITIAL_HABIT_LOGS))
      return INITIAL_HABIT_LOGS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_HABIT_LOGS
  }
}

export function saveLocalHabitLogs(logs: HabitLog[]): void {
  memoryHabitLogs = logs
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_HABIT_LOGS, JSON.stringify(logs))
  } catch (e) {
    console.error('Error saving local habit logs:', e)
  }
}

export function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return memoryTasks
  try {
    const raw = localStorage.getItem(LS_TASKS)
    if (!raw) {
      localStorage.setItem(LS_TASKS, JSON.stringify(INITIAL_TASKS))
      return INITIAL_TASKS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_TASKS
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  memoryTasks = tasks
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_TASKS, JSON.stringify(tasks))
  } catch (e) {
    console.error('Error saving local tasks:', e)
  }
}

export function getLocalGoals(): Goal[] {
  if (typeof window === 'undefined') return memoryGoals
  try {
    const raw = localStorage.getItem(LS_GOALS)
    if (!raw) {
      localStorage.setItem(LS_GOALS, JSON.stringify(INITIAL_GOALS))
      return INITIAL_GOALS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_GOALS
  }
}

export function saveLocalGoals(goals: Goal[]): void {
  memoryGoals = goals
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_GOALS, JSON.stringify(goals))
  } catch (e) {
    console.error('Error saving local goals:', e)
  }
}

export function getLocalTimeBlocks(): TimeBlock[] {
  if (typeof window === 'undefined') return memoryTimeBlocks
  try {
    const raw = localStorage.getItem(LS_TIME_BLOCKS)
    if (!raw) {
      localStorage.setItem(LS_TIME_BLOCKS, JSON.stringify(INITIAL_TIME_BLOCKS))
      return INITIAL_TIME_BLOCKS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_TIME_BLOCKS
  }
}

export function saveLocalTimeBlocks(blocks: TimeBlock[]): void {
  memoryTimeBlocks = blocks
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_TIME_BLOCKS, JSON.stringify(blocks))
  } catch (e) {
    console.error('Error saving local time blocks:', e)
  }
}

export function getLocalDailyPlan(): DailyPlan {
  if (typeof window === 'undefined') return memoryDailyPlan
  try {
    const raw = localStorage.getItem(LS_DAILY_PLAN)
    if (!raw) {
      localStorage.setItem(LS_DAILY_PLAN, JSON.stringify(INITIAL_DAILY_PLAN))
      return INITIAL_DAILY_PLAN
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_DAILY_PLAN
  }
}

export function saveLocalDailyPlan(plan: DailyPlan): void {
  memoryDailyPlan = plan
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_DAILY_PLAN, JSON.stringify(plan))
  } catch (e) {
    console.error('Error saving local daily plan:', e)
  }
}

export function getLocalJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return memoryJournalEntries
  try {
    const raw = localStorage.getItem(LS_JOURNAL_ENTRIES)
    if (!raw) {
      localStorage.setItem(LS_JOURNAL_ENTRIES, JSON.stringify(INITIAL_JOURNAL_ENTRIES))
      return INITIAL_JOURNAL_ENTRIES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_JOURNAL_ENTRIES
  }
}

export function saveLocalJournalEntries(entries: JournalEntry[]): void {
  memoryJournalEntries = entries
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_JOURNAL_ENTRIES, JSON.stringify(entries))
  } catch (e)
    {
    console.error('Error saving local journal entries:', e)
  }
}

export function getLocalMoodLogs(): MoodLog[] {
  if (typeof window === 'undefined') return memoryMoodLogs
  try {
    const raw = localStorage.getItem(LS_MOOD_LOGS)
    if (!raw) {
      localStorage.setItem(LS_MOOD_LOGS, JSON.stringify(INITIAL_MOOD_LOGS))
      return INITIAL_MOOD_LOGS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_MOOD_LOGS
  }
}

export function saveLocalMoodLogs(logs: MoodLog[]): void {
  memoryMoodLogs = logs
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_MOOD_LOGS, JSON.stringify(logs))
  } catch (e) {
    console.error('Error saving local mood logs:', e)
  }
}

export function getTodayMoodLog(todayDateString?: string): MoodLog | null {
  const targetDate = todayDateString || todayStr
  const logs = getLocalMoodLogs()
  return logs.find((l) => l.logDate === targetDate) || null
}

export function saveTodayMoodLog(moodLog: MoodLog): void {
  const logs = getLocalMoodLogs()
  const existsIndex = logs.findIndex((l) => l.logDate === moodLog.logDate)
  let updated: MoodLog[]
  if (existsIndex >= 0) {
    updated = logs.map((l, idx) => (idx === existsIndex ? moodLog : l))
  } else {
    updated = [moodLog, ...logs]
  }
  saveLocalMoodLogs(updated)
}

// ==========================================
// PHASE 06: AI COMPANION & CONTEXT STORAGE
// ==========================================

export const LS_AI_PREFERENCES = 'notesapp_ai_preferences_v1'
export const LS_AI_CONVERSATIONS = 'notesapp_ai_conversations_v1'
export const LS_AI_MESSAGES = 'notesapp_ai_messages_v1'

export const INITIAL_AI_PREFERENCES: AIContextPreferences = {
  userId: 'default-user',
  ...DEFAULT_AI_CONTEXT_PREFERENCES,
}

export const INITIAL_AI_CONVERSATIONS: AIConversation[] = [
  {
    id: 'conv-welcome',
    userId: 'default-user',
    title: 'Workspace Orientation & Focus',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessagePreview: 'Welcome to your Gemini AI workspace copilot.',
  },
]

export const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'msg-welcome-1',
    conversationId: 'conv-welcome',
    role: 'assistant',
    content: `Hello! I am your **Gemini Workspace Companion** for Notepad.ai.

I can help you reflect on your projects, plan your day, summarize goals, and find connections across your notes.

### Active Workspace Knowledge:
- **Notes & Folders:** Enabled
- **Tasks & Priorities:** Enabled
- **Habits & Streaks:** Enabled
- **Goals & Milestones:** Enabled
- **Daily Planner:** Enabled
- **Mindful Journal:** 🔒 *Disabled by default for your privacy* (you can enable it anytime in Context Settings)

Feel free to ask me questions like:
- *"What are my highest priority tasks today?"*
- *"Summarize my progress on active goals."*
- *"Help me schedule focus time tomorrow morning."*`,
    createdAt: new Date().toISOString(),
  },
]

let memoryAIPreferences: AIContextPreferences = { ...INITIAL_AI_PREFERENCES }
let memoryAIConversations: AIConversation[] = [...INITIAL_AI_CONVERSATIONS]
let memoryAIMessages: AIMessage[] = [...INITIAL_AI_MESSAGES]

export function getLocalAIPreferences(): AIContextPreferences {
  if (typeof window === 'undefined') return memoryAIPreferences
  try {
    const raw = localStorage.getItem(LS_AI_PREFERENCES)
    if (!raw) {
      localStorage.setItem(LS_AI_PREFERENCES, JSON.stringify(INITIAL_AI_PREFERENCES))
      return INITIAL_AI_PREFERENCES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_AI_PREFERENCES
  }
}

export function saveLocalAIPreferences(prefs: AIContextPreferences): void {
  memoryAIPreferences = prefs
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_AI_PREFERENCES, JSON.stringify(prefs))
  } catch (e) {
    console.error('Error saving local AI preferences:', e)
  }
}

export function getLocalAIConversations(): AIConversation[] {
  if (typeof window === 'undefined') return memoryAIConversations
  try {
    const raw = localStorage.getItem(LS_AI_CONVERSATIONS)
    if (!raw) {
      localStorage.setItem(LS_AI_CONVERSATIONS, JSON.stringify(INITIAL_AI_CONVERSATIONS))
      return INITIAL_AI_CONVERSATIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_AI_CONVERSATIONS
  }
}

export function saveLocalAIConversations(convs: AIConversation[]): void {
  memoryAIConversations = convs
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_AI_CONVERSATIONS, JSON.stringify(convs))
  } catch (e) {
    console.error('Error saving local AI conversations:', e)
  }
}

export function getLocalAIMessages(conversationId?: string): AIMessage[] {
  if (typeof window === 'undefined') {
    if (!conversationId) return memoryAIMessages
    return memoryAIMessages.filter((m) => m.conversationId === conversationId)
  }
  try {
    const raw = localStorage.getItem(LS_AI_MESSAGES)
    const allMessages: AIMessage[] = raw ? JSON.parse(raw) : INITIAL_AI_MESSAGES
    if (!conversationId) return allMessages
    return allMessages.filter((m) => m.conversationId === conversationId)
  } catch {
    return INITIAL_AI_MESSAGES
  }
}

export function saveLocalAIMessage(message: AIMessage): void {
  memoryAIMessages = [...memoryAIMessages, message]
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LS_AI_MESSAGES)
    const allMessages: AIMessage[] = raw ? JSON.parse(raw) : INITIAL_AI_MESSAGES
    const updated = [...allMessages, message]
    localStorage.setItem(LS_AI_MESSAGES, JSON.stringify(updated))
  } catch (e) {
    console.error('Error saving local AI message:', e)
  }
}

export function updateLocalAIMessageAction(
  messageId: string,
  updatedAction: AIProposedAction
): void {
  memoryAIMessages = memoryAIMessages.map((msg) =>
    msg.id === messageId ? { ...msg, proposedAction: updatedAction } : msg
  )
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LS_AI_MESSAGES)
    const allMessages: AIMessage[] = raw ? JSON.parse(raw) : INITIAL_AI_MESSAGES
    const updated = allMessages.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, proposedAction: updatedAction }
      }
      return msg
    })
    localStorage.setItem(LS_AI_MESSAGES, JSON.stringify(updated))
  } catch (e) {
    console.error('Error updating local AI message action:', e)
  }
}

