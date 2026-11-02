'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import { Plus, Flame, Database } from 'lucide-react'
import { Habit, HabitLog, HabitCategory, HabitCreateInput } from '@/types/habits'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { useToast } from '@/components/ui/toast'
import { CreateHabitModal } from '@/components/modules/habits/create-habit-modal'
import { HabitCard } from '@/components/modules/habits/habit-card'
import { HabitCalendar } from '@/components/modules/habits/habit-calendar'
import { HabitAnalytics } from '@/components/modules/habits/habit-analytics'
import { cn } from '@/lib/utils'
import {
  getLocalHabits,
  saveLocalHabits,
  getLocalHabitLogs,
  saveLocalHabitLogs,
} from '@/lib/workspace/store'
import {
  getHabitsData,
  createHabitAction,
  logHabitCompletionAction,
  undoHabitCompletionAction,
  updateHabitAction,
  deleteHabitAction,
} from './actions'
import { formatLocalDate, calculateHabitStreaks } from '@/lib/habits/streaks'

const CATEGORIES: (HabitCategory | 'All')[] = [
  'All',
  'Health',
  'Fitness',
  'Learning',
  'Productivity',
  'Personal',
  'Mindfulness',
]

export default function HabitsPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [todayStr, setTodayStr] = useState('2026-11-01')

  // Initial load
  useEffect(() => {
    setTodayStr(formatLocalDate(new Date()))
    async function load() {
      try {
        const res = await getHabitsData()
        setIsConfigured(res.isConfigured)

        if (res.isAuthenticated) {
          setHabits(res.habits)
          setLogs(res.logs)
        } else {
          setHabits(getLocalHabits())
          setLogs(getLocalHabitLogs())
        }
      } catch {
        setHabits(getLocalHabits())
        setLogs(getLocalHabitLogs())
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Sync to local storage when in offline/preview mode
  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalHabits(habits)
      saveLocalHabitLogs(logs)
    }
  }, [habits, logs, isLoaded, isConfigured])

  // Recalculate streaks dynamically for each habit based on logs
  const enrichedHabits = useMemo(() => {
    return habits.map((h) => {
      const { currentStreak, longestStreak } = calculateHabitStreaks(h, logs)
      return {
        ...h,
        currentStreak,
        bestStreak: longestStreak,
      }
    })
  }, [habits, logs])

  // Filtered habits
  const displayedHabits = useMemo(() => {
    if (selectedCategory === 'All') return enrichedHabits
    return enrichedHabits.filter((h) => h.category === selectedCategory)
  }, [enrichedHabits, selectedCategory])

  // Summary stats
  const completedTodayCount = useMemo(() => {
    return logs.filter((l) => l.logDate === todayStr && l.status === 'completed' && l.completed).length
  }, [logs, todayStr])

  // Handlers
  function handleCreateHabit(input: HabitCreateInput) {
    const newId = `habit-${Date.now()}`
    const newHabit: Habit = {
      id: newId,
      userId: 'default-user',
      title: input.title,
      description: input.description || null,
      category: input.category,
      frequency: input.frequency,
      scheduleDays: input.scheduleDays || [1, 2, 3, 4, 5, 6, 7],
      targetCount: input.targetCount || 1,
      colorTheme: input.colorTheme || 'peach',
      icon: input.icon || 'flame',
      reminderTime: input.reminderTime || null,
      isPaused: false,
      isArchived: false,
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setHabits((prev) => [newHabit, ...prev])

    if (isConfigured) {
      startTransition(async () => {
        const res = await createHabitAction(input)
        if (res.habit) {
          setHabits((prev) => prev.map((h) => (h.id === newId ? res.habit! : h)))
        }
      })
    }

    toast({
      title: 'Habit Created!',
      description: `"${newHabit.title}" has been added to your daily studio.`,
      variant: 'pastel',
    })
  }

  function handleComplete(habitId: string) {
    const target = habits.find((h) => h.id === habitId)
    const existingLogIdx = logs.findIndex((l) => l.habitId === habitId && l.logDate === todayStr)

    const updatedLogs = [...logs]
    if (existingLogIdx >= 0) {
      updatedLogs[existingLogIdx] = {
        ...updatedLogs[existingLogIdx],
        status: 'completed',
        completed: true,
        completedAt: new Date().toISOString(),
      }
    } else {
      updatedLogs.push({
        id: `log-${Date.now()}`,
        userId: 'default-user',
        habitId,
        logDate: todayStr,
        status: 'completed',
        completed: true,
        completedAt: new Date().toISOString(),
      })
    }

    setLogs(updatedLogs)

    if (isConfigured) {
      startTransition(async () => {
        await logHabitCompletionAction(habitId, todayStr, 'completed')
      })
    }

    toast({
      title: 'Habit Completed! 🔥',
      description: `Great work on "${target?.title || 'your habit'}" today.`,
      variant: 'success',
    })
  }

  function handleUndo(habitId: string) {
    const updatedLogs = logs.filter((l) => !(l.habitId === habitId && l.logDate === todayStr))
    setLogs(updatedLogs)

    if (isConfigured) {
      startTransition(async () => {
        await undoHabitCompletionAction(habitId, todayStr)
      })
    }

    toast({
      title: 'Habit Check-off Reverted',
      variant: 'default',
    })
  }

  function handleSkip(habitId: string) {
    const existingLogIdx = logs.findIndex((l) => l.habitId === habitId && l.logDate === todayStr)
    const updatedLogs = [...logs]

    if (existingLogIdx >= 0) {
      if (updatedLogs[existingLogIdx].status === 'skipped') {
        // Toggle unskip
        setLogs(logs.filter((l) => !(l.habitId === habitId && l.logDate === todayStr)))
        return
      }
      updatedLogs[existingLogIdx] = {
        ...updatedLogs[existingLogIdx],
        status: 'skipped',
        completed: false,
      }
    } else {
      updatedLogs.push({
        id: `log-${Date.now()}`,
        userId: 'default-user',
        habitId,
        logDate: todayStr,
        status: 'skipped',
        completed: false,
      })
    }

    setLogs(updatedLogs)

    if (isConfigured) {
      startTransition(async () => {
        await logHabitCompletionAction(habitId, todayStr, 'skipped')
      })
    }

    toast({
      title: 'Habit Skipped (Rest Day)',
      description: 'Your streak will be protected and preserved.',
      variant: 'default',
    })
  }

  function handleTogglePause(habitId: string) {
    const target = habits.find((h) => h.id === habitId)
    if (!target) return
    const newPaused = !target.isPaused

    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, isPaused: newPaused } : h)))

    if (isConfigured) {
      startTransition(async () => {
        await updateHabitAction(habitId, { isPaused: newPaused })
      })
    }

    toast({
      title: newPaused ? 'Habit Paused' : 'Habit Resumed',
      variant: 'default',
    })
  }

  function handleArchive(habitId: string) {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))

    if (isConfigured) {
      startTransition(async () => {
        await updateHabitAction(habitId, { isArchived: true })
      })
    }

    toast({
      title: 'Habit Archived',
      variant: 'default',
    })
  }

  function handleDelete(habitId: string) {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId))

    if (isConfigured) {
      startTransition(async () => {
        await deleteHabitAction(habitId)
      })
    }

    toast({
      title: 'Habit Deleted',
      variant: 'default',
    })
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Configuration Status Notice */}
      {!isConfigured && (
        <div className="p-3.5 rounded-[16px] bg-[#F4EBD5] border border-[#E7DCBE] text-xs text-[#42361D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#B58525] shrink-0" />
            <div>
              <span className="font-bold">Local Workspace Active</span> &bull;{' '}
              <span>
                Habit completion, streaks, and heatmap data are autosaving locally in your browser. Connect Supabase in{' '}
                <code className="bg-[#FAF9F6] px-1 py-0.5 rounded text-[11px]">.env.local</code> for cloud database sync.
              </span>
            </div>
          </div>
          <PastelBadge variant="buttercream" size="sm" className="shrink-0">
            Offline &bull; Ready
          </PastelBadge>
        </div>
      )}

      {/* Header */}
      <SectionHeader
        title="Habit Studio"
        description="Build sustainable daily cadences with tactile completion interactions and schedule-aware streaks."
        badge={
          <PastelBadge variant="sage" dot>
            {completedTodayCount} of {habits.length} Done Today
          </PastelBadge>
        }
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Habit
          </Button>
        }
      />

      {/* Analytics Overview */}
      <HabitAnalytics habits={enrichedHabits} logs={logs} />

      {/* Category Filter Strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-[10px] text-xs font-semibold transition-all border cursor-pointer select-none shrink-0',
                selectedCategory === cat
                  ? 'bg-[#33312F] text-white border-[#33312F] shadow-xs'
                  : 'bg-white border-[#EAE6DF] text-[#5C5956] hover:bg-[#FAF9F6]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {displayedHabits.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-12 text-center shadow-xs">
          <EmptyState
            color="sage"
            icon={<Flame className="w-6 h-6 text-[#283824]" />}
            title={selectedCategory === 'All' ? 'No habits created yet' : `No habits in ${selectedCategory}`}
            description="Start by creating a simple 5-minute habit. Consistency compounds into extraordinary momentum."
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Your First Habit
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logs}
              onComplete={handleComplete}
              onUndo={handleUndo}
              onSkip={handleSkip}
              onTogglePause={handleTogglePause}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Consistency Heatmap & Calendar */}
      <HabitCalendar habits={enrichedHabits} logs={logs} />

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateHabit={handleCreateHabit}
      />
    </div>
  )
}
