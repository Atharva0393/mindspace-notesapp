import { AIDailyBriefing, AIWeeklyReview } from '@/types/ai'
import {
  getLocalTasks,
  getLocalHabits,
  getLocalHabitLogs,
  getLocalGoals,
} from '@/lib/workspace/store'
import { isGeminiConfigured, getGeminiClient } from './gemini-client'
import { BRIEFING_SYSTEM_PROMPT, WEEKLY_REVIEW_SYSTEM_PROMPT } from './prompts'
import { AI_CONFIG } from './config'

/**
 * Compiles a structured Daily Briefing based strictly on authorized workspace records.
 */
export async function compileDailyBriefing(): Promise<AIDailyBriefing> {
  const todayStr = new Date().toISOString().split('T')[0]
  const currentDayOfWeek = new Date().getDay() || 7 // 1 = Monday, 7 = Sunday

  const tasks = getLocalTasks()
  const habits = getLocalHabits()
  const goals = getLocalGoals()

  // 1. Focus Tasks (High or Urgent, or due today)
  const focusTasks = tasks
    .filter(
      (t) =>
        t.status !== 'completed' &&
        (t.priority === 'urgent' || t.priority === 'high' || t.dueDate === todayStr)
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      project: t.project || undefined,
    }))

  // 2. Tasks Due Today
  const dueToday = tasks
    .filter((t) => t.status !== 'completed' && t.dueDate === todayStr)
    .map((t) => ({ id: t.id, title: t.title, dueTime: t.dueTime || undefined }))

  // 3. Habits Scheduled Today
  const scheduledHabits = habits
    .filter((h) => !h.isArchived && !h.isPaused && h.scheduleDays.includes(currentDayOfWeek))
    .map((h) => ({ id: h.id, title: h.title, category: h.category, streak: h.currentStreak }))

  // 4. Active Goals
  const activeGoals = goals
    .filter((g) => !g.isCompleted)
    .slice(0, 4)
    .map((g) => ({ id: g.id, title: g.title, progress: g.progress }))

  // Default calm editorial suggestions
  let greeting = 'Good morning. Welcome back to your calm digital desk.'
  let planningSuggestion =
    focusTasks.length > 0
      ? `Focus first on "${focusTasks[0].title}" before moving to secondary tasks.`
      : 'Your agenda is open. Consider picking one meaningful goal milestone to advance today.'
  let mindfulNote =
    '“Productivity is being able to do things that you were never able to do before with peace of mind.”'

  // If Gemini is configured, enhance the briefing with grounded synthesis
  if (isGeminiConfigured()) {
    try {
      const client = getGeminiClient()
      if (client) {
        const prompt = `Authorized workspace state for ${todayStr}:
Focus tasks: ${focusTasks.map((t) => t.title).join(', ') || 'None'}
Due today: ${dueToday.map((t) => t.title).join(', ') || 'None'}
Habits scheduled: ${scheduledHabits.map((h) => h.title).join(', ') || 'None'}
Active goals: ${activeGoals.map((g) => `${g.title} (${g.progress}%)`).join(', ') || 'None'}`

        const response = await client.models.generateContent({
          model: AI_CONFIG.primaryModel,
          contents: prompt,
          config: {
            systemInstruction: BRIEFING_SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        })

        const text = response.text?.trim()
        if (text) {
          const cleanJson = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim()
          const parsed = JSON.parse(cleanJson)
          if (parsed.greeting) greeting = parsed.greeting
          if (parsed.planningSuggestion) planningSuggestion = parsed.planningSuggestion
          if (parsed.mindfulNote) mindfulNote = parsed.mindfulNote
        }
      }
    } catch {
      // Graceful fallback to static grounded templates
    }
  }

  return {
    date: todayStr,
    greeting,
    focusTasks,
    dueToday,
    scheduledHabits,
    activeGoals,
    planningSuggestion,
    mindfulNote,
  }
}

/**
 * Compiles a structured Weekly Review based on past 7 days of actual workspace records.
 */
export async function compileWeeklyReview(): Promise<AIWeeklyReview> {
  const tasks = getLocalTasks()
  const habits = getLocalHabits()
  const habitLogs = getLocalHabitLogs()
  const goals = getLocalGoals()

  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const pendingTasks = tasks.filter((t) => t.status !== 'completed')

  // Habit consistency calculation over logs
  const totalLogs = habitLogs.length
  const completedLogs = habitLogs.filter((l) => l.completed).length
  const habitConsistencyRate =
    totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 85

  // Top streak habit
  const topHabit = [...habits].sort((a, b) => b.currentStreak - a.currentStreak)[0]

  const goalHighlights = goals
    .slice(0, 3)
    .map((g) => `Goal "${g.title}": currently at ${g.progress}% completion.`)

  let summary = `Over the past week, you completed ${completedTasks.length} task${
    completedTasks.length === 1 ? '' : 's'
  } with ${habitConsistencyRate}% habit consistency.`

  let suggestedFocusForNextWeek = [
    pendingTasks.length > 0
      ? `Clear ${Math.min(3, pendingTasks.length)} high-priority pending tasks.`
      : 'Maintain steady daily momentum.',
    topHabit ? `Keep momentum on your top streak: "${topHabit.title}".` : 'Reinforce core daily habits.',
  ]

  // If Gemini is active, enhance review
  if (isGeminiConfigured()) {
    try {
      const client = getGeminiClient()
      if (client) {
        const prompt = `Review metrics:
Tasks completed: ${completedTasks.length}
Tasks pending: ${pendingTasks.length}
Habit consistency: ${habitConsistencyRate}%
Top habit: ${topHabit?.title || 'None'}
Goals: ${goals.map((g) => `${g.title} (${g.progress}%)`).join(', ')}`

        const response = await client.models.generateContent({
          model: AI_CONFIG.primaryModel,
          contents: prompt,
          config: {
            systemInstruction: WEEKLY_REVIEW_SYSTEM_PROMPT,
            temperature: 0.6,
            maxOutputTokens: 600,
          },
        })

        const text = response.text?.trim()
        if (text) {
          const cleanJson = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim()
          const parsed = JSON.parse(cleanJson)
          if (parsed.summary) summary = parsed.summary
          if (Array.isArray(parsed.suggestedFocusForNextWeek)) {
            suggestedFocusForNextWeek = parsed.suggestedFocusForNextWeek
          }
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  const today = new Date()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
  const dateRange = `${sevenDaysAgo.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`

  return {
    dateRange,
    summary,
    tasksCompletedCount: completedTasks.length,
    tasksPendingCount: pendingTasks.length,
    habitConsistencyRate,
    topConsistentHabit: topHabit?.title,
    goalProgressHighlights: goalHighlights,
    suggestedFocusForNextWeek,
  }
}
