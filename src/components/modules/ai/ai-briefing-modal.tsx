'use client'

import React from 'react'
import {
  SunMedium,
  CheckSquare,
  Flame,
  Target,
  Sparkles,
  Quote,
  Compass,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { AIDailyBriefing } from '@/types/ai'

interface AIBriefingModalProps {
  isOpen: boolean
  onClose: () => void
  briefing: AIDailyBriefing | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function AIBriefingModal({
  isOpen,
  onClose,
  briefing,
  isLoading = false,
  onRefresh,
}: AIBriefingModalProps) {
  if (!briefing) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Morning Intelligence Briefing"
      description={`Grounded overview for ${briefing.date} based on your authorized workspace.`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Uplifting Greeting Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F4E4DC]/30 border border-[#EAE6DF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <SunMedium className="w-5 h-5 text-[#A84232]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817D]">
              Morning Pulse
            </span>
          </div>
          <p className="text-base font-medium text-[#33312F] leading-snug">{briefing.greeting}</p>
        </div>

        {/* Planning Suggestion */}
        <div className="rounded-2xl bg-[#E8E1F4]/30 border border-[#E8E1F4] p-4 flex items-start gap-3">
          <Compass className="w-5 h-5 text-[#4D327B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#4D327B] leading-relaxed">
            <span className="font-semibold">Planning Insight:</span> {briefing.planningSuggestion}
          </div>
        </div>

        {/* 3-Column Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Today's Focus Tasks */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#33312F]">
                <CheckSquare className="w-4 h-4 text-[#2E6826]" />
                Focus Tasks
              </div>
              <span className="text-xs text-[#85817D]">{briefing.focusTasks.length}</span>
            </div>

            {briefing.focusTasks.length === 0 ? (
              <p className="text-xs text-[#85817D] italic">No urgent tasks due today.</p>
            ) : (
              <div className="space-y-2">
                {briefing.focusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] text-xs"
                  >
                    <div className="font-medium text-[#33312F] line-clamp-1">{task.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <PastelBadge
                        variant={task.priority === 'Urgent' ? 'peach' : 'buttercream'}
                        size="sm"
                      >
                        {task.priority}
                      </PastelBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Scheduled Habits */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#33312F]">
                <Flame className="w-4 h-4 text-[#A84232]" />
                Today&apos;s Habits
              </div>
              <span className="text-xs text-[#85817D]">{briefing.scheduledHabits.length}</span>
            </div>

            {briefing.scheduledHabits.length === 0 ? (
              <p className="text-xs text-[#85817D] italic">No scheduled habits for today.</p>
            ) : (
              <div className="space-y-2">
                {briefing.scheduledHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="p-2 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] text-xs"
                  >
                    <div className="font-medium text-[#33312F] line-clamp-1">{habit.title}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#85817D]">
                      <span>{habit.category}</span>
                      <span className="text-[#A84232] font-semibold">🔥 {habit.streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Active Goals */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#33312F]">
                <Target className="w-4 h-4 text-[#1E3345]" />
                Active Goals
              </div>
              <span className="text-xs text-[#85817D]">{briefing.activeGoals.length}</span>
            </div>

            {briefing.activeGoals.length === 0 ? (
              <p className="text-xs text-[#85817D] italic">No active goals currently set.</p>
            ) : (
              <div className="space-y-2.5">
                {briefing.activeGoals.map((goal) => (
                  <div key={goal.id} className="text-xs">
                    <div className="flex items-center justify-between text-[#33312F] mb-1">
                      <span className="font-medium line-clamp-1">{goal.title}</span>
                      <span className="font-semibold text-[#85817D]">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#EAE6DF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E3345] rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mindful Note */}
        {briefing.mindfulNote && (
          <div className="rounded-2xl bg-[#FAF9F6] border border-[#EAE6DF] p-4 flex items-start gap-3">
            <Quote className="w-4 h-4 text-[#85817D] shrink-0 mt-0.5" />
            <p className="text-xs text-[#524F4A] italic leading-relaxed">
              {briefing.mindfulNote}
            </p>
          </div>
        )}

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
              Refresh Briefing
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
            Ready to Focus
          </Button>
        </div>
      </div>
    </Modal>
  )
}
