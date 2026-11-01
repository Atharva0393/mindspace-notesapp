'use client'

import React from 'react'
import { Trophy, TrendingUp, AlertCircle, Target } from 'lucide-react'
import { Habit, HabitLog } from '@/types/habits'
import { ProgressBar } from '@/components/ui/progress-bar'
import { calculateHabitStreaks } from '@/lib/habits/streaks'

export interface HabitAnalyticsProps {
  habits: Habit[]
  logs: HabitLog[]
}

export function HabitAnalytics({ habits, logs }: HabitAnalyticsProps) {
  const stats = React.useMemo(() => {
    if (habits.length === 0) return null

    let totalWeekly = 0
    let totalMonthly = 0
    let bestHabit = habits[0]
    let maxStreak = 0

    const performances = habits.map((h) => {
      const res = calculateHabitStreaks(h, logs)
      totalWeekly += res.weeklyRate
      totalMonthly += res.monthlyRate
      if (res.longestStreak > maxStreak) {
        maxStreak = res.longestStreak
        bestHabit = h
      }
      return {
        habit: h,
        ...res,
      }
    })

    const avgWeekly = Math.round(totalWeekly / habits.length)
    const avgMonthly = Math.round(totalMonthly / habits.length)
    const needsAttention = performances.filter((p) => p.weeklyRate < 60)

    return {
      avgWeekly,
      avgMonthly,
      bestHabit,
      maxStreak,
      needsAttention,
    }
  }, [habits, logs])

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* 1. Weekly Consistency */}
      <div className="bg-white border border-[#EAE6DF] rounded-[18px] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#85817D]">
              7-Day Cadence
            </span>
            <TrendingUp className="w-4 h-4 text-[#3D7535]" />
          </div>
          <div className="text-2xl font-extrabold text-[#33312F]">
            {stats.avgWeekly}%
          </div>
          <p className="text-xs text-[#85817D] mt-0.5">Overall weekly adherence</p>
        </div>
        <div className="pt-3">
          <ProgressBar value={stats.avgWeekly} color="sage" />
        </div>
      </div>

      {/* 2. Monthly Consistency */}
      <div className="bg-white border border-[#EAE6DF] rounded-[18px] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#85817D]">
              30-Day Health
            </span>
            <Target className="w-4 h-4 text-[#213545]" />
          </div>
          <div className="text-2xl font-extrabold text-[#33312F]">
            {stats.avgMonthly}%
          </div>
          <p className="text-xs text-[#85817D] mt-0.5">Monthly consistency rate</p>
        </div>
        <div className="pt-3">
          <ProgressBar value={stats.avgMonthly} color="powder" />
        </div>
      </div>

      {/* 3. Longest Streak */}
      <div className="bg-white border border-[#EAE6DF] rounded-[18px] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#85817D]">
              Top Streak
            </span>
            <Trophy className="w-4 h-4 text-[#B58525]" />
          </div>
          <div className="text-2xl font-extrabold text-[#33312F]">
            {stats.maxStreak} Days
          </div>
          <p className="text-xs text-[#85817D] mt-0.5 truncate">
            {stats.bestHabit.title}
          </p>
        </div>
        <div className="pt-3">
          <ProgressBar value={100} color="buttercream" />
        </div>
      </div>

      {/* 4. Attention Required */}
      <div className="bg-white border border-[#EAE6DF] rounded-[18px] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#85817D]">
              Focus Needed
            </span>
            <AlertCircle className="w-4 h-4 text-[#C95D4A]" />
          </div>
          <div className="text-2xl font-extrabold text-[#33312F]">
            {stats.needsAttention.length}
          </div>
          <p className="text-xs text-[#85817D] mt-0.5">
            {stats.needsAttention.length === 0
              ? 'All habits on track!'
              : `${stats.needsAttention[0]?.habit.title} (<60%)`}
          </p>
        </div>
        <div className="pt-3">
          <ProgressBar
            value={stats.needsAttention.length === 0 ? 100 : 35}
            color={stats.needsAttention.length === 0 ? 'sage' : 'peach'}
          />
        </div>
      </div>
    </div>
  )
}

