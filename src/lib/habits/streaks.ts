import { Habit, HabitLog } from '@/types/habits'

export interface StreakResult {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  weeklyRate: number // 0 to 100
  monthlyRate: number // 0 to 100
}

/**
 * Returns ISO date string (YYYY-MM-DD) formatted for local timezone
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts JS getDay() (0=Sun, 1=Mon, ..., 6=Sat) to ISO 1=Mon ... 7=Sun
 */
export function getISODayOfWeek(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

/**
 * Checks if a habit is scheduled for a given date
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date | string): boolean {
  if (habit.isPaused || habit.isArchived) return false

  const d = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date
  const isoDay = getISODayOfWeek(d)

  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekdays') return isoDay >= 1 && isoDay <= 5
  if (habit.frequency === 'weekends') return isoDay === 6 || isoDay === 7
  if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
    return habit.scheduleDays && habit.scheduleDays.length > 0
      ? habit.scheduleDays.includes(isoDay)
      : true
  }

  return true
}

/**
 * Smart Schedule-Aware Streak Calculation
 */
export function calculateHabitStreaks(
  habit: Habit,
  logs: HabitLog[],
  referenceDate: Date = new Date()
): StreakResult {
  // Map dateStr -> log
  const logMap = new Map<string, HabitLog>()
  let totalCompletions = 0

  for (const log of logs) {
    if (log.habitId === habit.id) {
      logMap.set(log.logDate, log)
      if (log.status === 'completed' && log.completed) {
        totalCompletions += 1
      }
    }
  }

  const todayStr = formatLocalDate(referenceDate)
  const todayLog = logMap.get(todayStr)
  const isCompletedToday = todayLog?.status === 'completed' && todayLog.completed

  // 1. Calculate Current Streak
  let currentStreak = 0
  const checkDate = new Date(referenceDate)

  // If today is completed, we count today and walk backward
  if (isCompletedToday) {
    currentStreak += 1
    checkDate.setDate(checkDate.getDate() - 1)
  } else {
    // If today is not completed yet, but is scheduled, the streak can still be alive from yesterday
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Walk backward up to 365 days
  for (let i = 0; i < 365; i++) {
    const isScheduled = isHabitScheduledOnDate(habit, checkDate)
    const dateStr = formatLocalDate(checkDate)

    if (!isScheduled) {
      // Rest day! Does not break the streak. Continue walking backward.
      checkDate.setDate(checkDate.getDate() - 1)
      continue
    }

    const log = logMap.get(dateStr)

    if (log && log.status === 'completed' && log.completed) {
      currentStreak += 1
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (log && log.status === 'skipped') {
      // Skipped/excused day does not increment streak, but does not break it
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // Missed scheduled day: streak terminates
      break
    }
  }

  // 2. Calculate Longest Streak by scanning history in chronological order
  let longestStreak = currentStreak
  let runningStreak = 0
  const scanDate = new Date(referenceDate)
  scanDate.setDate(scanDate.getDate() - 180) // scan past 6 months

  while (scanDate <= referenceDate) {
    const isScheduled = isHabitScheduledOnDate(habit, scanDate)
    const dateStr = formatLocalDate(scanDate)

    if (isScheduled) {
      const log = logMap.get(dateStr)
      if (log && log.status === 'completed' && log.completed) {
        runningStreak += 1
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak
        }
      } else if (log && log.status === 'skipped') {
        // preserve runningStreak
      } else {
        runningStreak = 0
      }
    }

    scanDate.setDate(scanDate.getDate() + 1)
  }

  // 3. Weekly & Monthly Consistency Rates
  let past7Scheduled = 0
  let past7Completed = 0
  const wDate = new Date(referenceDate)
  for (let i = 0; i < 7; i++) {
    if (isHabitScheduledOnDate(habit, wDate)) {
      past7Scheduled += 1
      const l = logMap.get(formatLocalDate(wDate))
      if (l && l.status === 'completed') past7Completed += 1
    }
    wDate.setDate(wDate.getDate() - 1)
  }

  let past30Scheduled = 0
  let past30Completed = 0
  const mDate = new Date(referenceDate)
  for (let i = 0; i < 30; i++) {
    if (isHabitScheduledOnDate(habit, mDate)) {
      past30Scheduled += 1
      const l = logMap.get(formatLocalDate(mDate))
      if (l && l.status === 'completed') past30Completed += 1
    }
    mDate.setDate(mDate.getDate() - 1)
  }

  const weeklyRate = past7Scheduled > 0 ? Math.round((past7Completed / past7Scheduled) * 100) : 100
  const monthlyRate = past30Scheduled > 0 ? Math.round((past30Completed / past30Scheduled) * 100) : 100

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, habit.bestStreak || 0),
    totalCompletions,
    weeklyRate,
    monthlyRate,
  }
}
