'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun, Award, HelpCircle, ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DailyReflection } from '@/types/planner'

export interface DailyReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  dateStr: string
  initialReflection?: DailyReflection | null
  initialEveningReflection?: string | null
  onSaveReflection: (reflection: DailyReflection, eveningReflectionText: string) => void
}

export function DailyReflectionModal({
  isOpen,
  onClose,
  dateStr,
  initialReflection,
  initialEveningReflection,
  onSaveReflection,
}: DailyReflectionModalProps) {
  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatWasDifficult, setWhatWasDifficult] = useState('')
  const [whatAccomplished, setWhatAccomplished] = useState('')
  const [improveTomorrow, setImproveTomorrow] = useState('')
  const [eveningReflection, setEveningReflection] = useState('')

  useEffect(() => {
    if (initialReflection) {
      setWhatWentWell(initialReflection.whatWentWell || '')
      setWhatWasDifficult(initialReflection.whatWasDifficult || '')
      setWhatAccomplished(initialReflection.whatAccomplished || '')
      setImproveTomorrow(initialReflection.improveTomorrow || '')
    } else {
      setWhatWentWell('')
      setWhatWasDifficult('')
      setWhatAccomplished('')
      setImproveTomorrow('')
    }
    setEveningReflection(initialEveningReflection || '')
  }, [initialReflection, initialEveningReflection, isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSaveReflection(
      {
        whatWentWell: whatWentWell.trim() || undefined,
        whatWasDifficult: whatWasDifficult.trim() || undefined,
        whatAccomplished: whatAccomplished.trim() || undefined,
        improveTomorrow: improveTomorrow.trim() || undefined,
      },
      eveningReflection.trim()
    )
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8E1F4] border border-[#D5CBE5] flex items-center justify-center text-[#4B3968]">
            <Moon className="w-4 h-4" />
          </div>
          <span>Evening Reflection · {dateStr}</span>
        </div>
      }
      description="Pause and unwind. A few minutes of mindful reflection closes today's open loops."
      footer={
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
            Save Reflection
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question 1: What went well? */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] space-y-1.5">
          <label className="text-xs font-semibold text-[#33312F] flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            1. What went well today?
          </label>
          <Textarea
            value={whatWentWell}
            onChange={(e) => setWhatWentWell(e.target.value)}
            placeholder="Moments of clarity, smooth conversations, flow state..."
            rows={2}
          />
        </div>

        {/* Question 2: What was difficult? */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] space-y-1.5">
          <label className="text-xs font-semibold text-[#33312F] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#85817D]" />
            2. What felt difficult or caused friction?
          </label>
          <Textarea
            value={whatWasDifficult}
            onChange={(e) => setWhatWasDifficult(e.target.value)}
            placeholder="Distractions, unexpected blockers, emotional resistance..."
            rows={2}
          />
        </div>

        {/* Question 3: What did I accomplish? */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] space-y-1.5">
          <label className="text-xs font-semibold text-[#33312F] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#283824]" />
            3. What did I accomplish?
          </label>
          <Textarea
            value={whatAccomplished}
            onChange={(e) => setWhatAccomplished(e.target.value)}
            placeholder="Key milestones hit, decisions made, habits sustained..."
            rows={2}
          />
        </div>

        {/* Question 4: How can I improve tomorrow? */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] space-y-1.5">
          <label className="text-xs font-semibold text-[#33312F] flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#1E3345]" />
            4. What is one adjustment to improve tomorrow?
          </label>
          <Textarea
            value={improveTomorrow}
            onChange={(e) => setImproveTomorrow(e.target.value)}
            placeholder="Starting earlier, taking intentional breaks, simplifying tasks..."
            rows={2}
          />
        </div>

        {/* Overall evening summary */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Evening Note & Summary
          </label>
          <Textarea
            value={eveningReflection}
            onChange={(e) => setEveningReflection(e.target.value)}
            placeholder="A sentence or two summarizing how you feel as you wrap up the day..."
            rows={2}
          />
        </div>
      </form>
    </Modal>
  )
}
