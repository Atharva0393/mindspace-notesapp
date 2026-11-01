'use client'

import React from 'react'
import {
  CalendarRange,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { AIWeeklyReview } from '@/types/ai'

interface AIWeeklyReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: AIWeeklyReview | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function AIWeeklyReviewModal({
  isOpen,
  onClose,
  review,
  isLoading = false,
  onRefresh,
}: AIWeeklyReviewModalProps) {
  if (!review) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weekly Productivity Retrospective"
      description={`Mindful synthesis of your workspace activity for ${review.dateRange}.`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Weekly Summary */}
        <div className="rounded-2xl bg-[#FAF9F6] border border-[#EAE6DF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <CalendarRange className="w-5 h-5 text-[#4D327B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817D]">
              Week in Review
            </span>
          </div>
          <p className="text-sm font-medium text-[#33312F] leading-relaxed">{review.summary}</p>
        </div>

        {/* Velocity Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white border border-[#EAE6DF] p-3.5 shadow-xs text-center">
            <div className="text-2xl font-bold text-[#2E6826]">{review.tasksCompletedCount}</div>
            <div className="text-xs text-[#85817D] mt-0.5">Tasks Completed</div>
          </div>
          <div className="rounded-xl bg-white border border-[#EAE6DF] p-3.5 shadow-xs text-center">
            <div className="text-2xl font-bold text-[#A84232]">{review.habitConsistencyRate}%</div>
            <div className="text-xs text-[#85817D] mt-0.5">Habit Consistency</div>
          </div>
          <div className="rounded-xl bg-white border border-[#EAE6DF] p-3.5 shadow-xs text-center">
            <div className="text-2xl font-bold text-[#1E3345]">{review.tasksPendingCount}</div>
            <div className="text-xs text-[#85817D] mt-0.5">Tasks Pending</div>
          </div>
        </div>

        {/* Highlights & Top Habit */}
        <div className="space-y-3">
          {review.topConsistentHabit && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#F4E4DC] bg-[#FAF9F6]">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-[#A84232]" />
                <span className="text-xs font-medium text-[#33312F]">Top Streak Champion:</span>
              </div>
              <PastelBadge variant="peach" size="sm">
                {review.topConsistentHabit}
              </PastelBadge>
            </div>
          )}

          {/* Goal Highlights */}
          {review.goalProgressHighlights.length > 0 && (
            <div className="rounded-xl bg-white border border-[#EAE6DF] p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#33312F]">
                <Target className="w-4 h-4 text-[#1E3345]" />
                Goal Milestones
              </div>
              <ul className="space-y-1.5 text-xs text-[#524F4A]">
                {review.goalProgressHighlights.map((hl, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6826] shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Focus Suggestions for Next Week */}
          {review.suggestedFocusForNextWeek.length > 0 && (
            <div className="rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] p-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#4D327B]">
                <Sparkles className="w-4 h-4" />
                Suggested Focus for the Week Ahead
              </div>
              <ul className="space-y-1.5 text-xs text-[#524F4A]">
                {review.suggestedFocusForNextWeek.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#4D327B] shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EAE6DF]">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={onRefresh}
              isLoading={isLoading}
            >
              Re-analyze
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
            Close Review
          </Button>
        </div>
      </div>
    </Modal>
  )
}
