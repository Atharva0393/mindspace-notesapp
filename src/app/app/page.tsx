'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Plus,
  Flame,
  CheckSquare,
  Calendar,
  ArrowRight,
  Clock,
  Target,
  Edit2,
  Check,
  Star,
  BookOpen,
  StickyNote,
} from 'lucide-react'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useToast } from '@/components/ui/toast'
import { Habit, HabitLog } from '@/types/habits'
import { Task, Goal } from '@/types/tasks'
import { DailyPlan, TimeBlock } from '@/types/planner'
import { JournalEntry, MoodLog, MOOD_DEFINITIONS } from '@/types/journal'
import { useCurrentUser } from '@/components/layout/user-context'
import {
  getDashboardData,
  saveIntentionDashboardAction,
  toggleHabitDashboardAction,
  toggleTaskDashboardAction,
} from './actions'
import {
  getLocalHabits,
  getLocalHabitLogs,
  saveLocalHabitLogs,
  getLocalTasks,
  saveLocalTasks,
  getLocalDailyPlan,
  saveLocalDailyPlan,
  getLocalTimeBlocks,
  getLocalGoals,
  getLocalJournalEntries,
  getLocalMoodLogs,
} from '@/lib/workspace/store'
import { formatLocalDate, isHabitScheduledOnDate, calculateHabitStreaks } from '@/lib/habits/streaks'
import { createNextOccurrence } from '@/lib/tasks/recurrence'
import { cn } from '@/lib/utils'

