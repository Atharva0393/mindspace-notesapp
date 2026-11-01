'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Flame,
  Calendar,
  Sparkles,
  BarChart2,
  Tag,
} from 'lucide-react'
import { JournalEntry, MoodLog, MOOD_DEFINITIONS, MoodLevel } from '@/types/journal'
import { cn } from '@/lib/utils'

export interface JournalAnalyticsProps {
  entries: JournalEntry[]
  moodLogs: MoodLog[]
}

export function JournalAnalytics({ entries, moodLogs }: JournalAnalyticsProps) {
  // 1. Calculate Journaling Streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0

    const dateSet = new Set<string>()
    entries.forEach((e) => dateSet.add(e.entryDate))

    let currentStreak = 0
    const cursor = new Date()

    // Check today
    const todayStr = cursor.toISOString().split('T')[0]
    if (dateSet.has(todayStr)) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      // Check yesterday
      cursor.setDate(cursor.getDate() - 1)
      const yesterdayStr = cursor.toISOString().split('T')[0]
      if (!dateSet.has(yesterdayStr)) {
        return 0
      }
    }

    // Walk backward
    while (true) {
      const dStr = cursor.toISOString().split('T')[0]
      if (dateSet.has(dStr)) {
        currentStreak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }

    return currentStreak
  }, [entries])

  // 2. Mood Distribution
  const moodCounts = useMemo(() => {
    const counts: Record<MoodLevel, number> = {
      very_low: 0,
      low: 0,
      neutral: 0,
      good: 0,
      excellent: 0,
    }

    // Count both mood logs and entries with moods
    const processedDates = new Set<string>()

    moodLogs.forEach((m) => {
      counts[m.moodLevel]++
      processedDates.add(m.logDate)
    })

    entries.forEach((e) => {
      if (e.moodLevel && !processedDates.has(e.entryDate)) {
        counts[e.moodLevel]++
        processedDates.add(e.entryDate)
      }
    })

    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    return { counts, total }
  }, [entries, moodLogs])

  // 3. Top Emotions
  const topEmotions = useMemo(() => {
    const frequency = new Map<string, number>()

    entries.forEach((e) => {
      e.emotions.forEach((emo) => {
        frequency.set(emo, (frequency.get(emo) || 0) + 1)
      })
    })

    moodLogs.forEach((m) => {
      m.emotions.forEach((emo) => {
        frequency.set(emo, (frequency.get(emo) || 0) + 1)
      })
    })

    const sorted = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1])
    return sorted.slice(0, 6)
  }, [entries, moodLogs])

  // 4. Monthly Count
  const entriesThisMonth = useMemo(() => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    return entries.filter((e) => e.entryDate.startsWith(prefix)).length
  }, [entries])

  return (
    <div className="space-y-4">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Entries */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#7A281E]" />
            Total Entries
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {entries.length}
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Reflection Streak
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {streak} <span className="text-sm font-normal text-[#85817D]">days</span>
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#1E3345]" />
            This Month
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {entriesThisMonth} <span className="text-sm font-normal text-[#85817D]">written</span>
          </div>
        </div>

        {/* Mood Check-ins */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#4B3968]" />
            Mood Logs
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {moodLogs.length}
          </div>
        </div>
      </div>

      {/* Mood Distribution & Top Emotions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mood Distribution Bar Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E6DF] shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#E8E6DF]">
            <h4 className="text-xs font-bold text-[#33312F] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-[#85817D]" />
              Mood Distribution
            </h4>
            <span className="text-[11px] text-[#85817D]">
              {moodCounts.total} recorded
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {(['excellent', 'good', 'neutral', 'low', 'very_low'] as MoodLevel[]).map(
              (lvl) => {
                const def = MOOD_DEFINITIONS[lvl]
                const count = moodCounts.counts[lvl]
                const pct =
                  moodCounts.total > 0
                    ? Math.round((count / moodCounts.total) * 100)
                    : 0

                return (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span>{def.emoji}</span>
                        <span className="font-medium text-[#33312F]">{def.label}</span>
                      </span>
                      <span className="text-[11px] text-[#85817D] font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', def.bgClass)}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>

        {/* Most Frequent Emotion Nuances */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E6DF] shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#E8E6DF]">
            <h4 className="text-xs font-bold text-[#33312F] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#85817D]" />
              Emotional Resonance
            </h4>
            <span className="text-[11px] text-[#85817D]">
              Frequency tags
            </span>
          </div>

          <p className="text-xs text-[#85817D] leading-relaxed">
            Emotions you have identified most frequently during your reflections and daily check-ins:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {topEmotions.length === 0 ? (
              <div className="text-xs text-[#85817D] italic">
                No emotion nuances recorded yet. Tag your feelings in your reflections!
              </div>
            ) : (
              topEmotions.map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] text-xs font-medium text-[#33312F]"
                >
                  <span>{tag}</span>
                  <span className="text-[11px] font-mono font-semibold text-[#85817D] bg-white px-1.5 py-0.2 rounded border border-black/5">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

