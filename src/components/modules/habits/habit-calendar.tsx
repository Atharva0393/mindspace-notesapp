'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Flame } from 'lucide-react'
import { Habit, HabitLog } from '@/types/habits'
import { formatLocalDate, isHabitScheduledOnDate } from '@/lib/habits/streaks'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/styling'

export interface HabitCalendarProps {
  habits: Habit[]
  logs: HabitLog[]
}

export function HabitCalendar({ habits, logs }: HabitCalendarProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all')
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  React.useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const activeHabit = habits.find((h) => h.id === selectedHabitId)

  // Calculate calendar days for the selected month
  const { monthName, year, daysInMonth } = React.useMemo(() => {
    const d = currentDate ? new Date(currentDate.getTime()) : new Date(2026, 10, 1)
    d.setMonth(d.getMonth() + currentMonthOffset)
    const y = d.getFullYear()
    const m = d.getMonth()

    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const totalDays = lastDay.getDate()

    // Prefix empty slots for day-of-week alignment (Mon=0 ... Sun=6)
    const startWeekday = (firstDay.getDay() + 6) % 7

    const days: { dateStr: string; dayNum: number; isFuture: boolean }[] = []
    const todayStr = formatLocalDate(d)

    for (let day = 1; day <= totalDays; day++) {
      const cur = new Date(y, m, day)
      const dateStr = formatLocalDate(cur)
      days.push({
        dateStr,
        dayNum: day,
        isFuture: dateStr > todayStr,
      })
    }

    return {
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
      year: y,
      startOffset: startWeekday,
      daysInMonth: days,
    }
  }, [currentMonthOffset, currentDate])

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-[20px] p-6 shadow-xs select-none">
      {/* Header: Title, Habit Selector, and Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E3EBDD] flex items-center justify-center text-[#283824]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#33312F]">Consistency Heatmap</h3>
            <p className="text-xs text-[#85817D]">
              Visual breakdown of scheduled vs completed days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Habit filter */}
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="h-8 px-2.5 bg-[#FAF9F6] border border-[#EAE6DF] rounded-[9px] text-xs font-semibold text-[#33312F] focus:outline-hidden"
          >
            <option value="all">All Habits Overview</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>

          {/* Month Steppers */}
          <div className="flex items-center border border-[#EAE6DF] rounded-[9px] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setCurrentMonthOffset((prev) => prev - 1)}
              className="p-1 rounded-[6px] hover:bg-[#F5F2EB] text-[#85817D] hover:text-[#33312F] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-[#33312F] min-w-[110px] text-center">
              {monthName} {year}
            </span>
            <button
              type="button"
              disabled={currentMonthOffset >= 0}
              onClick={() => setCurrentMonthOffset((prev) => prev + 1)}
              className="p-1 rounded-[6px] hover:bg-[#F5F2EB] text-[#85817D] hover:text-[#33312F] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday column labels */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[#85817D] mb-2 uppercase tracking-wider">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysInMonth.map((d) => {
          let isCompleted = false
          let isSkipped = false
          let isScheduled = false

          if (activeHabit) {
            isScheduled = isHabitScheduledOnDate(activeHabit, new Date(d.dateStr))
            const l = logs.find((log) => log.habitId === activeHabit.id && log.logDate === d.dateStr)
            isCompleted = l?.status === 'completed' && l.completed
            isSkipped = l?.status === 'skipped'
          } else {
            // Aggregate all habits
            const dayLogs = logs.filter((log) => log.logDate === d.dateStr && log.status === 'completed')
            isCompleted = dayLogs.length > 0
          }

          let bgClass = 'bg-[#FAF9F6] border-black/[0.04] text-[#85817D]'
          let label = `${d.dateStr}: Not scheduled`

          if (d.isFuture) {
            bgClass = 'bg-white border-dashed border-[#EAE6DF] text-[#AFAAA4]'
            label = `${d.dateStr}: Future`
          } else if (isCompleted) {
            bgClass = 'bg-[#E3EBDD] border-[#D0DEC8] text-[#283824] font-bold'
            label = `${d.dateStr}: Completed`
          } else if (isSkipped) {
            bgClass = 'bg-[#F4EBD5] border-[#E7DCBE] text-[#42361D]'
            label = `${d.dateStr}: Rest / Skipped`
          } else if (isScheduled) {
            bgClass = 'bg-[#F7DFD8] border-[#E8C2B8] text-[#7A281E]'
            label = `${d.dateStr}: Missed scheduled day`
          }

          return (
            <Tooltip key={d.dateStr} content={label} position="top">
              <div
                className={cn(
                  'h-9 rounded-[8px] border flex flex-col items-center justify-center text-xs transition-colors cursor-default',
                  bgClass
                )}
              >
                <span>{d.dayNum}</span>
                {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3] -mt-0.5 text-[#3D7535]" />}
              </div>
            </Tooltip>
          )
        })}
      </div>

      {/* Bottom Legend */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-4 mt-4 border-t border-[#EAE6DF] text-[11px] text-[#85817D]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#E3EBDD] border border-[#D0DEC8]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#F4EBD5] border border-[#E7DCBE]" />
          <span>Rest / Skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#F7DFD8] border border-[#E8C2B8]" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#FAF9F6] border border-[#EAE6DF]" />
          <span>Off-schedule</span>
        </div>
      </div>
    </div>
  )
}