export default function DeskOverviewPage() {
  const { toast } = useToast()
  const { displayName } = useCurrentUser()
  const [, startTransition] = useTransition()

  // State
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [todayMood, setTodayMood] = useState<MoodLog | null>(null)
  const [recentJournal, setRecentJournal] = useState<JournalEntry | null>(null)
  const [isCloudSynced, setIsCloudSynced] = useState(false)

  // Intention editing
  const [isEditingIntention, setIsEditingIntention] = useState(false)
  const [intentionInput, setIntentionInput] = useState('')

  const [todayStr, setTodayStr] = useState('2026-11-01')
  const [greeting, setGreeting] = useState('Welcome')
  const [todayFormatted, setTodayFormatted] = useState('Today')

  useEffect(() => {
    const now = new Date()
    const formatted = formatLocalDate(now)
    setTodayStr(formatted)
    setTodayFormatted(
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(now)
    )

    const hour = now.getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Initial Load: Fetch from Supabase or fallback to Local Store
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getDashboardData(todayStr)
        if (res.isAuthenticated) {
          setIsCloudSynced(true)
          setHabits(res.habits)
          setLogs(res.habitLogs)
          setTasks(res.tasks)
          setDailyPlan(res.dailyPlan)
          setTimeBlocks(res.timeBlocks)
          setGoals(res.goals)
          setIntentionInput(res.dailyPlan?.morningIntention || '')
          setRecentJournal(res.recentJournal)
          setTodayMood(res.todayMood)
          return
        }
      } catch (err) {
        console.warn('Dashboard live load error, falling back to local storage:', err)
      }

      // Fallback for unauthenticated visitor or offline mode
      setIsCloudSynced(false)
      const loadedHabits = getLocalHabits()
      const loadedLogs = getLocalHabitLogs()
      const loadedTasks = getLocalTasks()
      const loadedPlan = getLocalDailyPlan()
      const loadedBlocks = getLocalTimeBlocks()
      const loadedGoals = getLocalGoals()
      const loadedJournals = getLocalJournalEntries()
      const loadedMoods = getLocalMoodLogs()

      setHabits(loadedHabits)
      setLogs(loadedLogs)
      setTasks(loadedTasks)
      setDailyPlan(loadedPlan)
      setTimeBlocks(loadedBlocks.filter((b) => b.blockDate === todayStr))
      setGoals(loadedGoals)
      setIntentionInput(loadedPlan?.morningIntention || '')
      setRecentJournal(loadedJournals[0] || null)
      setTodayMood(loadedMoods.find((m) => m.logDate === todayStr) || null)
    }

    loadData()
  }, [todayStr])

  // Scheduled habits for today
  const todayHabits = useMemo(() => {
    return habits
      .filter((h) => !h.isArchived && !h.isPaused)
      .filter((h) => isHabitScheduledOnDate(h, todayStr))
  }, [habits, todayStr])

  // Tasks due today or marked as daily focus
  const todayTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.dueDate === todayStr || t.isDailyFocus
    )
  }, [tasks, todayStr])

  // Daily Progress calculation
  const dailyProgress = useMemo(() => {
    const totalHabits = todayHabits.length
    const completedHabits = todayHabits.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.logDate === todayStr && l.completed)
    ).length

    const totalTasksCount = todayTasks.length
    const completedTasksCount = todayTasks.filter((t) => t.status === 'completed').length

    const totalItems = totalHabits + totalTasksCount
    const completedItems = completedHabits + completedTasksCount

    if (totalItems === 0) return 0
    return Math.round((completedItems / totalItems) * 100)
  }, [todayHabits, logs, todayTasks, todayStr])

  // Handlers
  function handleToggleHabit(habitId: string) {
    const isCompleted = logs.some(
      (l) => l.habitId === habitId && l.logDate === todayStr && l.completed
    )

    let updatedLogs: HabitLog[]
    if (isCompleted) {
      updatedLogs = logs.filter(
        (l) => !(l.habitId === habitId && l.logDate === todayStr)
      )
      toast({
        title: 'Habit unmarked',
        description: 'Today’s completion has been removed.',
      })
    } else {
      const newLog: HabitLog = {
        id: `log-${Date.now()}`,
        userId: 'current-user',
        habitId,
        logDate: todayStr,
        status: 'completed',
        completed: true,
        completedAt: new Date().toISOString(),
      }
      updatedLogs = [...logs, newLog]
      toast({
        title: 'Habit sustained! 🔥',
        description: 'Keep the momentum going strong.',
        variant: 'success',
      })
    }

    setLogs(updatedLogs)

    if (isCloudSynced) {
      startTransition(async () => {
        await toggleHabitDashboardAction(habitId, todayStr, !isCompleted)
      })
    } else {
      saveLocalHabitLogs(updatedLogs)
    }
  }

  function handleToggleTask(task: Task) {
    const isCompleted = task.status === 'completed'
    const newStatus: Task['status'] = isCompleted ? 'todo' : 'completed'

    let nextTask: Task | null = null
    if (!isCompleted && task.recurrence && task.recurrence !== 'none') {
      const nextInput = createNextOccurrence(task)
      if (nextInput) {
        nextTask = {
          id: `task-${Date.now()}`,
          userId: task.userId,
          title: nextInput.title || task.title,
          description: nextInput.description,
          priority: nextInput.priority || 'medium',
          status: 'todo',
          dueDate: nextInput.dueDate,
          dueTime: nextInput.dueTime,
          project: nextInput.project,
          tags: nextInput.tags || [],
          recurrence: nextInput.recurrence || 'none',
          goalId: nextInput.goalId,
          linkedNoteId: nextInput.linkedNoteId,
          isDailyFocus: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    }

    const updatedTasks: Task[] = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    )

    const finalTasks = nextTask ? [nextTask, ...updatedTasks] : updatedTasks
    setTasks(finalTasks)

    if (!isCompleted) {
      toast({
        title: 'Task completed',
        description: `"${task.title}" checked off today.`,
        variant: 'success',
      })
    }

    if (isCloudSynced) {
      startTransition(async () => {
        await toggleTaskDashboardAction(task.id, !isCompleted)
      })
    } else {
      saveLocalTasks(finalTasks)
    }
  }

  function handleSaveIntention() {
    setIsEditingIntention(false)
    const trimmed = intentionInput.trim()
    const updatedPlan: DailyPlan = dailyPlan
      ? {
          ...dailyPlan,
          morningIntention: trimmed,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: `plan-${Date.now()}`,
          userId: 'current-user',
          planDate: todayStr,
          morningIntention: trimmed,
          timeBlocks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

    setDailyPlan(updatedPlan)

    if (isCloudSynced) {
      startTransition(async () => {
        await saveIntentionDashboardAction(todayStr, trimmed)
      })
    } else {
      saveLocalDailyPlan(updatedPlan)
    }

    toast({
      title: 'Guiding Intention saved',
      description: 'Your focus is set for the day.',
      variant: 'success',
    })
  }

  const userGreetingName = displayName && displayName !== 'Guest' ? displayName : 'there'

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <SectionHeader
        title={`${greeting}, ${userGreetingName}`}
        description={`Today is ${todayFormatted}. Your thoughts, habits, and focus blocks are organized with intention.`}
        badge={
          todayMood ? (
            <Link href="/app/journal">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer select-none transition-transform hover:scale-105',
                  MOOD_DEFINITIONS[todayMood.moodLevel].badgeClass
                )}
                title="Click to view journal & mood"
              >
                <span>{MOOD_DEFINITIONS[todayMood.moodLevel].emoji}</span>
                <span>{MOOD_DEFINITIONS[todayMood.moodLevel].label}</span>
                <span className="text-[10px] opacity-75">· Today</span>
              </span>
            </Link>
          ) : (
            <Link href="/app/journal">
              <PastelBadge variant="lavender" dot>
                Check-in Mood
              </PastelBadge>
            </Link>
          )
        }
        action={
          <div className="flex items-center gap-2">
            <Link href="/app/journal">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BookOpen className="w-3.5 h-3.5 text-[#7A281E]" />}
              >
                Journal
              </Button>
            </Link>
            <Link href="/app/calendar">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Daily Timeline
              </Button>
            </Link>
            <Link href="/app/notes">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Note
              </Button>
            </Link>
          </div>
        }
      />

      {/* Daily Intention Banner (Sticky Surface with Progress) */}
      <div className="relative rounded-[20px] bg-white border border-[#E8E6DF] p-6 shadow-xs sticky-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F4EBD5] border border-[#E5D7B7] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#7A6332]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#85817D]">
                  Daily Guiding Intention
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingIntention(!isEditingIntention)}
                  className="text-[11px] text-[#7A6332] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  {isEditingIntention ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditingIntention ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={intentionInput}
                    onChange={(e) => setIntentionInput(e.target.value)}
                    placeholder="What single focus matters most today?"
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] text-[#33312F] outline-none"
                    autoFocus
                  />
                  <Button size="sm" variant="primary" onClick={handleSaveIntention}>
                    Save
                  </Button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#33312F] italic truncate">
                  &ldquo;{dailyPlan?.morningIntention || 'Direct focused energy into high-impact creation with generous whitespace.'}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-36">
              <ProgressBar
                value={dailyProgress}
                color="sage"
                showLabel
                label="Today's Velocity"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Tasks & Today's Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Today's Tasks & Daily Focus */}
        <div className="rounded-2xl bg-white border border-[#E8E6DF] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DF]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#DFEAF2] text-[#1E3345] flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#33312F]">
                Today&apos;s Focus Tasks
              </h2>
            </div>
            <Link
              href="/app/tasks"
              className="text-xs text-[#85817D] hover:text-[#33312F] flex items-center gap-1"
            >
              <span>View all ({tasks.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#85817D] bg-[#FAF9F6] rounded-xl border border-[#E8E6DF]">
                No tasks scheduled for today.{' '}
                <Link href="/app/tasks" className="text-[#33312F] font-semibold underline">
                  Add one
                </Link>
              </div>
            ) : (
              todayTasks.slice(0, 5).map((task) => {
                const isCompleted = task.status === 'completed'
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all',
                      isCompleted
                        ? 'bg-[#FAF9F6] border-[#E8E6DF] opacity-60'
                        : 'bg-white border-[#E8E6DF] hover:border-[#D1CEBF]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0',
                          isCompleted
                            ? 'bg-[#E3EBDD] border-[#CCD9C3] text-[#33312F]'
                            : 'border-[#D1CEBF] bg-[#FAF9F6] hover:border-[#85817D]'
                        )}
                      >
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-xs font-medium block truncate',
                            isCompleted ? 'line-through text-[#85817D]' : 'text-[#33312F]'
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {task.isDailyFocus && (
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                      )}
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#E8E6DF] text-[#85817D]">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Today's Scheduled Habits */}
        <div className="rounded-2xl bg-white border border-[#E8E6DF] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DF]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#F4E4DC] text-[#7A281E] flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#33312F]">
                Today&apos;s Scheduled Habits
              </h2>
            </div>
            <Link
              href="/app/habits"
              className="text-xs text-[#85817D] hover:text-[#33312F] flex items-center gap-1"
            >
              <span>Habit Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {todayHabits.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#85817D] bg-[#FAF9F6] rounded-xl border border-[#E8E6DF]">
                No habits scheduled for today.{' '}
                <Link href="/app/habits" className="text-[#33312F] font-semibold underline">
                  Create a habit
                </Link>
              </div>
            ) : (
              todayHabits.map((habit) => {
                const isCompleted = logs.some(
                  (l) => l.habitId === habit.id && l.logDate === todayStr && l.completed
                )
                const { currentStreak } = calculateHabitStreaks(habit, logs)

                return (
                  <div
                    key={habit.id}
                    className={cn(
                      'flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all',
                      isCompleted
                        ? 'bg-[#E3EBDD]/40 border-[#CCD9C3]'
                        : 'bg-white border-[#E8E6DF] hover:border-[#D1CEBF]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit.id)}
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0',
                          isCompleted
                            ? 'bg-[#33312F] border-[#33312F] text-white'
                            : 'border-[#D1CEBF] bg-[#FAF9F6] hover:border-[#85817D]'
                        )}
                      >
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-xs font-medium block truncate',
                            isCompleted ? 'text-[#33312F]' : 'text-[#33312F]'
                          )}
                        >
                          {habit.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#85817D] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                        <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        {currentStreak}d
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Today's Timeline Schedule Preview */}
      <div className="rounded-2xl bg-white border border-[#E8E6DF] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#E8E1F4] text-[#4B3968] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-[#33312F]">
              Today&apos;s Focus Schedule
            </h2>
          </div>
          <Link
            href="/app/calendar"
            className="text-xs text-[#85817D] hover:text-[#33312F] flex items-center gap-1"
          >
            <span>Open Planner Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {timeBlocks.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#85817D] bg-[#FAF9F6] rounded-xl border border-[#E8E6DF]">
            No focus blocks scheduled for today.{' '}
            <Link href="/app/calendar" className="text-[#33312F] font-semibold underline">
              Block out an hour
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {timeBlocks.slice(0, 4).map((block) => (
              <div
                key={block.id}
                className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-[#85817D]">
                  <span className="font-mono font-medium">
                    {block.startTime} – {block.endTime}
                  </span>
                  {block.isCompleted && (
                    <span className="text-[10px] text-[#283824] bg-[#E3EBDD] px-1 rounded">
                      Done
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#33312F] truncate">
                  {block.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mindful Journal Snippet Card */}
      {recentJournal && (
        <div className="p-4 rounded-2xl bg-[#F4E4DC]/60 border border-[#E7D0C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E7D0C4] flex items-center justify-center shrink-0 text-[#7A281E]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#7A281E] uppercase tracking-wider">
                  Recent Journal Reflection
                </span>
                <span className="text-[11px] text-[#85817D]">· {recentJournal.entryDate}</span>
              </div>
              <p className="text-xs font-semibold text-[#33312F] truncate mt-0.5">
                {recentJournal.title}
              </p>
            </div>
          </div>
          <Link
            href="/app/journal"
            className="text-xs font-semibold text-[#7A281E] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Read Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Module Quick Jump Grid */}
      <div className="pt-2">
        <h3 className="text-sm font-bold tracking-tight text-[#33312F] mb-3">
          Productivity Modules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <Link
            href="/app/notes"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F4EBD5] text-[#7A6332] flex items-center justify-center mb-2">
              <StickyNote className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Notes &amp; Stickies</div>
            <div className="text-[11px] text-[#85817D]">
              Tactile thought board
            </div>
          </Link>

          <Link
            href="/app/habits"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E3EBDD] text-[#283824] flex items-center justify-center mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Habit Studio</div>
            <div className="text-[11px] text-[#85817D]">
              {habits.length} routines tracked
            </div>
          </Link>

          <Link
            href="/app/tasks"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#DFEAF2] text-[#1E3345] flex items-center justify-center mb-2">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Action Matrix</div>
            <div className="text-[11px] text-[#85817D]">
              {tasks.filter((t) => t.status !== 'completed').length} active tasks
            </div>
          </Link>

          <Link
            href="/app/goals"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F0DFE8] text-[#552744] flex items-center justify-center mb-2">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Milestone Goals</div>
            <div className="text-[11px] text-[#85817D]">
              {goals.length} ambitions
            </div>
          </Link>

          <Link
            href="/app/calendar"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F4EBD5] text-[#7A6332] flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Daily Planner</div>
            <div className="text-[11px] text-[#85817D]">
              Timeline &amp; blocks
            </div>
          </Link>

          <Link
            href="/app/journal"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F4E4DC] text-[#7A281E] flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Mindful Journal</div>
            <div className="text-[11px] text-[#85817D]">
              {todayMood ? `${MOOD_DEFINITIONS[todayMood.moodLevel].emoji} ${MOOD_DEFINITIONS[todayMood.moodLevel].label}` : 'Reflect & log mood'}
            </div>
          </Link>

          <Link
            href="/app/ai"
            className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all space-y-1 block"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E8E1F4] text-[#4B3968] flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#33312F]">Gemini Copilot</div>
            <div className="text-[11px] text-[#85817D]">
              AI RAG &amp; answers
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
