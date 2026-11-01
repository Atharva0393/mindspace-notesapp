'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  StickyNote,
  CheckSquare,
  Target,
  Flame,
  Calendar,
  BookOpen,
  Lock,
  Save,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { AIContextPreferences } from '@/types/ai'

interface AIContextSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: AIContextPreferences
  onSavePreferences: (updated: AIContextPreferences) => void
}

export function AIContextSettingsModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}: AIContextSettingsModalProps) {
  const [prefs, setPrefs] = useState<AIContextPreferences>({ ...preferences })

  const handleToggle = (key: keyof Omit<AIContextPreferences, 'userId' | 'updatedAt'>) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    onSavePreferences(prefs)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Context & Privacy Settings"
      description="Choose which workspace modules the Gemini AI Companion can access during search and conversations."
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Privacy Note Banner */}
        <div className="rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2E6826] shrink-0 mt-0.5" />
          <div className="text-xs text-[#524F4A] leading-relaxed">
            <span className="font-semibold text-[#33312F]">Zero Cross-User Leakage:</span> Your
            workspace data is protected by PostgreSQL Row-Level Security. Data is only retrieved
            from modules you explicitly authorize below.
          </div>
        </div>

        {/* Module Toggles */}
        <div className="space-y-3">
          {/* Notes */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F4EBD5] flex items-center justify-center text-[#946A1E]">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#33312F]">Intelligent Notes</div>
                <div className="text-xs text-[#85817D]">
                  Include active notes, concepts, and ideas
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeNotes}
              onChange={() => handleToggle('includeNotes')}
            />
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E3EBDD] flex items-center justify-center text-[#2E6826]">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#33312F]">Tasks & Action Items</div>
                <div className="text-xs text-[#85817D]">
                  Allow querying priorities, deadlines, and project tasks
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeTasks}
              onChange={() => handleToggle('includeTasks')}
            />
          </div>

          {/* Goals */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#DFEAF2] flex items-center justify-center text-[#1E3345]">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#33312F]">Goals & Milestones</div>
                <div className="text-xs text-[#85817D]">
                  Enable goal progress summaries and milestone checks
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeGoals}
              onChange={() => handleToggle('includeGoals')}
            />
          </div>

          {/* Habits */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F4E4DC] flex items-center justify-center text-[#A84232]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#33312F]">Habits & Streaks</div>
                <div className="text-xs text-[#85817D]">
                  Allow tracking habit consistency and today&apos;s routine
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeHabits}
              onChange={() => handleToggle('includeHabits')}
            />
          </div>

          {/* Daily Plans */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8E1F4] flex items-center justify-center text-[#4D327B]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#33312F]">Daily Planner & Blocks</div>
                <div className="text-xs text-[#85817D]">
                  Analyze daily intentions and scheduled timeline blocks
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeDailyPlans}
              onChange={() => handleToggle('includeDailyPlans')}
            />
          </div>

          {/* STRICT PRIVACY RULE: Mindful Journal (Disabled by default) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border-2 border-[#E8E1F4] bg-[#FAF9F6] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0DFE8] flex items-center justify-center text-[#73355A]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#33312F]">Mindful Journal</span>
                  <PastelBadge variant="pink" size="sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Private by Default
                  </PastelBadge>
                </div>
                <div className="text-xs text-[#85817D] mt-0.5">
                  Keep personal diaries and reflections strictly unindexed until explicitly enabled
                </div>
              </div>
            </div>
            <Switch
              checked={prefs.includeJournal}
              onChange={() => handleToggle('includeJournal')}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE6DF]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
          >
            Save AI Preferences
          </Button>
        </div>
      </div>
    </Modal>
  )
}
