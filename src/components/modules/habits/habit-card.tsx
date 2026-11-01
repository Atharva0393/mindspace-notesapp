'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, MoreVertical, SkipForward, Pause, Play, Trash2, Archive } from 'lucide-react'
import { Habit, HabitLog } from '@/types/habits'
import { PASTEL_PALETTE } from '@/lib/constants/colors'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { formatLocalDate, isHabitScheduledOnDate } from '@/lib/habits/streaks'
import { cn } from '@/lib/utils/styling'

export interface HabitCardProps {
  habit: Habit
  logs: HabitLog[]
  onComplete: (habitId: string) => void
  onUndo: (habitId: string) => void
  onSkip: (habitId: string) => void
  onTogglePause: (habitId: string) => void
  onArchive: (habitId: string) => void
  onDelete: (habitId: string) => void
  todayDateStr?: string
}

export function HabitCard({
  habit,
  logs,
  onComplete,
  onUndo,
  onSkip,
  onTogglePause,
  onArchive,
  onDelete,
  todayDateStr,
}: HabitCardProps) {
  const palette = PASTEL_PALETTE[habit.colorTheme] || PASTEL_PALETTE.peach
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const baseDate = React.useMemo(
    () => (currentDate ? new Date(currentDate.getTime()) : new Date(2026, 10, 1)),
    [currentDate]
  )
  const todayStr = todayDateStr || formatLocalDate(baseDate)

  const todayLog = logs.find((l) => l.habitId === habit.id && l.logDate === todayStr)
  const isCompletedToday = todayLog?.status === 'completed' && todayLog.completed
  const isSkippedToday = todayLog?.status === 'skipped'
  const isScheduledToday = isHabitScheduledOnDate(habit, baseDate)

  // Past 7 days bubbles
  const last7Days = React.useMemo(() => {
    const days: { dateStr: string; label: string; isScheduled: boolean; status?: string }[] = []
    const d = new Date(baseDate.getTime())

    for (let i = 6; i >= 0; i--) {
      const cur = new Date(d.getTime())
      cur.setDate(d.getDate() - i)
      const dateStr = formatLocalDate(cur)
      const isSched = isHabitScheduledOnDate(habit, cur)
      const log = logs.find((l) => l.habitId === habit.id && l.logDate === dateStr)

      const weekdayLabel = cur.toLocaleDateString('en-US', { weekday: 'narrow' })
      days.push({
        dateStr,
        label: weekdayLabel,
        isScheduled: isSched,
        status: log?.status,
      })
    }
    return days
  }, [habit, logs, baseDate])

  const menuItems: (DropdownMenuItem | 'divider')[] = [
    isCompletedToday
      ? {
          id: 'undo',
          label: 'Undo Today Completion',
          onClick: () => onUndo(habit.id),
        }
      : {
          id: 'complete',
          label: 'Mark Done for Today',
          icon: <Check className="w-3.5 h-3.5 text-[#3D7535]" />,
          onClick: () => onComplete(habit.id),
        },
    {
      id: 'skip',
      label: isSkippedToday ? 'Un-skip Today' : 'Skip Today (Rest Day)',
      icon: <SkipForward className="w-3.5 h-3.5 text-[#85817D]" />,
      onClick: () => onSkip(habit.id),
    },
    'divider',
    {
      id: 'pause',
      label: habit.isPaused ? 'Resume Habit' : 'Pause Habit',
      icon: habit.isPaused ? (
        <Play className="w-3.5 h-3.5 text-[#3D7535]" />
      ) : (
        <Pause className="w-3.5 h-3.5 text-[#85817D]" />
      ),
      onClick: () => onTogglePause(habit.id),
    },
    {
      id: 'archive',
      label: 'Archive Habit',
      icon: <Archive className="w-3.5 h-3.5 text-[#85817D]" />,
      onClick: () => onArchive(habit.id),
    },
    {
      id: 'delete',
      label: 'Delete Habit',
      icon: <Trash2 className="w-3.5 h-3.5 text-[#A8382B]" />,
      destructive: true,
      onClick: () => onDelete(habit.id),
    },
  ]

  return (
    <div
      className={cn(
        'relative rounded-[18px] border p-5 flex flex-col justify-between transition-all paper-shadow hover:paper-shadow-md select-none',
        palette.bgClass,
        palette.borderClass,
        habit.isPaused && 'opacity-60'
      )}
    >
      {/* Top Header: Category & Context Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PastelBadge variant={habit.colorTheme} size="sm">
            {habit.category}
          </PastelBadge>
          {habit.isPaused && (
            <span className="text-[10px] font-bold uppercase text-[#85817D] bg-black/[0.05] px-1.5 py-0.5 rounded">
              Paused
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-white/70 border border-black/[0.04] text-xs font-bold text-[#33312F]">
            <Flame className="w-3.5 h-3.5 text-[#C95D4A] fill-[#C95D4A]" />
            <span>{habit.currentStreak}d</span>
          </div>

          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-1 rounded-[6px] hover:bg-black/5 text-[#85817D] hover:text-[#33312F] cursor-pointer"
                aria-label="Habit options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>

      {/* Main Body: Title & Intention */}
      <div className="mb-4 flex-1">
        <h3 className="font-bold text-base text-[#33312F] tracking-tight mb-1">
          {habit.title}
        </h3>
        {habit.description && (
          <p className="text-xs text-[#524E4A] line-clamp-2 leading-relaxed">
            {habit.description}
          </p>
        )}
      </div>

      {/* Weekly Visual Bubbles */}
      <div className="pt-3 border-t border-black/[0.05] mb-4">
        <div className="flex items-center justify-between gap-1">
          {last7Days.map((d, idx) => {
            const isCompleted = d.status === 'completed'
            const isSkipped = d.status === 'skipped'
            const isToday = d.dateStr === todayStr

            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isToday ? 'font-bold text-[#33312F]' : 'text-[#85817D]'
                  )}
                >
                  {d.label}
                </span>

                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors border',
                    isCompleted
                      ? 'bg-[#E3EBDD] border-[#D0DEC8] text-[#283824] shadow-2xs'
                      : isSkipped
                      ? 'bg-[#F5F2EB] border-[#EAE6DF] text-[#85817D]'
                      : !d.isScheduled
                      ? 'bg-transparent border-dashed border-black/10 text-transparent'
                      : 'bg-white/60 border-black/10'
                  )}
                >
                  {isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
                  {isSkipped && <span className="text-[9px] font-bold">—</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Big Tactile Completion Button */}
      <div className="pt-1">
        {isCompletedToday ? (
          <button
            type="button"
            onClick={() => onUndo(habit.id)}
            className="w-full py-2.5 px-4 rounded-[12px] bg-[#E3EBDD] border border-[#D0DEC8] text-[#283824] text-xs font-semibold hover:bg-[#D7E3D0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4 text-[#3D7535] stroke-[2.5]" />
            <span>Completed Today!</span>
          </button>
        ) : isSkippedToday ? (
          <button
            type="button"
            onClick={() => onComplete(habit.id)}
            className="w-full py-2.5 px-4 rounded-[12px] bg-white/70 border border-black/[0.06] text-[#85817D] text-xs font-medium hover:bg-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skipped for today (click to mark done)</span>
          </button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete(habit.id)}
            className={cn(
              'w-full py-2.5 px-4 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
              isScheduledToday
                ? 'bg-[#33312F] text-white hover:bg-[#1F1E1D]'
                : 'bg-white/80 text-[#33312F] border border-black/[0.08] hover:bg-white'
            )}
          >
            <Check className="w-4 h-4" />
            <span>{isScheduledToday ? 'Check Off for Today' : 'Extra Session Today'}</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
