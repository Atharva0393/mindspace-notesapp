'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  CheckSquare,
  FileText,
} from 'lucide-react'
import { Goal } from '@/types/tasks'
import { PastelColorKey } from '@/lib/constants/colors'
import { cn } from '@/lib/utils'

interface GoalCardProps {
  goal: Goal
  onToggleComplete: (goal: Goal) => void
  onToggleMilestone: (goalId: string, milestoneId: string, isCompleted: boolean) => void
  onEdit: (goal: Goal) => void
  onDelete: (goalId: string) => void
}

const PASTEL_THEMES: Partial<
  Record<
    PastelColorKey,
    { bg: string; border: string; bar: string; badge: string; text: string }
  >
> = {
  powder: {
    bg: 'bg-[#DFEAF2]',
    border: 'border-[#CBDDE9]',
    bar: 'bg-[#8BB5D0]',
    badge: 'bg-[#CBE0EE] text-[#1E3345]',
    text: 'text-[#1E3345]',
  },
  sage: {
    bg: 'bg-[#E3EBDD]',
    border: 'border-[#CCD9C3]',
    bar: 'bg-[#98B88C]',
    badge: 'bg-[#D2E2CA] text-[#283824]',
    text: 'text-[#283824]',
  },
  buttercream: {
    bg: 'bg-[#F4EBD5]',
    border: 'border-[#E5D7B7]',
    bar: 'bg-[#D7BA78]',
    badge: 'bg-[#EBDDBE] text-[#42361D]',
    text: 'text-[#42361D]',
  },
  peach: {
    bg: 'bg-[#F4E4DC]',
    border: 'border-[#E7D0C4]',
    bar: 'bg-[#D9A897]',
    badge: 'bg-[#EBD2C6] text-[#442A20]',
    text: 'text-[#442A20]',
  },
  lavender: {
    bg: 'bg-[#E8E1F4]',
    border: 'border-[#D5CBE5]',
    bar: 'bg-[#B09DC7]',
    badge: 'bg-[#DACCE9] text-[#4B3968]',
    text: 'text-[#4B3968]',
  },
  pink: {
    bg: 'bg-[#F0DFE8]',
    border: 'border-[#DFC6D4]',
    bar: 'bg-[#C996B5]',
    badge: 'bg-[#E6CCD9] text-[#552744]',
    text: 'text-[#552744]',
  },
}

export function GoalCard({
  goal,
  onToggleComplete,
  onToggleMilestone,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = PASTEL_THEMES[goal.colorTheme] || PASTEL_THEMES.powder!

  const totalMilestones = goal.milestones?.length || 0
  const completedMilestones =
    goal.milestones?.filter((m) => m.isCompleted).length || 0

  const calculatedProgress =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : goal.progress || 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-sm',
        theme.bg,
        theme.border,
        goal.isCompleted && 'opacity-75'
      )}
    >
      {/* Top Bar: Category, Target Date, Context Menu */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-black/5',
              theme.badge
            )}
          >
            {goal.category}
          </span>

          {goal.targetDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#605D58] bg-white/60 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3 text-[#85817D]" />
              {goal.targetDate}
            </span>
          )}
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[#605D58] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Goal options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E8E6DF] rounded-xl shadow-lg py-1 z-30 text-xs text-[#33312F]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleComplete(goal)
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#FAF9F6] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#85817D]" />
                  {goal.isCompleted ? 'Mark Active' : 'Mark Completed'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(goal)
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#FAF9F6] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#85817D]" />
                  Edit Goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(goal.id)
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Delete Goal
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content: Title & Description */}
      <div className="space-y-1.5 mb-4">
        <h3
          className={cn(
            'text-base font-semibold tracking-tight text-[#33312F]',
            goal.isCompleted && 'line-through text-[#85817D]'
          )}
        >
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-[#605D58] line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-[#605D58]">
          <span>Progress</span>
          <span className="font-semibold text-[#33312F]">
            {calculatedProgress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculatedProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn('h-full rounded-full', theme.bar)}
          />
        </div>
      </div>

      {/* Milestones Checklist */}
      {totalMilestones > 0 && (
        <div className="space-y-1.5 mb-4 bg-white/50 p-2.5 rounded-xl border border-black/5">
          <div className="text-[11px] font-semibold text-[#605D58] uppercase tracking-wider">
            Milestones ({completedMilestones}/{totalMilestones})
          </div>
          <div className="space-y-1">
            {goal.milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onToggleMilestone(goal.id, m.id, !m.isCompleted)}
                className="w-full text-left flex items-start gap-2 text-xs py-1 px-1 rounded-md hover:bg-white/60 transition-colors cursor-pointer group/m"
              >
                <div
                  className={cn(
                    'w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0',
                    m.isCompleted
                      ? 'bg-[#33312F] border-[#33312F] text-white'
                      : 'border-[#85817D] bg-white group-hover/m:border-[#33312F]'
                  )}
                >
                  {m.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span
                  className={cn(
                    'flex-1 text-xs',
                    m.isCompleted
                      ? 'line-through text-[#85817D]'
                      : 'text-[#33312F]'
                  )}
                >
                  {m.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Linked Tasks and Notes Info */}
      <div className="pt-2 border-t border-black/8 flex items-center justify-between text-xs text-[#605D58]">
        <div className="flex items-center gap-3">
          {goal.tasksCount !== undefined && (
            <span className="flex items-center gap-1 text-[11px]">
              <CheckSquare className="w-3 h-3 text-[#85817D]" />
              {goal.completedTasksCount || 0}/{goal.tasksCount} Tasks
            </span>
          )}
          {goal.linkedNoteIds?.length > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <FileText className="w-3 h-3 text-[#85817D]" />
              {goal.linkedNoteIds.length} Notes
            </span>
          )}
        </div>

        {goal.isCompleted ? (
          <span className="text-[11px] font-semibold text-[#283824] bg-[#E3EBDD] px-2 py-0.5 rounded-md">
            Achieved
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#605D58]">
            In Progress
          </span>
        )}
      </div>
    </motion.div>
  )
}
