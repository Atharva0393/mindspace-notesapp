'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { MoodLog, MoodLevel, MOOD_DEFINITIONS } from '@/types/journal'
import { formatLocalDate } from '@/lib/habits/streaks'
import { cn } from '@/lib/utils'

export interface MoodCalendarProps {
  moodLogs: MoodLog[]
  selectedDate: string
  onSelectDate: (dateStr: string) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MoodCalendar({
  moodLogs,
  selectedDate,
  onSelectDate,
}: MoodCalendarProps) {
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const baseDate = useMemo(
    () => (currentDate ? new Date(currentDate.getTime()) : new Date(2026, 10, 1)),
    [currentDate]
  )

  const todayStr = useMemo(() => formatLocalDate(baseDate), [baseDate])

  // Map mood logs by date
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodLog>()
    moodLogs.forEach((m) => {
      map.set(m.logDate, m)
    })
    return map
  }, [moodLogs])

  // Compute month layout
  const { monthName, year, daysInMonth, startWeekday } = useMemo(() => {
    const d = new Date(baseDate.getTime())
    d.setMonth(d.getMonth() + currentMonthOffset)
    const y = d.getFullYear()
    const m = d.getMonth()

    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const totalDays = lastDay.getDate()

    // Monday=0 ... Sunday=6
    const startOffset = (firstDay.getDay() + 6) % 7

    const days: { dateStr: string; dayNum: number; isFuture: boolean }[] = []
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
      daysInMonth: days,
      startWeekday: startOffset,
    }
  }, [baseDate, currentMonthOffset, todayStr])

  // Count moods this month
  const monthMoodCounts = useMemo(() => {
    const counts: Record<MoodLevel, number> = {
      very_low: 0,
      low: 0,
      neutral: 0,
      good: 0,
      excellent: 0,
    }

    daysInMonth.forEach((d) => {
      const log = moodMap.get(d.dateStr)
      if (log) {
        counts[log.moodLevel] = (counts[log.moodLevel] || 0) + 1
      }
    })

    return counts
  }, [daysInMonth, moodMap])

  return (
    <div className="rounded-2xl bg-white border border-[#E8E6DF] p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#85817D]" />
          <h3 className="text-sm font-bold text-[#33312F]">
            {monthName} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentMonthOffset((prev) => prev - 1)}
            className="p-1 rounded-lg hover:bg-[#FAF9F6] text-[#85817D] hover:text-[#33312F] transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {currentMonthOffset !== 0 && (
            <button
              type="button"
              onClick={() => setCurrentMonthOffset(0)}
              className="text-[11px] font-semibold text-[#85817D] hover:text-[#33312F] px-1.5 py-0.5 rounded hover:bg-[#FAF9F6] cursor-pointer"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => setCurrentMonthOffset((prev) => prev + 1)}
            className="p-1 rounded-lg hover:bg-[#FAF9F6] text-[#85817D] hover:text-[#33312F] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[10px] font-semibold text-[#85817D] uppercase">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Leading empty slots */}
        {Array.from({ length: startWeekday }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-10 rounded-xl" />
        ))}

        {/* Days */}
        {daysInMonth.map((d) => {
          const log = moodMap.get(d.dateStr)
          const isSelected = selectedDate === d.dateStr
          const isToday = todayStr === d.dateStr
          const def = log ? MOOD_DEFINITIONS[log.moodLevel] : null

          return (
            <button
              key={d.dateStr}
              type="button"
              disabled={d.isFuture}
              onClick={() => onSelectDate(d.dateStr)}
              className={cn(
                'relative h-11 rounded-xl border flex flex-col items-center justify-center transition-all select-none',
                d.isFuture
                  ? 'opacity-30 cursor-not-allowed bg-transparent border-transparent'
                  : 'cursor-pointer hover:scale-105',
                def
                  ? cn(def.bgClass, def.borderClass)
                  : 'bg-[#FAF9F6] border-[#E8E6DF] hover:border-[#D1CEBF]',
                isSelected && 'ring-2 ring-[#33312F] scale-105 shadow-xs font-bold',
                isToday && !isSelected && 'ring-1 ring-amber-500'
              )}
              title={
                log
                  ? `${d.dateStr}: ${def?.label} - ${log.emotions.join(', ')}`
                  : `${d.dateStr}: No mood recorded`
              }
            >
              <span className="text-[11px] font-mono leading-none text-[#33312F]">
                {d.dayNum}
              </span>
              {def ? (
                <span className="text-xs leading-none mt-0.5">{def.emoji}</span>
              ) : (
                <span className="w-1 h-1 rounded-full bg-[#D1CEBF] mt-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend & Breakdown */}
      <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between gap-1 flex-wrap text-[11px] text-[#85817D]">
        {(['excellent', 'good', 'neutral', 'low', 'very_low'] as MoodLevel[]).map(
          (level) => {
            const def = MOOD_DEFINITIONS[level]
            const count = monthMoodCounts[level]
            return (
              <div key={level} className="flex items-center gap-1">
                <span>{def.emoji}</span>
                <span>{def.label}:</span>
                <span className="font-semibold text-[#33312F]">{count}</span>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}

