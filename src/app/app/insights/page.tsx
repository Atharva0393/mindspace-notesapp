import React from 'react'
import { BarChart3 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { EmptyState } from '@/components/ui/empty-state'
import { PastelBadge } from '@/components/ui/pastel-badge'

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Workspace Insights"
        description="Holistic visibility into your habits, task completion velocities, and reflective trends."
        badge={<PastelBadge variant="neutral">Analytics</PastelBadge>}
      />

      <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-8 sm:p-12 shadow-xs">
        <EmptyState
          color="powder"
          icon={<BarChart3 className="w-6 h-6 text-[#1E3345]" />}
          title="Productivity & Mindfulness Metrics"
          description="As you record notes, check off habits, and complete daily plans, your personalized workspace metrics will populate here."
          action={
            <div className="flex items-center gap-2">
              <PastelBadge variant="sage" size="md">
                Habit Adherence
              </PastelBadge>
              <PastelBadge variant="powder" size="md">
                Focus Hours
              </PastelBadge>
              <PastelBadge variant="pink" size="md">
                Mood Distribution
              </PastelBadge>
            </div>
          }
        />
      </div>
    </div>
  )
}
