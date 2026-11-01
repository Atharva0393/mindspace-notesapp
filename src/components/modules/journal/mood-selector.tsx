'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Plus, Tag } from 'lucide-react'
import {
  MoodLevel,
  MoodLog,
  MoodLogInput,
  MOOD_DEFINITIONS,
  COMMON_EMOTION_TAGS,
} from '@/types/journal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MoodSelectorProps {
  initialMoodLog?: MoodLog | null
  selectedDate: string
  onSaveMood: (input: MoodLogInput) => void
  onCancel?: () => void
  compact?: boolean
}

const MOODS: MoodLevel[] = ['very_low', 'low', 'neutral', 'good', 'excellent']

export function MoodSelector({
  initialMoodLog,
  selectedDate,
  onSaveMood,
  onCancel,
  compact = false,
}: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(
    initialMoodLog?.moodLevel || 'good'
  )
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    initialMoodLog?.emotions || []
  )
  const [note, setNote] = useState<string>(initialMoodLog?.note || '')
  const [customTagInput, setCustomTagInput] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  useEffect(() => {
    if (initialMoodLog) {
      setSelectedMood(initialMoodLog.moodLevel)
      setSelectedEmotions(initialMoodLog.emotions || [])
      setNote(initialMoodLog.note || '')
    } else {
      setSelectedMood('good')
      setSelectedEmotions([])
      setNote('')
    }
  }, [initialMoodLog, selectedDate])

  function toggleEmotion(emotion: string) {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion))
    } else {
      setSelectedEmotions([...selectedEmotions, emotion])
    }
  }

  function handleAddCustomTag(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = customTagInput.trim()
    if (!trimmed) return
    if (!selectedEmotions.includes(trimmed)) {
      setSelectedEmotions([...selectedEmotions, trimmed])
    }
    setCustomTagInput('')
    setIsAddingTag(false)
  }

  function handleSave() {
    const meta = MOOD_DEFINITIONS[selectedMood]
    onSaveMood({
      logDate: selectedDate,
      moodLevel: selectedMood,
      moodScore: meta.score,
      emotions: selectedEmotions,
      note: note.trim() || null,
    })
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-[#E8E6DF] shadow-2xs space-y-4',
        compact ? 'p-3.5' : 'p-5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F4E4DC] text-[#7A281E] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#33312F]">
            {initialMoodLog ? 'Today’s Mood & Resonance' : 'How are you feeling today?'}
          </h3>
        </div>
        <span className="text-xs text-[#85817D] font-mono">{selectedDate}</span>
      </div>

      {/* 5 Mood Levels */}
      <div>
        <label className="block text-xs font-semibold text-[#85817D] uppercase tracking-wider mb-2">
          Select Primary Mood
        </label>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((level) => {
            const def = MOOD_DEFINITIONS[level]
            const isSelected = selectedMood === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedMood(level)}
                className={cn(
                  'flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all cursor-pointer select-none',
                  def.bgClass,
                  def.borderClass,
                  isSelected
                    ? 'ring-2 ring-[#33312F] scale-105 shadow-xs font-semibold'
                    : 'opacity-70 hover:opacity-100 hover:scale-102'
                )}
                title={`${def.label} (Score: ${def.score})`}
              >
                <span className="text-2xl mb-1">{def.emoji}</span>
                <span className={cn('text-[11px] font-medium text-center', def.textClass)}>
                  {def.label}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="activeMoodDot"
                    className="w-1.5 h-1.5 rounded-full bg-[#33312F] mt-1"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Emotion Chips Multiselect */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#85817D] uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            Emotion Nuances ({selectedEmotions.length})
          </label>
          {!isAddingTag && (
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              className="text-[11px] text-[#85817D] hover:text-[#33312F] flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add custom
            </button>
          )}
        </div>

        {isAddingTag && (
          <form onSubmit={handleAddCustomTag} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="e.g. Hopeful, Inspired..."
              className="flex-1 text-xs px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] text-[#33312F] outline-none"
              autoFocus
            />
            <Button size="sm" variant="secondary" type="submit">
              Add
            </Button>
            <button
              type="button"
              onClick={() => setIsAddingTag(false)}
              className="text-xs text-[#85817D] hover:text-[#33312F] px-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_EMOTION_TAGS.map((tag) => {
            const isSelected = selectedEmotions.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleEmotion(tag)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1',
                  isSelected
                    ? 'bg-[#33312F] text-white border-[#33312F] shadow-xs'
                    : 'bg-[#FAF9F6] text-[#605D58] border-[#E8E6DF] hover:border-[#D1CEBF]'
                )}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{tag}</span>
              </button>
            )
          })}
          {selectedEmotions
            .filter((tag) => !COMMON_EMOTION_TAGS.includes(tag as (typeof COMMON_EMOTION_TAGS)[number]))
            .map((customTag) => (
              <button
                key={customTag}
                type="button"
                onClick={() => toggleEmotion(customTag)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#33312F] text-white border border-[#33312F] shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>{customTag}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Short Context / Note */}
      <div>
        <label className="block text-xs font-semibold text-[#85817D] uppercase tracking-wider mb-1">
          Short Context <span className="font-normal lowercase">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A quick sentence on what influenced your mood today..."
          className="w-full text-xs px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] text-[#33312F] outline-none placeholder:text-[#85817D]"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E8E6DF]">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={handleSave}>
          {initialMoodLog ? 'Update Mood' : 'Record Mood'}
        </Button>
      </div>
    </div>
  )
}
